import type { Tree } from '../git/types';

/**
 * Turns a commit tree into drawable coordinates.
 *
 * Time flows UPWARD (the root sits at the bottom) and each branch gets its own
 * column, which is what makes a rebase read as "the branch picked itself up
 * and moved across" rather than as an unrelated redraw.
 */

export interface LaidOutCommit {
  id: string;
  x: number;
  y: number;
  /** Column index, used to pick a colour. */
  lane: number;
  isHead: boolean;
  /** A copy made by rebase/cherry-pick (C2'), drawn with a lighter fill. */
  isCopy: boolean;
  changedFiles?: string[];
}

export interface LaidOutEdge {
  id: string;
  fromId: string;
  toId: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface LaidOutLabel {
  id: string;
  /** The commit this label rides on, so it follows during animation. */
  commitId: string;
  text: string;
  kind: 'branch' | 'tag' | 'head' | 'remote';
  x: number;
  y: number;
  /** Stacking order when several labels sit on the same commit. */
  slot: number;
  isCheckedOut: boolean;
}

export interface GraphLayout {
  commits: LaidOutCommit[];
  edges: LaidOutEdge[];
  labels: LaidOutLabel[];
  width: number;
  height: number;
}

export const COL_WIDTH = 92;
export const ROW_HEIGHT = 78;
const PAD_X = 60;
const PAD_Y = 56;

/** Longest distance from a root, so a child never sits above its parent. */
function computeDepths(tree: Tree): Map<string, number> {
  const depths = new Map<string, number>();

  const depthOf = (id: string, seen: Set<string>): number => {
    const cached = depths.get(id);
    if (cached !== undefined) return cached;
    if (seen.has(id)) return 0; // cycles cannot happen, but never hang on one
    seen.add(id);

    const commit = tree.commits[id];
    const parents = commit?.parents ?? [];
    const depth = parents.length === 0
      ? 0
      : Math.max(...parents.map((p) => depthOf(p, seen))) + 1;

    depths.set(id, depth);
    return depth;
  };

  for (const id of Object.keys(tree.commits)) depthOf(id, new Set());
  return depths;
}

/**
 * Order branches so the layout is stable as the player works: main owns the
 * trunk, remote-tracking branches sit out on the right, everything else is
 * alphabetical so columns do not jump around between commands.
 */
function orderedBranchNames(tree: Tree): string[] {
  const names = Object.keys(tree.branches);
  const rank = (name: string) => {
    if (name === 'main' || name === 'master') return 0;
    if (name.startsWith('o/')) return 2;
    return 1;
  };
  return names.sort((a, b) => rank(a) - rank(b) || a.localeCompare(b));
}

export function layoutTree(tree: Tree): GraphLayout {
  const depths = computeDepths(tree);
  const maxDepth = Math.max(0, ...depths.values());
  const lanes = new Map<string, number>();
  let nextLane = 0;

  // Walk each branch back through first parents, claiming a column for the
  // commits it introduced. Shared history keeps the earlier branch's column.
  for (const name of orderedBranchNames(tree)) {
    const branch = tree.branches[name];
    let cursor: string | undefined = branch?.target;
    let lane: number | null = null;
    const guard = new Set<string>();

    while (cursor && tree.commits[cursor] && !guard.has(cursor)) {
      guard.add(cursor);
      if (lanes.has(cursor)) break; // joined existing history -- stop claiming
      if (lane === null) lane = nextLane++;
      lanes.set(cursor, lane);
      cursor = tree.commits[cursor].parents[0];
    }
  }

  // Anything unreachable from a branch (e.g. left behind by a reset) still
  // needs a home so it can be drawn faded rather than vanish.
  for (const id of Object.keys(tree.commits)) {
    if (!lanes.has(id)) lanes.set(id, nextLane++);
  }

  const headCommitId = tree.branches[tree.HEAD.target]
    ? tree.branches[tree.HEAD.target].target
    : tree.HEAD.target;

  const xOf = (id: string) => PAD_X + (lanes.get(id) ?? 0) * COL_WIDTH;
  const yOf = (id: string) => PAD_Y + (maxDepth - (depths.get(id) ?? 0)) * ROW_HEIGHT;

  const commits: LaidOutCommit[] = Object.keys(tree.commits).map((id) => ({
    id,
    x: xOf(id),
    y: yOf(id),
    lane: lanes.get(id) ?? 0,
    isHead: id === headCommitId,
    isCopy: /'/.test(id),
    changedFiles: tree.commits[id].changedFiles,
  }));

  const edges: LaidOutEdge[] = [];
  for (const commit of Object.values(tree.commits)) {
    for (const parentId of commit.parents) {
      if (!tree.commits[parentId]) continue;
      edges.push({
        id: `${commit.id}->${parentId}`,
        fromId: commit.id,
        toId: parentId,
        x1: xOf(commit.id),
        y1: yOf(commit.id),
        x2: xOf(parentId),
        y2: yOf(parentId),
      });
    }
  }

  // Stack labels above their commit, newest-looking ones first.
  const labels: LaidOutLabel[] = [];
  const slotFor = new Map<string, number>();
  const takeSlot = (commitId: string) => {
    const slot = slotFor.get(commitId) ?? 0;
    slotFor.set(commitId, slot + 1);
    return slot;
  };

  for (const name of orderedBranchNames(tree)) {
    const branch = tree.branches[name];
    if (!tree.commits[branch.target]) continue;
    labels.push({
      id: `branch:${name}`,
      commitId: branch.target,
      text: name,
      kind: name.startsWith('o/') ? 'remote' : 'branch',
      x: xOf(branch.target),
      y: yOf(branch.target),
      slot: takeSlot(branch.target),
      isCheckedOut: tree.HEAD.target === name,
    });
  }

  for (const [name, tag] of Object.entries(tree.tags ?? {})) {
    if (!tree.commits[tag.target]) continue;
    labels.push({
      id: `tag:${name}`,
      commitId: tag.target,
      text: name,
      kind: 'tag',
      x: xOf(tag.target),
      y: yOf(tag.target),
      slot: takeSlot(tag.target),
      isCheckedOut: false,
    });
  }

  // A detached HEAD gets its own label so the player can see where they are.
  if (!tree.branches[tree.HEAD.target] && tree.commits[headCommitId]) {
    labels.push({
      id: 'head',
      commitId: headCommitId,
      text: 'HEAD',
      kind: 'head',
      x: xOf(headCommitId),
      y: yOf(headCommitId),
      slot: takeSlot(headCommitId),
      isCheckedOut: true,
    });
  }

  return {
    commits,
    edges,
    labels,
    width: PAD_X * 2 + Math.max(1, nextLane) * COL_WIDTH,
    height: PAD_Y * 2 + (maxDepth + 1) * ROW_HEIGHT,
  };
}
