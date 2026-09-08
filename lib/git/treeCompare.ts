import type { Tree, Commit } from './types';
import { LEVEL_ASSERTS, type AssertData } from './asserts';

/**
 * Faithful port of learnGitBranching's TreeCompare (MIT, (c) Peter Cottle).
 *
 * Grading is deliberately NOT whole-tree equality: it walks back from each
 * branch the goal names, so unreachable commits left behind by `reset` are
 * ignored, and extra branches you created are tolerated unless the level opts
 * into cleanup enforcement.
 */

/** The grading flags a level can carry. Each selects a comparison strategy. */
export interface LevelBlob {
  id?: string;
  compareOnlyMain?: boolean;
  compareOnlyMainHashAgnostic?: boolean;
  compareOnlyMainHashAgnosticWithAsserts?: boolean;
  compareOnlyBranches?: boolean;
  compareAllBranchesHashAgnostic?: boolean;
  compareAllBranchesAndEnforceBranchCleanup?: boolean;
  compareWorkingChanges?: boolean;
  onlyEvaluateAsserts?: boolean;
  goalAsserts?: Record<string, string[]>;
  originCompare?: LevelBlob;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (a === null || b === null || a === undefined || b === undefined) return false;
  if (typeof a !== 'object' || typeof b !== 'object') return false;

  if (Array.isArray(a) !== Array.isArray(b)) return false;
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    return a.every((item, i) => deepEqual(item, b[i]));
  }
  const ka = Object.keys(a as object);
  const kb = Object.keys(b as object);
  if (ka.length !== kb.length) return false;
  return ka.every(
    (k) =>
      Object.prototype.hasOwnProperty.call(b, k) &&
      deepEqual((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k]),
  );
}

/** C1 -> C1, C1'' -> C1, C1'^3 -> C1 */
export function getBaseRef(ref: string): string {
  const m = /^C(\d+)/.exec(ref);
  if (!m) throw new Error(`no regex match for ${ref}`);
  return 'C' + m[1];
}

/** How many times a commit has been copied: C1 -> 0, C1'' -> 2, C1'^4 -> 4 */
export function getNumHashes(ref: string): number {
  let m = /^C(\d+)('{0,3})$/.exec(ref);
  if (m) return m[2] ? m[2].length : 0;
  m = /^C(\d+)'\^(\d+)$/.exec(ref);
  if (m) return Number(m[2]);
  throw new Error(`couldn't parse ref ${ref}`);
}

/** Branch names and HEAD are compared case-insensitively; commit ids are not. */
function lowercaseTree(tree: Tree): Tree {
  if (tree.HEAD) tree.HEAD.target = tree.HEAD.target.toLocaleLowerCase();

  const branches = tree.branches ?? {};
  tree.branches = {};
  for (const name of Object.keys(branches)) {
    const branch = branches[name];
    branch.id = branch.id.toLocaleLowerCase();
    tree.branches[name.toLocaleLowerCase()] = branch;
  }
  return tree;
}

function convertTreeSafe(tree: Tree | string): Tree {
  if (typeof tree !== 'string') return tree;
  let text = tree.trim();
  if (!text.startsWith('{')) text = decodeURIComponent(text);
  const parsed: Tree = JSON.parse(text);
  lowercaseTree(parsed);
  if (parsed.originTree) lowercaseTree(parsed.originTree);
  return parsed;
}

/**
 * Strip everything grading does not look at (author, createTime, message,
 * type) and normalize what remains, so cosmetic differences never fail a
 * level. Mutates in place, and is idempotent.
 */
function reduceTreeFields(trees: Tree[]) {
  const commitSaveFields = ['parents', 'id', 'rootCommit', 'changedFiles'] as const;
  const branchSaveFields = ['target', 'id', 'remoteTrackingBranchID'] as const;
  const tagSaveFields = ['target', 'id'] as const;
  const commitSortFields = ['children', 'parents', 'changedFiles'];
  const defaults: Record<string, unknown> = { remoteTrackingBranchID: null };

  for (const tree of trees) {
    if (tree.tags === undefined) tree.tags = {};

    const saveOnly = (
      bag: Record<string, Record<string, unknown>>,
      saveFields: readonly string[],
      sortFields: string[] = [],
    ) => {
      for (const key of Object.keys(bag)) {
        const obj = bag[key];
        const blank: Record<string, unknown> = {};
        for (const field of saveFields) {
          if (obj[field] !== undefined) blank[field] = obj[field];
          else if (defaults[field] !== undefined) blank[field] = defaults[field];
        }
        for (const field of sortFields) {
          if (obj[field]) {
            (obj[field] as string[]).sort();
            blank[field] = obj[field];
          }
        }
        bag[key] = blank;
      }
    };

    saveOnly(
      tree.commits as unknown as Record<string, Record<string, unknown>>,
      commitSaveFields,
      commitSortFields,
    );
    saveOnly(
      tree.branches as unknown as Record<string, Record<string, unknown>>,
      branchSaveFields,
    );
    saveOnly(tree.tags as unknown as Record<string, Record<string, unknown>>, tagSaveFields);

    tree.HEAD = { target: tree.HEAD.target, id: tree.HEAD.id };
    if (tree.originTree) reduceTreeFields([tree.originTree]);
  }
}

type CommitEq = (a: Commit | undefined, b: Commit | undefined) => boolean;

/**
 * Walk two commits in lockstep up their parent chains. Parents were sorted by
 * reduceTreeFields so index lookup is stable; merge commits re-check some
 * nodes, which upstream accepts rather than doing a real graph search.
 */
function makeRecurseCompare(actual: Tree, goal: Tree, isEqual?: CommitEq) {
  const compare = (a: Commit | undefined, b: Commit | undefined): boolean => {
    const equal = isEqual ? isEqual(a, b) : deepEqual(a, b);
    if (!equal) return false;
    if (!a || !b) return equal;

    let result = true;
    const maxParents = Math.max(a.parents.length, b.parents.length);
    for (let i = 0; i < maxParents; i++) {
      result = result && compare(actual.commits[a.parents[i]], goal.commits[b.parents[i]]);
    }
    return result;
  };
  return compare;
}

/** Ignore how many times a commit was copied -- C2 and C2'' count as equal. */
function makeHashAgnosticCompare(actual: Tree, goal: Tree) {
  const strip = (commit: Commit | undefined) =>
    commit ? { ...commit, id: getBaseRef(commit.id), parents: null } : {};
  return makeRecurseCompare(actual, goal, (a, b) => deepEqual(strip(a), strip(b)));
}

// ---------------------------------------------------------------------------
// Branch comparisons
// ---------------------------------------------------------------------------

function compareBranchWithinTrees(actual: Tree, goal: Tree, branchName: string): boolean {
  const recurse = makeRecurseCompare(actual, goal);
  const a = actual.branches[branchName];
  const b = goal.branches[branchName];
  if (!deepEqual(a, b)) return false;
  return recurse(actual.commits[a.target], goal.commits[b.target]);
}

/** Only branches the GOAL names matter; extra local branches are allowed. */
function compareAllBranchesWithinTrees(actual: Tree, goal: Tree): boolean {
  return Object.keys(goal.branches).every((name) =>
    compareBranchWithinTrees(actual, goal, name),
  );
}

function compareAllTagsWithinTrees(actual: Tree, goal: Tree): boolean {
  return deepEqual(actual.tags, goal.tags);
}

function compareAllBranchesWithinTreesAndHEAD(actual: Tree, goal: Tree): boolean {
  return (
    actual.HEAD.target === goal.HEAD.target &&
    compareAllBranchesWithinTrees(actual, goal) &&
    compareAllTagsWithinTrees(actual, goal)
  );
}

/** Considers branches from BOTH trees, so leftover branches fail the level. */
function compareAllBranchesAndEnforceBranchCleanup(actual: Tree, goal: Tree): boolean {
  const allNames = new Set([
    ...Object.keys(actual.branches),
    ...Object.keys(goal.branches),
  ]);
  return [...allNames].every((name) => compareBranchWithinTrees(actual, goal, name));
}

function compareBranchesHashAgnostic(
  actual: Tree,
  goal: Tree,
  branchNames: string[],
): boolean {
  const recurse = makeHashAgnosticCompare(actual, goal);
  const compareBranchObjs = (a?: Tree['branches'][string], b?: Tree['branches'][string]) => {
    if (!a || !b) return false;
    return deepEqual(
      { ...a, target: getBaseRef(a.target) },
      { ...b, target: getBaseRef(b.target) },
    );
  };

  return branchNames.every((name) => {
    const a = actual.branches[name];
    const b = goal.branches[name];
    if (!compareBranchObjs(a, b)) return false;
    return recurse(actual.commits[a.target], goal.commits[b.target]);
  });
}

function compareAllBranchesHashAgnostic(actual: Tree, goal: Tree): boolean {
  const allNames = new Set([
    ...Object.keys(actual.branches),
    ...Object.keys(goal.branches),
  ]);
  return compareBranchesHashAgnostic(actual, goal, [...allNames]);
}

// ---------------------------------------------------------------------------
// Assertions
// ---------------------------------------------------------------------------

function evalAssertsOnBranch(tree: Tree, branchName: string, levelId: string): boolean {
  const asserts = LEVEL_ASSERTS[levelId]?.[branchName];
  if (!asserts) return false;

  const branch = tree.branches[branchName];
  if (!branch) return false;

  // Deliberately no de-duplication: upstream counts a commit once per path
  // that reaches it, and __num_commits_upstream thresholds depend on that.
  const data = { __num_commits_upstream: 0 } as AssertData;
  const queue = [branch.target];
  let numCommits = 0;
  while (queue.length) {
    const ref = queue.pop()!;
    const commit = tree.commits[ref];
    if (!commit) return false;
    data[getBaseRef(ref)] = getNumHashes(ref);
    queue.push(...commit.parents);
    numCommits++;
  }
  data.__num_commits_upstream = numCommits;

  try {
    return asserts.every((fn) => fn(data));
  } catch {
    return false;
  }
}

function evalAsserts(tree: Tree, blob: LevelBlob, levelId: string): boolean {
  const branches = Object.keys(blob.goalAsserts ?? {});
  if (branches.length === 0) return false;
  return branches.every((name) => evalAssertsOnBranch(tree, name, levelId));
}

// ---------------------------------------------------------------------------
// Dispatch
// ---------------------------------------------------------------------------

function dispatchShallow(
  blob: LevelBlob,
  goal: Tree,
  actual: Tree,
  levelId: string,
): boolean {
  if (blob.compareOnlyMain) return compareBranchWithinTrees(actual, goal, 'main');
  if (blob.compareAllBranchesAndEnforceBranchCleanup) {
    return compareAllBranchesAndEnforceBranchCleanup(actual, goal);
  }
  if (blob.compareOnlyBranches) return compareAllBranchesWithinTrees(actual, goal);
  if (blob.compareAllBranchesHashAgnostic) {
    return compareAllBranchesHashAgnostic(actual, goal);
  }
  if (blob.compareOnlyMainHashAgnostic) {
    return compareBranchesHashAgnostic(actual, goal, ['main']);
  }
  if (blob.compareOnlyMainHashAgnosticWithAsserts) {
    return (
      compareBranchesHashAgnostic(actual, goal, ['main']) &&
      evalAsserts(actual, blob, levelId)
    );
  }
  if (blob.onlyEvaluateAsserts) return evalAsserts(actual, blob, levelId);
  return compareAllBranchesWithinTreesAndHEAD(actual, goal);
}

function compareWorkingChanges(blob: LevelBlob, goal: Tree, actual: Tree): boolean {
  if (!blob.compareWorkingChanges) return true;
  return deepEqual(actual.workingChanges ?? {}, goal.workingChanges ?? {});
}

/**
 * Grade a player's tree against a level's goal. `goalTreeString` and
 * `actualTree` are compared under whichever strategy the level's flags select.
 */
export function isLevelSolved(
  blob: LevelBlob & { goalTreeString: string },
  actualTree: Tree | string,
): boolean {
  const levelId = blob.id ?? '';
  // Clone before reducing -- reduceTreeFields mutates.
  const goal = convertTreeSafe(
    typeof blob.goalTreeString === 'string'
      ? blob.goalTreeString
      : JSON.stringify(blob.goalTreeString),
  );
  const actual = convertTreeSafe(
    typeof actualTree === 'string' ? actualTree : JSON.stringify(actualTree),
  );

  // A level that expects a remote requires you to have one, and vice versa.
  if (typeof goal.originTree !== typeof actual.originTree) return false;

  reduceTreeFields([goal, actual]);

  const shallow =
    dispatchShallow(blob, goal, actual, levelId) &&
    compareWorkingChanges(blob, goal, actual);

  if (!shallow || !goal.originTree || !actual.originTree) return shallow;

  const originBlob = blob.originCompare ?? blob;
  return (
    dispatchShallow(originBlob, goal.originTree, actual.originTree, levelId) &&
    compareWorkingChanges(originBlob, goal.originTree, actual.originTree)
  );
}
