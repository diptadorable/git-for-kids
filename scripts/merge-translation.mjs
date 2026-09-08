/**
 * Merges a translation chunk into data/levels.id.json.
 *
 * Translations are written as small JS modules (one per sequence) so the
 * lesson prose stays readable and the demo commands can be copied verbatim
 * from the English original. This script folds them in and validates that
 * every demo still carries the exact same command as upstream -- a mistyped
 * `beforeCommand` would silently teach the wrong thing.
 *
 * Usage: node scripts/merge-translation.mjs scripts/translations/<file>.mjs
 */
import { readFile, writeFile } from 'node:fs/promises';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const target = process.argv[2];
if (!target) {
  console.error('usage: node scripts/merge-translation.mjs <translation-file>');
  process.exit(1);
}

const { translations } = await import(pathToFileURL(resolve(target)).href);
const idPath = join(ROOT, 'data', 'levels.id.json');
const enPath = join(ROOT, 'data', 'levels.json');

const current = JSON.parse(await readFile(idPath, 'utf8'));
const english = JSON.parse(await readFile(enPath, 'utf8'));
const byId = new Map(english.levels.map((l) => [l.id, l]));

const problems = [];

for (const [levelId, entry] of Object.entries(translations)) {
  const source = byId.get(levelId);
  if (!source) {
    problems.push(`${levelId}: no such level`);
    continue;
  }

  const enViews = source.startDialog?.childViews ?? [];
  const idViews = entry.startDialog?.childViews ?? [];

  if (idViews.length !== enViews.length) {
    problems.push(
      `${levelId}: ${idViews.length} slides but upstream has ${enViews.length}`,
    );
  }

  // Demo slides must keep upstream's exact commands, or the worked example
  // stops matching the lesson it is illustrating.
  enViews.forEach((enView, index) => {
    const idView = idViews[index];
    if (!idView) return;
    if (enView.type !== idView.type) {
      problems.push(`${levelId}[${index}]: type ${idView.type} != ${enView.type}`);
    }
    for (const key of ['command', 'beforeCommand']) {
      const a = enView.options?.[key] ?? '';
      const b = idView.options?.[key] ?? '';
      if (a !== b) {
        problems.push(`${levelId}[${index}].${key}: "${b}" != upstream "${a}"`);
      }
    }
  });

  current[levelId] = { ...current[levelId], ...entry };
}

if (problems.length > 0) {
  console.error('Refusing to merge:');
  for (const p of problems) console.error('  ' + p);
  process.exit(1);
}

await writeFile(idPath, JSON.stringify(current, null, 2) + '\n', 'utf8');
console.log(
  `Merged ${Object.keys(translations).length} level(s): ${Object.keys(translations).join(', ')}`,
);
