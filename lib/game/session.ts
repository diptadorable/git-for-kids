import { GitRepo } from '../git/repo';
import { runCommand } from '../git/commands';
import { GitError, type Tree } from '../git/types';
import { isLevelSolved, type LevelBlob } from '../git/treeCompare';

export interface Level extends LevelBlob {
  id: string;
  sequence: string;
  order: number;
  name: string;
  hint?: string;
  startTree?: string;
  usesDefaultTree?: boolean;
  goalTreeString: string;
  solutionCommand: string;
  /** Commands this level forbids, e.g. `{"git checkout": true}`. */
  disabledMap?: Record<string, unknown>;
  startDialog?: { childViews?: unknown[] };
}

export type LogKind = 'command' | 'output' | 'error' | 'win';

export interface LogEntry {
  id: number;
  kind: LogKind;
  text: string;
}

export interface PendingRebase {
  targetRef: string;
  sourceRef?: string;
  commits: string[];
}

export interface SessionState {
  tree: Tree;
  log: LogEntry[];
  solved: boolean;
  /** Snapshots for undo, most recent last. */
  past: Tree[];
  commandCount: number;
  pending: PendingRebase | null;
}

export function startingTree(level: Level): Tree {
  const repo = level.startTree
    ? GitRepo.fromTree(level.startTree)
    : GitRepo.fromDefault();
  return repo.toTree();
}

export function initSession(level: Level): SessionState {
  return {
    tree: startingTree(level),
    log: [],
    solved: false,
    past: [],
    commandCount: 0,
    pending: null,
  };
}

let logId = 0;
const entry = (kind: LogKind, text: string): LogEntry => ({
  id: ++logId,
  kind,
  text,
});

/**
 * Levels forbid the commands that would trivially skip the lesson (you cannot
 * `git checkout` your way through the branching level). Upstream keys these by
 * the two-word command, so match on that.
 */
function disabledReason(level: Level, line: string): string | null {
  if (!level.disabledMap) return null;
  const words = line.trim().split(/\s+/);
  const twoWord = words.slice(0, 2).join(' ');
  if (Object.prototype.hasOwnProperty.call(level.disabledMap, twoWord)) {
    return `"${twoWord}" is switched off for this level -- solve it another way!`;
  }
  return null;
}

export interface ApplyResult {
  state: SessionState;
  /** True when this command is what tipped the level into being solved. */
  justSolved: boolean;
}

/** Run one player command and produce the next session state. */
export function applyCommand(
  level: Level,
  state: SessionState,
  line: string,
): ApplyResult {
  const trimmed = line.trim();
  if (!trimmed) return { state, justSolved: false };

  const log = [...state.log, entry('command', trimmed)];

  const blocked = disabledReason(level, trimmed);
  if (blocked) {
    return {
      state: { ...state, log: [...log, entry('error', blocked)] },
      justSolved: false,
    };
  }

  // Local built-ins that are not git commands.
  if (trimmed === 'reset' || trimmed === 'undo') {
    return { state: { ...state, log }, justSolved: false };
  }

  const repo = GitRepo.fromTree(state.tree);
  let result;
  try {
    result = runCommand(repo, trimmed);
  } catch (err) {
    const message =
      err instanceof GitError ? err.message : `Something went wrong: ${String(err)}`;
    return {
      state: { ...state, log: [...log, entry('error', message)] },
      justSolved: false,
    };
  }

  // `git rebase -i` pauses here so the player can arrange the commits.
  if (result.interactive) {
    return {
      state: { ...state, log, pending: result.interactive },
      justSolved: false,
    };
  }

  const tree = repo.toTree();
  const solved = isLevelSolved(level, tree);
  const justSolved = solved && !state.solved;

  return {
    state: {
      tree,
      log: [
        ...log,
        ...result.output.map((line) => entry('output', line)),
        ...(justSolved ? [entry('win', 'Level complete!')] : []),
      ],
      solved: solved || state.solved,
      past: [...state.past, state.tree],
      commandCount: state.commandCount + 1,
      pending: null,
    },
    justSolved,
  };
}

/** Finish a paused `git rebase -i` with the order the player chose. */
export function applyInteractiveRebase(
  level: Level,
  state: SessionState,
  chosen: string[],
): ApplyResult {
  if (!state.pending) return { state, justSolved: false };

  const repo = GitRepo.fromTree(state.tree);
  const { targetRef, sourceRef } = state.pending;
  try {
    repo.rebaseInteractive(targetRef, chosen, sourceRef ?? 'HEAD');
  } catch (err) {
    const message = err instanceof GitError ? err.message : String(err);
    return {
      state: { ...state, pending: null, log: [...state.log, entry('error', message)] },
      justSolved: false,
    };
  }

  const tree = repo.toTree();
  const solved = isLevelSolved(level, tree);
  const justSolved = solved && !state.solved;

  return {
    state: {
      tree,
      log: [
        ...state.log,
        entry('output', `Rebased ${chosen.length} commit(s) onto ${targetRef}`),
        ...(justSolved ? [entry('win', 'Level complete!')] : []),
      ],
      solved: solved || state.solved,
      past: [...state.past, state.tree],
      commandCount: state.commandCount + 1,
      pending: null,
    },
    justSolved,
  };
}

export function undo(state: SessionState): SessionState {
  if (state.past.length === 0) return state;
  const past = [...state.past];
  const tree = past.pop()!;
  return {
    ...state,
    tree,
    past,
    pending: null,
    log: [...state.log, entry('output', 'Undid the last command.')],
  };
}

export function resetLevel(level: Level, state: SessionState): SessionState {
  return {
    ...initSession(level),
    log: [...state.log, entry('output', 'Level reset.')],
  };
}

/** The goal tree, for the "what am I aiming at?" preview. */
export function goalTree(level: Level): Tree {
  return JSON.parse(level.goalTreeString) as Tree;
}
