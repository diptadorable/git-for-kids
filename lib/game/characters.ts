/**
 * Casting: which character stands on which branch.
 *
 * The commit graph is the game world, so every branch needs a body in it.
 * `main` is always the Hero -- that is the player's own character, and it must
 * never change identity between levels. Everyone else is cast deterministically
 * from their branch name, so `bugFix` is the same ally in level 3 and level 30.
 */

export type CharacterKind = 'hero' | 'mage' | 'archer' | 'scout' | 'brawler' | 'ghost';

export interface Character {
  kind: CharacterKind;
  /** Main garment colour. Ghosts ignore this and render translucent. */
  color: string;
  /** Shadow tone under the garment. */
  shade: string;
}

/** Allies get distinct silhouettes so they are told apart at a glance. */
const ALLY_KINDS: CharacterKind[] = ['mage', 'archer', 'scout', 'brawler'];

const PALETTE: { color: string; shade: string }[] = [
  { color: '#f472b6', shade: '#9d174d' }, // pink
  { color: '#4ade80', shade: '#166534' }, // green
  { color: '#fbbf24', shade: '#92400e' }, // amber
  { color: '#a78bfa', shade: '#5b21b6' }, // violet
  { color: '#22d3ee', shade: '#155e75' }, // cyan
  { color: '#fb923c', shade: '#9a3412' }, // orange
];

const HERO: Character = { kind: 'hero', color: '#60a5fa', shade: '#1e40af' };
const GHOST: Character = { kind: 'ghost', color: '#c7d2fe', shade: '#4f46e5' };

/** Stable small hash so a branch keeps its look across levels and sessions. */
function hash(name: string): number {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return h;
}

export function characterFor(branchName: string): Character {
  if (branchName === 'main' || branchName === 'master') return HERO;
  // Remote-tracking branches are reflections of somewhere else, so they are
  // rendered as ghosts -- reinforcing that you cannot work on them directly.
  if (branchName.startsWith('o/')) return GHOST;

  const h = hash(branchName);
  return {
    kind: ALLY_KINDS[h % ALLY_KINDS.length],
    ...PALETTE[h % PALETTE.length],
  };
}

/**
 * What the hero is doing right now. Drives the action animation after a
 * command, so typing something has a physical consequence on screen.
 */
export type Pose =
  | 'idle'
  | 'strike' // commit -- forge a new platform
  | 'leap' // checkout / rebase -- move across the world
  | 'cast' // merge / cherry-pick -- pull work together
  | 'hurt' // rejected command
  | 'cheer'; // level solved

/** Map a git verb onto the action the hero performs. */
export function poseForCommand(line: string): Pose {
  const words = line.trim().split(/\s+/);
  const verb = words[0] === 'git' ? words[1] : words[0];

  switch (verb) {
    case 'commit':
    case 'gc':
    case 'add':
      return 'strike';
    case 'checkout':
    case 'switch':
    case 'go':
    case 'rebase':
    case 'reset':
      return 'leap';
    case 'merge':
    case 'cherry-pick':
    case 'pull':
    case 'push':
    case 'fetch':
    case 'clone':
    case 'revert':
      return 'cast';
    default:
      return 'idle';
  }
}
