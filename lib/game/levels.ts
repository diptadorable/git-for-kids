import data from '@/data/levels.json';
import type { Level } from './session';

/** The 36 imported levels, in their upstream order. */
export const LEVELS = (data as unknown as { levels: Level[] }).levels;

export const SEQUENCES = (data as unknown as {
  sequences: { key: string; levels: string[] }[];
}).sequences;

const byId = new Map(LEVELS.map((level) => [level.id, level]));

export function getLevel(id: string): Level | undefined {
  return byId.get(id);
}

/** Levels in play order, flattened across sequences. */
export const ORDERED_LEVEL_IDS = SEQUENCES.flatMap((s) => s.levels);

export function nextLevelId(id: string): string | null {
  const index = ORDERED_LEVEL_IDS.indexOf(id);
  if (index === -1 || index === ORDERED_LEVEL_IDS.length - 1) return null;
  return ORDERED_LEVEL_IDS[index + 1];
}

export function levelsOfSequence(key: string): Level[] {
  const sequence = SEQUENCES.find((s) => s.key === key);
  if (!sequence) return [];
  return sequence.levels
    .map((id) => byId.get(id))
    .filter((level): level is Level => Boolean(level));
}

/**
 * A level is playable once the one before it is done, so a beginner always has
 * exactly one obvious next step -- but the very first level is always open.
 */
export function isUnlocked(id: string, completed: Record<string, unknown>): boolean {
  const index = ORDERED_LEVEL_IDS.indexOf(id);
  if (index <= 0) return true;
  return Boolean(completed[ORDERED_LEVEL_IDS[index - 1]]);
}

/** Where "Continue" should take the player: first unfinished level. */
export function resumeLevelId(completed: Record<string, unknown>): string {
  return ORDERED_LEVEL_IDS.find((id) => !completed[id]) ?? ORDERED_LEVEL_IDS[0];
}
