import type { Lang } from '../i18n/strings';

/**
 * Progress is written to localStorage immediately and pushed to the server in
 * the background. The local copy is what the game reads, so a slow network,
 * a sleeping database or being signed out never blocks play or loses a win.
 */

export interface LevelRecord {
  solvedAt: string;
  /** Fewest commands used across all attempts. */
  bestCommandCount: number;
}

export interface Progress {
  completed: Record<string, LevelRecord>;
  lastLevelId?: string;
  lang?: Lang;
  updatedAt: string;
}

const STORAGE_KEY = 'gfk:progress:v1';

export function emptyProgress(): Progress {
  return { completed: {}, updatedAt: new Date(0).toISOString() };
}

export function loadLocal(): Progress {
  if (typeof window === 'undefined') return emptyProgress();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyProgress();
    const parsed = JSON.parse(raw) as Progress;
    if (!parsed || typeof parsed !== 'object' || !parsed.completed) return emptyProgress();
    return parsed;
  } catch {
    // Private windows and cleared site data both land here.
    return emptyProgress();
  }
}

export function saveLocal(progress: Progress) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    /* storage full or blocked -- the in-memory copy still works this session */
  }
}

/** Keep the better of two records so replaying a level never loses a best. */
export function mergeProgress(a: Progress, b: Progress): Progress {
  const completed: Record<string, LevelRecord> = { ...a.completed };
  for (const [id, record] of Object.entries(b.completed)) {
    const existing = completed[id];
    completed[id] = existing
      ? {
          solvedAt: existing.solvedAt < record.solvedAt ? existing.solvedAt : record.solvedAt,
          bestCommandCount: Math.min(existing.bestCommandCount, record.bestCommandCount),
        }
      : record;
  }
  const newer = a.updatedAt >= b.updatedAt ? a : b;
  return {
    completed,
    lastLevelId: newer.lastLevelId ?? a.lastLevelId ?? b.lastLevelId,
    lang: newer.lang ?? a.lang ?? b.lang,
    updatedAt: newer.updatedAt,
  };
}

export function recordWin(
  progress: Progress,
  levelId: string,
  commandCount: number,
): Progress {
  const existing = progress.completed[levelId];
  return {
    ...progress,
    completed: {
      ...progress.completed,
      [levelId]: {
        solvedAt: existing?.solvedAt ?? new Date().toISOString(),
        bestCommandCount: Math.min(existing?.bestCommandCount ?? Infinity, commandCount),
      },
    },
    lastLevelId: levelId,
    updatedAt: new Date().toISOString(),
  };
}

export type SyncStatus = 'idle' | 'saving' | 'saved' | 'offline';

/**
 * Push progress to the server. Returns the merged server copy when it wins a
 * conflict (e.g. the player got further on another device).
 */
export async function pushRemote(progress: Progress): Promise<Progress | null> {
  try {
    const res = await fetch('/api/progress', {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(progress),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { progress?: Progress };
    return data.progress ?? null;
  } catch {
    return null;
  }
}

export async function pullRemote(): Promise<Progress | null> {
  try {
    const res = await fetch('/api/progress');
    if (!res.ok) return null;
    const data = (await res.json()) as { progress?: Progress };
    return data.progress ?? null;
  } catch {
    return null;
  }
}
