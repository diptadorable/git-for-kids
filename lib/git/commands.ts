import { GitRepo } from './repo';
import { GitError } from './types';

export interface CommandResult {
  /** Lines to print in the game terminal. */
  output: string[];
  /**
   * Set when the command needs the player to arrange commits before it can
   * finish (`git rebase -i`). The UI shows a dialog and re-dispatches.
   */
  interactive?: { targetRef: string; commits: string[]; sourceRef?: string };
}

/** Split a command line into tokens, honouring quoted strings. */
function tokenize(line: string): string[] {
  const tokens: string[] = [];
  const re = /"([^"]*)"|'([^']*)'|(\S+)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(line)) !== null) {
    tokens.push(m[1] ?? m[2] ?? m[3]);
  }
  return tokens;
}

/** Options whose value is the NEXT token rather than `--flag=value`. */
const VALUE_OPTIONS = new Set(['solution-ordering', 'm']);

/** Pull `--flag` / `--flag=value` out of the token list, leaving positionals. */
function extractOptions(tokens: string[]) {
  const options: Record<string, string | true> = {};
  const positional: string[] = [];

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    if (token.startsWith('--')) {
      const [name, value] = token.slice(2).split('=');
      if (value !== undefined) options[name] = value;
      else if (VALUE_OPTIONS.has(name) && i + 1 < tokens.length) options[name] = tokens[++i];
      else options[name] = true;
    } else if (token.startsWith('-') && token.length > 1 && !/^-\d/.test(token)) {
      const flags = token.slice(1);
      // A short flag that takes a value consumes the next token (git commit -m).
      if (VALUE_OPTIONS.has(flags) && i + 1 < tokens.length) options[flags] = tokens[++i];
      else for (const ch of flags) options[ch] = true;
    } else {
      positional.push(token);
    }
  }
  return { options, positional };
}

/** `<source>:<destination>` refspec, as used by fetch/push/pull. */
function parseRefspec(arg: string | undefined) {
  if (!arg || !arg.includes(':')) return null;
  const [source, destination] = arg.split(':');
  return { source, destination };
}

/**
 * Run one git command against the repo, mutating it in place.
 * Throws GitError for anything the player did wrong.
 */
export function runCommand(repo: GitRepo, line: string): CommandResult {
  const tokens = tokenize(line.trim());
  if (tokens.length === 0) return { output: [] };

  if (tokens[0] !== 'git') {
    throw new GitError(
      `"${tokens[0]}" is not a git command. Every command here starts with "git".`,
    );
  }
  const verb = tokens[1];
  if (!verb) return { output: ['usage: git <command> [<args>]'] };

  const { options, positional } = extractOptions(tokens.slice(2));
  const out: string[] = [];

  switch (verb) {
    case 'commit': {
      const message = typeof options.m === 'string' ? options.m : undefined;
      if (options.amend) {
        const id = repo.amend(message);
        out.push(`[${repo.headTarget} ${id}] amended commit`);
      } else {
        const id = repo.commit(message);
        out.push(`[${repo.headTarget} ${id}] ${message ?? 'quick commit'}`);
      }
      break;
    }

    case 'branch': {
      if (options.d || options.D) {
        for (const name of positional) repo.deleteBranch(name);
        out.push(`Deleted branch ${positional.join(', ')}`);
      } else if (options.f) {
        const [name, ref] = positional;
        if (!name || !ref) throw new GitError('usage: git branch -f <name> <ref>');
        repo.forceBranch(name, ref);
        out.push(`Moved ${name} to ${ref}`);
      } else if (positional.length === 0) {
        out.push(...Object.keys(repo.branches).sort());
      } else {
        repo.branch(positional[0], positional[1] ?? 'HEAD');
        out.push(`Created branch ${positional[0]}`);
      }
      break;
    }

    case 'checkout':
    case 'switch': {
      const makeNew = options.b || options.c;
      if (makeNew) {
        const [name, ref] = positional;
        if (!name) throw new GitError('usage: git checkout -b <name> [ref]');
        repo.checkoutNewBranch(name, ref ?? 'HEAD');
        out.push(`Switched to a new branch '${name}'`);
      } else {
        const ref = positional[0];
        if (!ref) throw new GitError('usage: git checkout <ref>');
        repo.checkout(ref);
        out.push(`Switched to '${ref}'`);
      }
      break;
    }

    case 'merge': {
      const ref = positional[0];
      if (!ref) throw new GitError('usage: git merge <ref>');
      const id = repo.merge(ref);
      out.push(id ? `Merge made by the 'recursive' strategy (${id})` : 'Fast-forward');
      break;
    }

    case 'rebase': {
      if (options.i) {
        const target = positional[0];
        if (!target) throw new GitError('usage: git rebase -i <target>');
        const source = positional[1];
        // Solutions pass the chosen order inline; the UI supplies it from a
        // drag-and-drop dialog instead.
        if (typeof options['solution-ordering'] === 'string') {
          const chosen = options['solution-ordering'].split(',').filter(Boolean);
          repo.rebaseInteractive(target, chosen, source ?? 'HEAD');
          out.push(`Interactively rebased ${chosen.length} commit(s) onto ${target}`);
        } else {
          return {
            output: [],
            interactive: {
              targetRef: target,
              sourceRef: source,
              commits: repo.interactiveRebaseCandidates(target, source ?? 'HEAD'),
            },
          };
        }
      } else {
        const [target, source] = positional;
        if (!target) throw new GitError('usage: git rebase <target> [source]');
        const moved = repo.rebase(target, source ?? 'HEAD');
        out.push(moved ? `Rebased onto ${target}` : `Fast-forwarded onto ${target}`);
      }
      break;
    }

    case 'cherry-pick': {
      repo.cherryPick(positional);
      out.push(`Cherry-picked ${positional.join(', ')}`);
      break;
    }

    case 'reset': {
      const ref = positional[0];
      if (!ref) throw new GitError('usage: git reset <ref>');
      repo.reset(ref);
      out.push(`Reset ${repo.headTarget} to ${ref}`);
      break;
    }

    case 'revert': {
      const ref = positional[0] ?? 'HEAD';
      repo.revert(ref);
      out.push(`Reverted ${ref}`);
      break;
    }

    case 'tag': {
      if (positional.length === 0) {
        out.push(...Object.keys(repo.tags).sort());
      } else {
        repo.tag(positional[0], positional[1] ?? 'HEAD');
        out.push(`Created tag ${positional[0]}`);
      }
      break;
    }

    case 'describe': {
      out.push(repo.describe(positional[0] ?? 'HEAD'));
      break;
    }

    case 'add': {
      repo.add(positional);
      break;
    }

    case 'restore': {
      repo.restore(positional, { staged: Boolean(options.staged) });
      break;
    }

    case 'clone': {
      repo.clone();
      out.push('Cloned remote repository');
      break;
    }

    case 'fetch': {
      // `git fetch [origin [<source>:<destination>]]`
      const args = positional[0] === 'origin' ? positional.slice(1) : positional;
      const spec = parseRefspec(args[0]);
      if (spec) repo.fetchRefspec(spec.source, spec.destination);
      else if (args[0]) repo.fetch({ branches: [args[0]] });
      else repo.fetch();
      out.push('Fetched from origin');
      break;
    }

    case 'pull': {
      const args = positional[0] === 'origin' ? positional.slice(1) : positional;
      const spec = parseRefspec(args[0]);
      repo.pull({
        rebase: Boolean(options.rebase),
        ...(spec ? { source: spec.source, destination: spec.destination } : {}),
      });
      out.push(options.rebase ? 'Pulled with rebase' : 'Pulled from origin');
      break;
    }

    case 'push': {
      const args = positional[0] === 'origin' ? positional.slice(1) : positional;
      const spec = parseRefspec(args[0]);
      if (spec) repo.push({ source: spec.source, destination: spec.destination });
      else if (args[0]) repo.push({ source: args[0], destination: args[0] });
      else repo.push();
      out.push('Pushed to origin');
      break;
    }

    case 'fakeTeamwork': {
      // `git fakeTeamwork [branch] [count]` -- either arg may be omitted.
      let branch = 'main';
      let count = 1;
      for (const arg of positional) {
        if (/^\d+$/.test(arg)) count = Number(arg);
        else branch = arg;
      }
      repo.fakeTeamwork(branch, count);
      out.push(`A teammate pushed ${count} commit(s) to ${branch}`);
      break;
    }

    case 'status': {
      out.push(
        repo.isDetached()
          ? `HEAD detached at ${repo.headTarget}`
          : `On branch ${repo.headTarget}`,
      );
      for (const [file, state] of Object.entries(repo.workingChanges)) {
        out.push(`  ${state === 'staged' ? 'staged:  ' : 'modified:'} ${file}`);
      }
      break;
    }

    case 'log': {
      const start = repo.resolve(positional[0] ?? 'HEAD');
      const ids = [...repo.reachable([start])].sort(
        (a, b) => GitRepo.idSortValue(b) - GitRepo.idSortValue(a),
      );
      for (const id of ids) out.push(`commit ${id}`);
      break;
    }

    default:
      throw new GitError(
        `"git ${verb}" is not a command this game knows. Try "git commit" or "git branch".`,
      );
  }

  return { output: out };
}

/** Run a `;`-separated command chain, as level solutions are written. */
export function runCommands(repo: GitRepo, chain: string): string[] {
  const output: string[] = [];
  for (const part of chain.split(';')) {
    const line = part.trim();
    if (!line) continue;
    output.push(...runCommand(repo, line).output);
  }
  return output;
}
