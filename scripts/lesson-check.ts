/**
 * Checks every lesson demo actually runs.
 *
 * Each demo slide runs a real command through the engine to illustrate what
 * the prose just explained. If the engine does not support that command the
 * demo silently renders an unchanged repo -- the slide still looks fine, so
 * this class of bug is invisible without a check like this one. Four missing
 * commands (fakeCreateRemote, branch -u, the place form of pull, and the
 * go/gc shortcuts) were found exactly this way.
 *
 * Demos that are MEANT to fail are listed below, because "this command is
 * rejected" is itself the lesson.
 *
 * Usage: npm run lesson-check
 */
import { GitRepo } from '../lib/git/repo';
import { runCommandsForDemo } from '../lib/git/commands';
import { LEVELS } from '../lib/game/levels';
import { localizedLevel, type DialogView } from '../lib/game/content';
import { LANGS } from '../lib/i18n/strings';

/** Demos whose whole point is that git refuses the command. */
const EXPECTED_TO_FAIL = new Set([
  'fetchRebase:git push', // diverged history -- push is rejected
  'pushArgs:git checkout C0; git push', // detached HEAD -- push has no target
]);

const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const RESET = '\x1b[0m';

interface Problem {
  level: string;
  lang: string;
  command: string;
  reason: string;
}

const problems: Problem[] = [];
let checked = 0;

function treeSignature(repo: GitRepo): string {
  return JSON.stringify(repo.toTree());
}

for (const level of LEVELS) {
  for (const lang of LANGS) {
    const views = localizedLevel(level, lang).dialogViews as DialogView[];

    for (const view of views) {
      if (view.type !== 'GitDemonstrationView') continue;
      const options = view.options ?? {};
      const command = options.command;
      if (!command) continue;
      checked++;

      const repo = GitRepo.fromDefault();

      // The setup must always succeed -- it is what the slide draws first.
      if (options.beforeCommand) {
        try {
          runCommandsForDemo(repo, options.beforeCommand);
        } catch (err) {
          problems.push({
            level: level.id,
            lang,
            command: options.beforeCommand,
            reason: `setup threw: ${(err as Error).message}`,
          });
          continue;
        }
      }

      const before = treeSignature(repo);
      const key = `${level.id}:${command}`;
      const shouldFail = EXPECTED_TO_FAIL.has(key);

      let threw: string | null = null;
      try {
        runCommandsForDemo(repo, command);
      } catch (err) {
        threw = (err as Error).message;
      }

      if (threw && !shouldFail) {
        problems.push({ level: level.id, lang, command, reason: `threw: ${threw}` });
        continue;
      }
      if (shouldFail) continue; // a rejected command correctly changes nothing

      if (treeSignature(repo) === before) {
        problems.push({
          level: level.id,
          lang,
          command,
          reason: 'ran but changed nothing -- the slide would look broken',
        });
      }
    }
  }
}

console.log();
for (const p of problems) {
  console.log(`${RED}FAIL${RESET} ${p.level} (${p.lang}) "${p.command}"`);
  console.log(`     ${p.reason}`);
}

console.log();
if (problems.length === 0) {
  console.log(`${GREEN}All ${checked} lesson demos run and change the repo.${RESET}`);
} else {
  console.log(
    `${YELLOW}${checked - problems.length}/${checked} lesson demos OK, ${problems.length} broken.${RESET}`,
  );
}

process.exit(problems.length === 0 ? 0 : 1);
