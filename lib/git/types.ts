/**
 * The tree format is inherited verbatim from learnGitBranching (MIT, (c) Peter
 * Cottle) so that its 36 level definitions -- start trees, goal trees and
 * official solution commands -- drop in unchanged and can be used as a
 * conformance suite against this engine. Do not rename these fields.
 */

export interface Commit {
  id: string;
  parents: string[];
  rootCommit?: boolean;
  commitMessage?: string;
  author?: string;
  createTime?: string;
  type?: 'commit';
  /** Files this commit introduced -- only used by the staging/restore levels. */
  changedFiles?: string[];
}

/** A file's state in the working directory, for the staging-area levels. */
export type FileState = 'modified' | 'staged';

export interface BranchRef {
  id: string;
  target: string;
  /** Set on a local branch that tracks a remote one, e.g. main -> "o/main". */
  remoteTrackingBranchID?: string | null;
  type?: 'branch';
}

export interface TagRef {
  id: string;
  target: string;
  type?: 'tag';
}

export interface HeadRef {
  id: 'HEAD';
  /** A branch name when attached, or a commit id when detached. */
  target: string;
  type?: 'general ref';
}

export interface Tree {
  branches: Record<string, BranchRef>;
  tags?: Record<string, TagRef>;
  commits: Record<string, Commit>;
  HEAD: HeadRef;
  /** Remote levels nest the origin repository here. */
  originTree?: Tree;
  /** Set on levels that begin before `git clone` has been run. */
  clonePending?: boolean;
  /** Uncommitted files, keyed by name. Absent when nothing is outstanding. */
  workingChanges?: Record<string, FileState>;
}

/** Upstream's Graph.getDefaultTree() -- used by levels that omit startTree. */
export const DEFAULT_TREE: Tree = {
  branches: { main: { target: 'C1', id: 'main', type: 'branch' } },
  commits: {
    C0: { type: 'commit', parents: [], id: 'C0', rootCommit: true },
    C1: { type: 'commit', parents: ['C0'], id: 'C1' },
  },
  HEAD: { id: 'HEAD', target: 'main', type: 'general ref' },
};

/** Thrown for player mistakes; the message is shown in the game terminal. */
export class GitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GitError';
  }
}
