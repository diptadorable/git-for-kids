/**
 * Hand-ported goal assertions.
 *
 * Upstream stores these as JavaScript functions on the level object. Functions
 * cannot survive JSON import (they become null, which would make the level
 * pass unconditionally), so the four levels that use them are ported here as
 * real typed predicates. scripts/import-levels.mjs keeps the original source
 * text alongside, and the conformance runner fails if a level ships asserts we
 * have not ported -- so upstream drift cannot pass silently.
 */

/**
 * `data` maps each base commit ref reachable from the branch to how many copy
 * marks it carries (C2 -> 0, C2' -> 1, C2'' -> 2, C2'^4 -> 4), plus
 * `__num_commits_upstream`, the number of commits walked.
 */
export type AssertData = Record<string, number> & {
  __num_commits_upstream: number;
};

export type AssertFn = (data: AssertData) => boolean;

export const LEVEL_ASSERTS: Record<string, Record<string, AssertFn[]>> = {
  // "git commit" until the branch is more than 5 commits past its tag.
  describe: {
    bugfix: [(data) => data.__num_commits_upstream > 5],
  },
  // C4 must have been copied more times than C1 -- i.e. you rebased C4 over.
  grabbingOneCommit: {
    main: [(data) => data.C4 > data.C1],
  },
  // C2 must carry more copy marks than both C3 and C1.
  jugglingCommits: {
    main: [(data) => data.C2 > data.C3, (data) => data.C2 > data.C1],
  },
  jugglingCommits2: {
    main: [(data) => data.C2 > data.C3, (data) => data.C2 > data.C1],
  },
};
