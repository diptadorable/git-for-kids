/**
 * Imports the 36 official level definitions from learnGitBranching
 * (MIT, (c) 2012-2025 Peter Cottle) into a single clean JSON file.
 *
 * We keep ONLY the game logic + English text. The upstream files carry 17
 * language variants each (~100KB per level); we strip the ones we don't ship
 * so the bundle stays small. Indonesian is authored separately in
 * data/locales/id.json -- upstream has no Indonesian.
 *
 * Usage: node scripts/import-levels.mjs
 */
import { writeFile, mkdir, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const CACHE = join(ROOT, '.level-cache');
const RAW = 'https://raw.githubusercontent.com/pcottle/learnGitBranching/main/src/levels';

/** Exact sequence order from upstream src/levels/index.js */
const SEQUENCES = {
  intro: ['intro/commits', 'intro/branching', 'intro/merging', 'intro/rebasing'],
  rampup: [
    'rampup/detachedHead',
    'rampup/relativeRefs',
    'rampup/relativeRefs2',
    'rampup/reversingChanges',
  ],
  move: [
    'rampup/cherryPick',
    'rampup/interactiveRebase',
    'workingDir/staging',
    'workingDir/restore',
  ],
  mixed: [
    'mixed/grabbingOneCommit',
    'mixed/jugglingCommits',
    'mixed/jugglingCommits2',
    'mixed/tags',
    'mixed/describe',
  ],
  advanced: [
    'rebase/manyRebases',
    'advanced/multipleParents',
    'rebase/selectiveRebase',
  ],
  remote: [
    'remote/clone',
    'remote/remoteBranches',
    'remote/fetch',
    'remote/pull',
    'remote/fakeTeamwork',
    'remote/push',
    'remote/fetchRebase',
    'remote/lockedMain',
  ],
  remoteAdvanced: [
    'remote/pushManyFeatures',
    'remote/mergeManyFeatures',
    'remote/tracking',
    'remote/pushArgs',
    'remote/pushArgs2',
    'remote/fetchArgs',
    'remote/sourceNothing',
    'remote/pullArgs',
  ],
};

/** Pull the en_US string out of an upstream {lang: string} map. */
function en(field) {
  if (field == null) return undefined;
  if (typeof field === 'string') return field;
  return field.en_US ?? field.en ?? Object.values(field)[0];
}

/** startDialog is {lang: {childViews: [...]}} -- keep the English view list. */
function enDialog(dialog) {
  if (!dialog) return undefined;
  const picked = dialog.en_US ?? dialog.en ?? Object.values(dialog)[0];
  if (!picked) return undefined;
  // Some levels nest as {childViews: [...]}, others are already the array.
  return Array.isArray(picked) ? { childViews: picked } : picked;
}

/**
 * Upstream stores tree snapshots two ways: as raw JSON, or URL-escaped (they
 * call unescape() on load). Normalize both to a plain JSON string so the
 * runtime engine only ever sees one format.
 */
function normalizeTree(str, where) {
  if (str == null) return undefined;
  let s = String(str).trim();
  if (!s.startsWith('{')) {
    try {
      s = decodeURIComponent(s);
    } catch {
      throw new Error(`${where}: tree is neither JSON nor URI-encoded`);
    }
  }
  let parsed;
  try {
    parsed = JSON.parse(s);
  } catch (e) {
    throw new Error(`${where}: unparseable tree -- ${e.message}`);
  }
  // Re-stringify so formatting is uniform across all 36 levels.
  return JSON.stringify(parsed);
}

async function fetchLevel(path) {
  const cached = join(CACHE, path.replace('/', '__') + '.js');
  if (existsSync(cached)) return readFile(cached, 'utf8');
  const res = await fetch(`${RAW}/${path}.js`);
  if (!res.ok) throw new Error(`${path}: HTTP ${res.status}`);
  const text = await res.text();
  await mkdir(CACHE, { recursive: true });
  await writeFile(cached, text, 'utf8');
  return text;
}

/** Upstream files are plain CommonJS data modules: `exports.level = {...}`. */
function evalLevel(source, path) {
  const sandbox = { exports: {}, module: { exports: {} }, require: () => ({}) };
  sandbox.module.exports = sandbox.exports;
  vm.createContext(sandbox);
  new vm.Script(source, { filename: path }).runInContext(sandbox);
  const level = sandbox.exports.level ?? sandbox.module.exports.level;
  if (!level) throw new Error(`${path}: no exports.level found`);
  return level;
}

const levels = [];
const sequences = [];
let order = 0;

for (const [seqKey, paths] of Object.entries(SEQUENCES)) {
  const ids = [];
  for (const path of paths) {
    const raw = evalLevel(await fetchLevel(path), path);
    const id = path.split('/')[1];

    // startTree is genuinely optional upstream -- when absent the level begins
    // from Graph.getDefaultTree() (C0 root -> C1, main at C1, HEAD at main).
    // The engine substitutes that default, so we just record its absence.
    if (!raw.goalTreeString || !raw.solutionCommand) {
      throw new Error(`${path}: missing goalTreeString or solutionCommand`);
    }

    levels.push({
      id,
      sequence: seqKey,
      order: order++,
      upstreamPath: path,
      name: en(raw.name),
      hint: en(raw.hint),
      // Trees are normalized JSON strings, parsed by the engine at runtime.
      // Remote levels nest their origin repo as an `originTree` key *inside*
      // these trees, so it travels along automatically.
      ...(raw.startTree
        ? { startTree: normalizeTree(raw.startTree, `${path}.startTree`) }
        : { usesDefaultTree: true }),
      goalTreeString: normalizeTree(raw.goalTreeString, `${path}.goalTreeString`),
      solutionCommand: raw.solutionCommand,
      // Every flag TreeCompare dispatches on, copied through generically --
      // whitelisting individual names silently drops grading rules and makes
      // levels pass that should not.
      ...Object.fromEntries(
        Object.entries(raw).filter(
          ([k]) =>
            /^compare/.test(k) || k === 'onlyEvaluateAsserts' || k === 'originCompare',
        ),
      ),
      // goalAsserts are predicate FUNCTIONS upstream, which JSON cannot carry
      // (they serialize to null and silently make levels pass). Keep their
      // source text so drift is visible; the runtime uses the hand-ported
      // equivalents in lib/git/asserts.ts, checked against these.
      ...(raw.goalAsserts && {
        goalAsserts: Object.fromEntries(
          Object.entries(raw.goalAsserts).map(([branch, fns]) => [
            branch,
            fns.map((fn) => String(fn).replace(/\s+/g, ' ').trim()),
          ]),
        ),
      }),
      ...(raw.disabledMap && { disabledMap: raw.disabledMap }),
      startDialog: enDialog(raw.startDialog),
    });
    ids.push(id);
  }
  sequences.push({ key: seqKey, levels: ids });
}

await mkdir(join(ROOT, 'data'), { recursive: true });
const out = {
  _source: 'learnGitBranching by Peter Cottle (MIT) -- see NOTICE',
  _generated: new Date().toISOString(),
  sequences,
  levels,
};
const outPath = join(ROOT, 'data', 'levels.json');
await writeFile(outPath, JSON.stringify(out, null, 2), 'utf8');

const kb = (JSON.stringify(out).length / 1024).toFixed(0);
console.log(`Imported ${levels.length} levels across ${sequences.length} sequences -> data/levels.json (${kb} KB)`);
for (const s of sequences) console.log(`  ${s.key.padEnd(16)} ${s.levels.length} levels`);
