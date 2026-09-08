import {
  type Tree,
  type Commit,
  type BranchRef,
  type TagRef,
  type FileState,
  DEFAULT_TREE,
  GitError,
} from './types';

/**
 * An in-memory model of a git repository, faithful to learnGitBranching's
 * semantics so its level goal-trees grade identically.
 *
 * Deliberately NOT real git: there is no content hashing, no working tree diff
 * and no index. Commits are identity-only nodes (C0, C1, C2') because the
 * lesson being taught is graph topology, not storage.
 */
export class GitRepo {
  commits: Record<string, Commit> = {};
  branches: Record<string, BranchRef> = {};
  tags: Record<string, TagRef> = {};
  headTarget = 'main';

  /** The remote, when one exists. Local repo holds `o/*` tracking branches. */
  origin: GitRepo | null = null;
  /** Back-pointer set on an origin so it can see its local counterpart. */
  localRepo: GitRepo | null = null;
  /** True before `git clone` has run on levels that start un-cloned. */
  clonePending = false;
  /** Uncommitted files, for the staging-area levels. */
  workingChanges: Record<string, FileState> = {};

  private idCounter = 0;

  // ---------------------------------------------------------------------
  // Serialization
  // ---------------------------------------------------------------------

  static fromTree(tree: Tree | string): GitRepo {
    const t: Tree = typeof tree === 'string' ? JSON.parse(tree) : tree;
    const repo = new GitRepo();
    repo.loadTree(t);
    return repo;
  }

  static fromDefault(): GitRepo {
    return GitRepo.fromTree(structuredClone(DEFAULT_TREE));
  }

  private loadTree(tree: Tree) {
    this.commits = structuredClone(tree.commits ?? {});
    this.branches = structuredClone(tree.branches ?? {});
    this.tags = structuredClone(tree.tags ?? {});
    this.headTarget = tree.HEAD?.target ?? 'main';
    this.clonePending = Boolean(tree.clonePending);
    this.workingChanges = structuredClone(tree.workingChanges ?? {});

    if (tree.originTree) {
      this.origin = GitRepo.fromTree(tree.originTree);
      this.origin.localRepo = this;
    }
    this.syncIdCounter();
  }

  toTree(): Tree {
    const tree: Tree = {
      branches: structuredClone(this.branches),
      commits: structuredClone(this.commits),
      HEAD: { id: 'HEAD', target: this.headTarget },
    };
    if (Object.keys(this.tags).length > 0) tree.tags = structuredClone(this.tags);
    if (this.origin) tree.originTree = this.origin.toTree();
    if (this.clonePending) tree.clonePending = true;
    if (Object.keys(this.workingChanges).length > 0) {
      tree.workingChanges = structuredClone(this.workingChanges);
    }
    return tree;
  }

  // ---------------------------------------------------------------------
  // Commit ids
  // ---------------------------------------------------------------------

  /** Rewind the counter so the next id is the lowest free Cn. */
  private syncIdCounter() {
    this.idCounter = 0;
  }

  /** Mirrors upstream getUniqueID: lowest free Cn, checking origin too. */
  private nextId(): string {
    const taken = (id: string) =>
      Boolean(this.commits[id]) ||
      Boolean(this.origin?.commits[id]) ||
      Boolean(this.localRepo?.commits[id]);
    let id = 'C' + this.idCounter++;
    while (taken(id)) id = 'C' + this.idCounter++;
    return id;
  }

  /**
   * Upstream getBumpedID: marks a commit as a copy made by rebase/cherry-pick.
   *   C4 -> C4' -> C4'' -> C4''' -> C4'^4 -> C4'^5
   */
  private bumpId(id: string): string {
    let m = /^C(\d+)'{0,2}$/.exec(id);
    if (m) return id + "'";
    m = /^C(\d+)'{3}$/.exec(id);
    if (m) return id.slice(0, -3) + "'^4";
    m = /^C(\d+)'\^(\d+)$/.exec(id);
    if (m) return `C${m[1]}'^${Number(m[2]) + 1}`;
    throw new GitError(`could not modify the id ${id}`);
  }

  /** Bump until the id is free (upstream rebaseAltID). */
  private altId(id: string): string {
    let next = this.bumpId(id);
    while (this.commits[next]) next = this.bumpId(next);
    return next;
  }

  /** Strip copy markers: C4'^3 -> C4, C4'' -> C4. */
  static baseId(id: string): string {
    return id.replace(/'(\^\d+)?$/, '').replace(/'+$/, '');
  }

  /** Upstream idSortFunc: order by commit number, then by copy depth. */
  static idSortValue(id: string): number {
    const scale = 1000;
    let m = /^C(\d+)('*)$/.exec(id);
    if (m) return Number(m[1]) * scale + m[2].length;
    m = /^C(\d+)'\^(\d+)$/.exec(id);
    if (m) return Number(m[1]) * scale + Number(m[2]);
    return 0;
  }

  // ---------------------------------------------------------------------
  // Ref resolution
  // ---------------------------------------------------------------------

  /** The commit id HEAD currently points at (through a branch if attached). */
  headCommitId(): string {
    return this.resolve('HEAD');
  }

  /** True when HEAD points straight at a commit rather than a branch. */
  isDetached(): boolean {
    return !this.branches[this.headTarget];
  }

  /**
   * Resolve a ref expression to a commit id.
   * Supports: HEAD, branch, tag, commit id, and ^ / ^n / ~n chains.
   */
  resolve(ref: string): string {
    const id = this.resolveOrNull(ref);
    if (id === null) {
      throw new GitError(`Ref ${ref} not found; please check your spelling`);
    }
    return id;
  }

  resolveOrNull(ref: string): string | null {
    const expr = ref.trim();
    if (!expr) return null;

    // Split the base name from its ^/~ modifiers.
    const match = /^(.*?)((?:[~^]\d*)*)$/.exec(expr);
    if (!match) return null;
    const [, baseName, mods] = match;

    let current = this.resolveBase(baseName);
    if (current === null) return null;
    if (!mods) return current;

    for (const [, op, numRaw] of mods.matchAll(/([~^])(\d*)/g)) {
      const num = numRaw === '' ? 1 : Number(numRaw);
      if (op === '^') {
        // ^n selects the nth parent (1-indexed) -- how you pick a merge side.
        current = this.nthParent(current, num);
      } else {
        // ~n walks n generations up, always via the first parent.
        for (let i = 0; i < num; i++) current = this.nthParent(current, 1);
      }
    }
    return current;
  }

  private resolveBase(name: string): string | null {
    if (name === 'HEAD') {
      return this.branches[this.headTarget]
        ? this.branches[this.headTarget].target
        : this.headTarget;
    }
    if (this.branches[name]) return this.branches[name].target;
    if (this.tags[name]) return this.tags[name].target;
    if (this.commits[name]) return name;
    // Commit ids are written `C3` but players (and some level solutions)
    // type `c3`, so match them case-insensitively.
    const upper = name.toUpperCase();
    if (this.commits[upper]) return upper;
    return null;
  }

  private nthParent(id: string, n: number): string {
    const commit = this.commits[id];
    if (!commit) throw new GitError(`Commit ${id} not found`);
    const parent = commit.parents[n - 1];
    if (!parent) {
      throw new GitError(
        `Commit ${id} does not have a parent #${n} -- you may be at the root`,
      );
    }
    return parent;
  }

  /** Every commit reachable from the given starting ids, inclusive. */
  reachable(startIds: string[]): Set<string> {
    const seen = new Set<string>();
    const stack = [...startIds];
    while (stack.length) {
      const id = stack.pop()!;
      if (!id || seen.has(id)) continue;
      seen.add(id);
      for (const p of this.commits[id]?.parents ?? []) stack.push(p);
    }
    return seen;
  }

  isAncestor(maybeAncestor: string, descendant: string): boolean {
    return this.reachable([descendant]).has(maybeAncestor);
  }

  // ---------------------------------------------------------------------
  // Mutation helpers
  // ---------------------------------------------------------------------

  private makeCommit(
    parents: string[],
    id?: string,
    message?: string,
    changedFiles?: string[],
  ): Commit {
    const commitId = id ?? this.nextId();
    const commit: Commit = {
      type: 'commit',
      id: commitId,
      parents,
      ...(message ? { commitMessage: message } : {}),
      ...(changedFiles && changedFiles.length > 0
        ? { changedFiles: [...changedFiles] }
        : {}),
    };
    this.commits[commitId] = commit;
    return commit;
  }

  /**
   * Replay an existing commit onto new parents with a fresh copy id. Carries
   * the original's file changes, which the staging levels grade on.
   */
  private copyCommit(oldId: string, parents: string[], message?: string): Commit {
    const old = this.commits[oldId];
    return this.makeCommit(
      parents,
      this.altId(oldId),
      message ?? old?.commitMessage,
      old?.changedFiles,
    );
  }

  /** Move whatever HEAD points at (a branch, or HEAD itself when detached). */
  private setHeadCommit(id: string) {
    if (this.branches[this.headTarget]) {
      this.branches[this.headTarget].target = id;
    } else {
      this.headTarget = id;
    }
  }

  // ---------------------------------------------------------------------
  // Commands
  // ---------------------------------------------------------------------

  /** Files currently staged, in the order they were added. */
  private stagedFiles(): string[] {
    return Object.keys(this.workingChanges).filter(
      (f) => this.workingChanges[f] === 'staged',
    );
  }

  commit(message?: string): string {
    const parent = this.headCommitId();
    const staged = this.stagedFiles();
    const commit = this.makeCommit([parent], undefined, message);
    if (staged.length > 0) {
      commit.changedFiles = staged;
      for (const file of staged) delete this.workingChanges[file];
    }
    this.setHeadCommit(commit.id);
    return commit.id;
  }

  /**
   * `git commit --amend` replaces the current commit with a copy carrying a
   * bumped id. The original stays in the graph (upstream never prunes), it
   * just stops being referenced.
   */
  amend(message?: string): string {
    const oldId = this.headCommitId();
    const old = this.commits[oldId];
    if (!old) throw new GitError(`Commit ${oldId} not found`);
    if (old.parents.length === 0) throw new GitError('Cannot amend the root commit');

    const staged = this.stagedFiles();
    const newId = this.altId(oldId);
    const commit = this.makeCommit(
      [...old.parents],
      newId,
      message ?? old.commitMessage,
    );
    const files = [...(old.changedFiles ?? []), ...staged];
    if (files.length > 0) commit.changedFiles = files;
    for (const file of staged) delete this.workingChanges[file];

    this.setHeadCommit(commit.id);
    return commit.id;
  }

  /** `git add <file>` -- move a file into the staging area. */
  add(files: string[]) {
    if (files.length === 0) throw new GitError('git add needs a file name');
    for (const file of files) this.workingChanges[file] = 'staged';
  }

  /**
   * `git restore <file>`          discard the working-directory change
   * `git restore --staged <file>` unstage, keeping the change
   */
  restore(files: string[], opts: { staged?: boolean } = {}) {
    if (files.length === 0) throw new GitError('git restore needs a file name');
    for (const file of files) {
      if (opts.staged) {
        if (this.workingChanges[file] === 'staged') {
          this.workingChanges[file] = 'modified';
        }
      } else {
        delete this.workingChanges[file];
      }
    }
  }

  branch(name: string, ref = 'HEAD') {
    if (this.branches[name]) {
      throw new GitError(`Branch "${name}" already exists`);
    }
    if (this.tags[name]) {
      throw new GitError(`A tag named "${name}" already exists`);
    }
    this.branches[name] = { id: name, target: this.resolve(ref), type: 'branch' };
  }

  forceBranch(name: string, ref: string) {
    if (!this.branches[name]) return this.branch(name, ref);
    this.branches[name].target = this.resolve(ref);
  }

  deleteBranch(name: string) {
    if (!this.branches[name]) throw new GitError(`Branch "${name}" not found`);
    if (name === this.headTarget) {
      throw new GitError(`Cannot delete "${name}" -- you are on it`);
    }
    if (name.includes('/')) {
      throw new GitError(`Cannot delete remote-tracking branch "${name}"`);
    }
    delete this.branches[name];
  }

  checkout(ref: string) {
    // You cannot sit on a remote-tracking branch: checking out o/main detaches
    // HEAD at that commit, which is the whole point of the remoteBranches level.
    if (this.branches[ref] && !ref.startsWith('o/')) {
      this.headTarget = ref;
      return;
    }
    // Anything else detaches HEAD onto a bare commit.
    this.headTarget = this.resolve(ref);
  }

  checkoutNewBranch(name: string, ref = 'HEAD') {
    this.branch(name, ref);
    // Track the remote branch when branching off one, like real git.
    if (this.branches[ref]?.id.startsWith('o/')) {
      this.branches[name].remoteTrackingBranchID = ref;
    }
    this.headTarget = name;
  }

  merge(ref: string): string | null {
    const target = this.resolve(ref);
    const head = this.headCommitId();

    if (target === head || this.isAncestor(target, head)) {
      throw new GitError('Already up to date -- nothing to merge');
    }
    if (this.isAncestor(head, target)) {
      // Fast-forward: no merge commit, the pointer just slides along.
      this.setHeadCommit(target);
      return null;
    }
    const name = this.branches[this.headTarget] ? this.headTarget : 'HEAD';
    const commit = this.makeCommit([head, target], undefined, `Merge ${ref} into ${name}`);
    this.setHeadCommit(commit.id);
    return commit.id;
  }

  /**
   * Commits reachable from `source` but not from `target`, excluding merge
   * commits (git does not replay those) and commits whose work is already
   * upstream (matched by base id, so C3 is skipped if C3' is on target).
   */
  private commitsToReplay(sourceId: string, targetId: string): string[] {
    const upstream = this.reachable([targetId]);
    const upstreamBases = new Set([...upstream].map((id) => GitRepo.baseId(id)));

    const result: string[] = [];
    const seen = new Set<string>();
    const stack = [sourceId];
    while (stack.length) {
      const id = stack.pop()!;
      if (seen.has(id) || upstream.has(id)) continue;
      seen.add(id);
      const commit = this.commits[id];
      if (!commit) continue;
      for (const p of commit.parents) stack.push(p);
      if (commit.parents.length > 1) continue; // never replay merge commits
      if (upstreamBases.has(GitRepo.baseId(id))) continue; // already applied
      result.push(id);
    }
    return result.sort((a, b) => GitRepo.idSortValue(a) - GitRepo.idSortValue(b));
  }

  rebase(targetRef: string, sourceRef = 'HEAD'): boolean {
    const targetId = this.resolve(targetRef);
    const sourceId = this.resolve(sourceRef);
    const sourceBranch = sourceRef === 'HEAD' ? this.headTarget : sourceRef;

    if (this.isAncestor(sourceId, targetId)) {
      // Source is already contained in target -- just fast-forward onto it.
      if (this.branches[sourceBranch]) this.branches[sourceBranch].target = targetId;
      else this.headTarget = targetId;
      this.checkout(sourceBranch);
      return false;
    }

    const toReplay = this.commitsToReplay(sourceId, targetId);
    if (toReplay.length === 0) {
      throw new GitError('There is nothing to rebase! Everything is up to date.');
    }

    let base = targetId;
    for (const oldId of toReplay) {
      base = this.copyCommit(oldId, [base]).id;
    }

    if (this.branches[sourceBranch]) {
      this.branches[sourceBranch].target = base;
      this.headTarget = sourceBranch;
    } else {
      this.headTarget = base;
    }
    return true;
  }

  /** The commits `git rebase -i` would offer the player to reorder/drop. */
  interactiveRebaseCandidates(targetRef: string, sourceRef = 'HEAD'): string[] {
    return this.commitsToReplay(this.resolve(sourceRef), this.resolve(targetRef));
  }

  /** `git rebase -i` with an explicit, already-chosen list of commits. */
  rebaseInteractive(targetRef: string, chosen: string[], sourceRef = 'HEAD') {
    const targetId = this.resolve(targetRef);
    const sourceBranch = sourceRef === 'HEAD' ? this.headTarget : sourceRef;

    let base = targetId;
    for (const oldRef of chosen) {
      base = this.copyCommit(this.resolve(oldRef), [base]).id;
    }
    if (this.branches[sourceBranch]) {
      this.branches[sourceBranch].target = base;
      this.headTarget = sourceBranch;
    } else {
      this.headTarget = base;
    }
  }

  cherryPick(refs: string[]) {
    if (refs.length === 0) throw new GitError('git cherry-pick needs at least one commit');
    for (const ref of refs) {
      const copy = this.copyCommit(this.resolve(ref), [this.headCommitId()]);
      this.setHeadCommit(copy.id);
    }
  }

  reset(ref: string) {
    if (this.isDetached()) {
      throw new GitError('Cannot reset with a detached HEAD -- check out a branch first');
    }
    this.branches[this.headTarget].target = this.resolve(ref);
  }

  revert(ref: string) {
    const oldId = this.resolve(ref);
    const commit = this.copyCommit(oldId, [this.headCommitId()], `Reverting ${oldId}`);
    this.setHeadCommit(commit.id);
  }

  tag(name: string, ref = 'HEAD') {
    if (this.tags[name]) throw new GitError(`Tag "${name}" already exists`);
    this.tags[name] = { id: name, target: this.resolve(ref), type: 'tag' };
  }

  /** `git describe <ref>` -> "<tag>_<commitsSince>_g<ref>", upstream's format. */
  describe(ref = 'HEAD'): string {
    const startId = this.resolve(ref);
    // Walk back until we hit a tagged commit, counting the distance.
    const tagFor = new Map<string, string>();
    for (const t of Object.values(this.tags)) tagFor.set(t.target, t.id);

    let depth = 0;
    let cursor = startId;
    const guard = new Set<string>();
    while (!tagFor.has(cursor)) {
      if (guard.has(cursor)) break;
      guard.add(cursor);
      const parents = this.commits[cursor]?.parents ?? [];
      if (parents.length === 0) {
        throw new GitError(`No tags found on the history of ${ref}`);
      }
      cursor = parents[0];
      depth++;
    }
    const tagName = tagFor.get(cursor);
    if (!tagName) throw new GitError(`No tags found on the history of ${ref}`);
    return depth === 0 ? tagName : `${tagName}_${depth}_g${startId}`;
  }

  // ---------------------------------------------------------------------
  // Remotes
  // ---------------------------------------------------------------------

  /**
   * `git clone` copies the REMOTE down into the local repo -- levels start
   * with an origin already populated and `clonePending` set, and the player's
   * local repo is the empty one that gets filled in.
   */
  clone() {
    if (this.origin && !this.clonePending) {
      throw new GitError('You already have a remote! Cannot clone again');
    }
    if (!this.origin) {
      // Nothing to clone from, so publish the local repo as the new remote.
      const remote = GitRepo.fromTree(this.toTree());
      remote.origin = null;
      remote.localRepo = this;
      this.origin = remote;
    }
    const origin = this.origin!;
    this.clonePending = false;

    for (const [name, remoteBranch] of Object.entries(origin.branches)) {
      // Bring down every commit the remote branch needs.
      this.copyMissing(origin, this, [remoteBranch.target]);

      const trackingName = `o/${name}`;
      this.branches[trackingName] = {
        id: trackingName,
        target: remoteBranch.target,
        remoteTrackingBranchID: null,
        type: 'branch',
      };
      // The local branch mirrors the remote and starts tracking it.
      this.branches[name] = {
        id: name,
        target: remoteBranch.target,
        remoteTrackingBranchID: trackingName,
        type: 'branch',
      };
    }
  }

  private requireOrigin(): GitRepo {
    if (!this.origin) {
      throw new GitError('You do not have a remote! Try `git clone` first');
    }
    return this.origin;
  }

  /** Copy commits that exist in `from` but not in `to`, oldest-first. */
  private copyMissing(from: GitRepo, to: GitRepo, headIds: string[]) {
    const needed = from.reachable(headIds);
    const ordered = [...needed].sort(
      (a, b) => GitRepo.idSortValue(a) - GitRepo.idSortValue(b),
    );
    for (const id of ordered) {
      if (!to.commits[id]) to.commits[id] = structuredClone(from.commits[id]);
    }
  }

  fetch(opts: { branches?: string[] } = {}) {
    const origin = this.requireOrigin();
    const names = opts.branches ?? Object.keys(origin.branches);
    for (const name of names) {
      const remoteBranch = origin.branches[name];
      if (!remoteBranch) throw new GitError(`Remote branch "${name}" not found`);
      this.copyMissing(origin, this, [remoteBranch.target]);
      const trackingName = `o/${name}`;
      if (this.branches[trackingName]) {
        this.branches[trackingName].target = remoteBranch.target;
      } else {
        this.branches[trackingName] = {
          id: trackingName,
          target: remoteBranch.target,
          remoteTrackingBranchID: null,
          type: 'branch',
        };
      }
    }
  }

  /**
   * `git fetch origin <source>:<destination>` -- download up to `source` in the
   * remote and point the LOCAL branch `destination` at it.
   *
   * Unlike a plain fetch this deliberately leaves `o/*` untouched: you asked
   * for one specific ref, so git does not re-sync your remote-tracking view.
   */
  fetchRefspec(source: string, destination: string) {
    const origin = this.requireOrigin();
    if (!destination) throw new GitError('Refspec needs a destination branch');

    // An empty source (`git fetch origin :bar`) just makes a new local branch.
    const targetId = source === '' ? this.headCommitId() : origin.resolve(source);
    if (source !== '') this.copyMissing(origin, this, [targetId]);

    if (this.branches[destination]) {
      this.branches[destination].target = targetId;
    } else {
      this.branches[destination] = {
        id: destination,
        target: targetId,
        remoteTrackingBranchID: null,
        type: 'branch',
      };
    }
  }

  /** Which o/<x> a local branch pulls from / pushes to. */
  private trackedRemoteOf(branchName: string): string {
    const branch = this.branches[branchName];
    if (branch?.remoteTrackingBranchID) return branch.remoteTrackingBranchID;
    if (this.branches[`o/${branchName}`]) return `o/${branchName}`;
    throw new GitError(`Branch "${branchName}" is not tracking a remote branch`);
  }

  pull(opts: { rebase?: boolean; source?: string; destination?: string } = {}) {
    const origin = this.requireOrigin();

    // Refspec form: fetch into a named local branch, then integrate that.
    if (opts.source !== undefined && opts.destination !== undefined) {
      this.fetchRefspec(opts.source, opts.destination);
      if (opts.rebase) this.rebase(opts.destination);
      else this.merge(opts.destination);
      return;
    }

    const sourceName = this.trackedRemoteOf(this.headTarget).replace(/^o\//, '');
    if (!origin.branches[sourceName]) {
      throw new GitError(`Remote branch "${sourceName}" not found`);
    }
    this.fetch({ branches: [sourceName] });
    const mergeFrom = `o/${sourceName}`;
    if (opts.rebase) this.rebase(mergeFrom);
    else this.merge(mergeFrom);
  }

  push(opts: { source?: string; destination?: string } = {}) {
    const origin = this.requireOrigin();

    // An explicit empty source is the "delete remote branch" form, so only a
    // genuinely absent source falls back to the current branch.
    if (this.isDetached() && opts.source === undefined) {
      throw new GitError('Cannot push with a detached HEAD -- check out a branch');
    }
    const sourceRef = opts.source ?? this.headTarget;
    const remoteName =
      opts.destination ??
      (opts.source ? sourceRef : this.trackedRemoteOf(this.headTarget).replace(/^o\//, ''));

    // `git push origin <nothing>:<branch>` deletes the remote branch.
    if (opts.source === '') {
      delete origin.branches[remoteName];
      delete this.branches[`o/${remoteName}`];
      return;
    }

    const localId = this.resolve(sourceRef);
    const remoteBranch = origin.branches[remoteName];

    if (remoteBranch && !origin.isAncestor(remoteBranch.target, localId)) {
      // Only reject when the remote genuinely has work we don't.
      const localHasRemote = this.reachable([localId]).has(remoteBranch.target);
      if (!localHasRemote) {
        throw new GitError(
          `Upstream "${remoteName}" has commits you do not -- pull before pushing`,
        );
      }
    }

    this.copyMissing(this, origin, [localId]);
    if (remoteBranch) remoteBranch.target = localId;
    else {
      origin.branches[remoteName] = {
        id: remoteName,
        target: localId,
        remoteTrackingBranchID: null,
        type: 'branch',
      };
    }

    const trackingName = `o/${remoteName}`;
    if (this.branches[trackingName]) this.branches[trackingName].target = localId;
    else {
      this.branches[trackingName] = {
        id: trackingName,
        target: localId,
        remoteTrackingBranchID: null,
        type: 'branch',
      };
    }
    // Pushing a branch that has no upstream yet adopts one. A branch that
    // already tracks something keeps it, even when pushed across names
    // (`git push origin foo:main` must not repoint foo at o/main).
    const sourceBranch = this.branches[sourceRef];
    if (sourceBranch && !sourceBranch.remoteTrackingBranchID) {
      sourceBranch.remoteTrackingBranchID = trackingName;
    }
  }

  /** Teaching-only command: simulates a teammate pushing to the remote. */
  fakeTeamwork(branchName = 'main', count = 1) {
    const origin = this.requireOrigin();
    if (!origin.branches[branchName]) {
      origin.branches[branchName] = {
        id: branchName,
        target: origin.headCommitId(),
        remoteTrackingBranchID: null,
        type: 'branch',
      };
    }
    for (let i = 0; i < count; i++) {
      const parent = origin.branches[branchName].target;
      // Ids must be unique across both repos, so allocate from the local side.
      const id = this.nextId();
      origin.commits[id] = { type: 'commit', id, parents: [parent] };
      origin.branches[branchName].target = id;
    }
  }
}
