/**
 * Sanity check on the conformance suite itself: grading must REJECT wrong
 * answers. A suite that only ever reports success proves nothing.
 */
import levelData from '../data/levels.json';
import { GitRepo } from '../lib/git/repo';
import { runCommands } from '../lib/git/commands';
import { isLevelSolved, type LevelBlob } from '../lib/git/treeCompare';

type L = LevelBlob & { id: string; startTree?: string; goalTreeString: string; solutionCommand: string };
const levels = (levelData as unknown as { levels: L[] }).levels;

let noopRejected = 0;
const noopLeaks: string[] = [];
const tolerantOfExtra: string[] = [];

for (const level of levels) {
  const fresh = () =>
    level.startTree ? GitRepo.fromTree(level.startTree) : GitRepo.fromDefault();

  // Control 1: doing nothing must not solve the level.
  if (isLevelSolved(level, fresh().toTree())) noopLeaks.push(level.id);
  else noopRejected++;

  // Control 2: the official solution plus a stray commit should usually fail.
  const repo = fresh();
  try {
    runCommands(repo, level.solutionCommand);
    runCommands(repo, 'git commit');
  } catch {
    continue;
  }
  if (isLevelSolved(level, repo.toTree())) tolerantOfExtra.push(level.id);
}

console.log(`no-op rejected on ${noopRejected}/${levels.length} levels`);
if (noopLeaks.length) console.log('  levels a no-op wrongly solves:', noopLeaks.join(', '));
console.log(`solution + stray commit still accepted on ${tolerantOfExtra.length} levels`);
if (tolerantOfExtra.length) console.log('  ', tolerantOfExtra.join(', '));
