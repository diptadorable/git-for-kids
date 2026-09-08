/**
 * Parity check against learnGitBranching.
 *
 * Every level ships an official solutionCommand and a goalTreeString. Running
 * each solution through our engine and grading the result with our port of
 * TreeCompare proves the two behave the same -- if a level fails here, our
 * engine diverges from upstream, not the other way round.
 *
 * Usage: npm run conformance [-- <levelId>]
 */
import levelData from '../data/levels.json';
import { GitRepo } from '../lib/git/repo';
import { runCommands } from '../lib/git/commands';
import { isLevelSolved, type LevelBlob } from '../lib/git/treeCompare';
import { LEVEL_ASSERTS } from '../lib/git/asserts';
import type { Tree } from '../lib/git/types';

interface LevelJson extends LevelBlob {
  id: string;
  sequence: string;
  name: string;
  startTree?: string;
  usesDefaultTree?: boolean;
  goalTreeString: string;
  solutionCommand: string;
  goalAsserts?: Record<string, string[]>;
}

const levels = levelData.levels as unknown as LevelJson[];
const only = process.argv[2];
const selected = only ? levels.filter((l) => l.id === only) : levels;

if (selected.length === 0) {
  console.error(`No level matching "${only}"`);
  process.exit(1);
}

const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const DIM = '\x1b[2m';
const RESET = '\x1b[0m';

interface Failure {
  id: string;
  sequence: string;
  reason: string;
  detail?: string;
}

const failures: Failure[] = [];
let passed = 0;

/** Compact one-line view of a tree, for diffing a failure by eye. */
function summarize(tree: Tree): string {
  const refs = Object.entries(tree.branches)
    .map(([name, b]) => `${name}->${b.target}`)
    .sort()
    .join(' ');
  const tags = Object.entries(tree.tags ?? {})
    .map(([name, t]) => `${name}->${t.target}`)
    .sort()
    .join(' ');
  const commits = Object.keys(tree.commits).sort().join(',');
  const parts = [`HEAD->${tree.HEAD.target}`, refs];
  if (tags) parts.push(`tags[${tags}]`);
  parts.push(`commits[${commits}]`);
  if (tree.workingChanges) parts.push(`wc${JSON.stringify(tree.workingChanges)}`);
  if (tree.originTree) {
    const o = Object.entries(tree.originTree.branches)
      .map(([n, b]) => `${n}->${b.target}`)
      .sort()
      .join(' ');
    parts.push(`origin{${o} commits[${Object.keys(tree.originTree.commits).sort().join(',')}]}`);
  }
  return parts.join(' | ');
}

for (const level of selected) {
  // A level shipping asserts we have not ported would grade as an easy pass.
  if (level.goalAsserts && !LEVEL_ASSERTS[level.id]) {
    failures.push({
      id: level.id,
      sequence: level.sequence,
      reason: 'level has goalAsserts with no ported implementation in asserts.ts',
    });
    continue;
  }

  let repo: GitRepo;
  try {
    repo = level.startTree ? GitRepo.fromTree(level.startTree) : GitRepo.fromDefault();
  } catch (err) {
    failures.push({
      id: level.id,
      sequence: level.sequence,
      reason: `could not load startTree: ${(err as Error).message}`,
    });
    continue;
  }

  try {
    runCommands(repo, level.solutionCommand);
  } catch (err) {
    failures.push({
      id: level.id,
      sequence: level.sequence,
      reason: `solution threw: ${(err as Error).message}`,
      detail: `  solution: ${level.solutionCommand}`,
    });
    continue;
  }

  const actual = repo.toTree();
  let solved = false;
  try {
    solved = isLevelSolved(level, actual);
  } catch (err) {
    failures.push({
      id: level.id,
      sequence: level.sequence,
      reason: `grading threw: ${(err as Error).message}`,
    });
    continue;
  }

  if (solved) {
    passed++;
  } else {
    failures.push({
      id: level.id,
      sequence: level.sequence,
      reason: 'solution ran but the goal tree did not match',
      detail:
        `  solution: ${level.solutionCommand}\n` +
        `  ${DIM}want:${RESET} ${summarize(JSON.parse(level.goalTreeString))}\n` +
        `  ${DIM}got :${RESET} ${summarize(actual)}`,
    });
  }
}

console.log();
for (const f of failures) {
  console.log(`${RED}FAIL${RESET} ${f.sequence}/${f.id} -- ${f.reason}`);
  if (f.detail) console.log(f.detail);
}

const total = selected.length;
console.log();
console.log(
  `${passed === total ? GREEN : RED}${passed}/${total} levels reproduce ` +
    `learnGitBranching's goal tree from its own solution.${RESET}`,
);

process.exit(failures.length === 0 ? 0 : 1);
