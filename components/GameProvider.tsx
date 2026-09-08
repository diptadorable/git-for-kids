'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  DEFAULT_LANG,
  t as translate,
  type Lang,
  type StringKey,
} from '@/lib/i18n/strings';
import {
  emptyProgress,
  loadLocal,
  mergeProgress,
  pullRemote,
  pushRemote,
  recordWin,
  saveLocal,
  type Progress,
  type SyncStatus,
} from '@/lib/game/progress';

interface GameContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: StringKey) => string;
  progress: Progress;
  syncStatus: SyncStatus;
  markSolved: (levelId: string, commandCount: number) => void;
  isSolved: (levelId: string) => boolean;
  /** True until the stored progress has been read, so we avoid a flash. */
  hydrated: boolean;
}

const GameContext = createContext<GameContextValue | null>(null);

const LANG_KEY = 'gfk:lang';
const SAVE_DEBOUNCE_MS = 800;

export function GameProvider({
  children,
  signedIn = false,
}: {
  children: React.ReactNode;
  signedIn?: boolean;
}) {
  const [lang, setLangState] = useState<Lang>(DEFAULT_LANG);
  const [progress, setProgress] = useState<Progress>(emptyProgress);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  const [hydrated, setHydrated] = useState(false);

  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latest = useRef(progress);

  // Mirror the newest progress for the debounced save and the unload beacon,
  // both of which fire outside render and need the latest value.
  useEffect(() => {
    latest.current = progress;
  }, [progress]);

  // Read local state first so the game is playable before any network call.
  //
  // This deliberately sets state from an effect. localStorage does not exist
  // on the server, so seeding it during render would produce a hydration
  // mismatch; reading after mount is the correct trade and costs one extra
  // render on first load.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const local = loadLocal();
    setProgress(local);
    try {
      const storedLang = window.localStorage.getItem(LANG_KEY) as Lang | null;
      setLangState(storedLang ?? local.lang ?? DEFAULT_LANG);
    } catch {
      setLangState(local.lang ?? DEFAULT_LANG);
    }
    setHydrated(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Then reconcile with the server, which may know about another device.
  useEffect(() => {
    if (!hydrated || !signedIn) return;
    let cancelled = false;
    (async () => {
      const remote = await pullRemote();
      if (cancelled || !remote) return;
      setProgress((current) => {
        const merged = mergeProgress(current, remote);
        saveLocal(merged);
        return merged;
      });
    })();
    return () => {
      cancelled = true;
    };
  }, [hydrated, signedIn]);

  const scheduleSave = useCallback(
    (next: Progress) => {
      saveLocal(next);
      if (!signedIn) return;
      if (saveTimer.current) clearTimeout(saveTimer.current);
      setSyncStatus('saving');
      saveTimer.current = setTimeout(async () => {
        const merged = await pushRemote(latest.current);
        if (merged) {
          setProgress((current) => {
            const combined = mergeProgress(current, merged);
            saveLocal(combined);
            return combined;
          });
          setSyncStatus('saved');
        } else {
          setSyncStatus('offline');
        }
      }, SAVE_DEBOUNCE_MS);
    },
    [signedIn],
  );

  // Flush a pending save if the tab closes mid-debounce.
  useEffect(() => {
    const flush = () => {
      if (!saveTimer.current || !signedIn) return;
      clearTimeout(saveTimer.current);
      saveTimer.current = null;
      const body = JSON.stringify(latest.current);
      try {
        navigator.sendBeacon?.('/api/progress', new Blob([body], { type: 'application/json' }));
      } catch {
        /* best effort only -- localStorage already has it */
      }
    };
    window.addEventListener('pagehide', flush);
    return () => window.removeEventListener('pagehide', flush);
  }, [signedIn]);

  const setLang = useCallback(
    (next: Lang) => {
      setLangState(next);
      try {
        window.localStorage.setItem(LANG_KEY, next);
      } catch {
        /* ignore */
      }
      setProgress((current) => {
        const updated = { ...current, lang: next, updatedAt: new Date().toISOString() };
        scheduleSave(updated);
        return updated;
      });
    },
    [scheduleSave],
  );

  const markSolved = useCallback(
    (levelId: string, commandCount: number) => {
      setProgress((current) => {
        const updated = recordWin(current, levelId, commandCount);
        scheduleSave(updated);
        return updated;
      });
    },
    [scheduleSave],
  );

  const value = useMemo<GameContextValue>(
    () => ({
      lang,
      setLang,
      t: (key: StringKey) => translate(key, lang),
      progress,
      syncStatus,
      markSolved,
      isSolved: (levelId: string) => Boolean(progress.completed[levelId]),
      hydrated,
    }),
    [lang, setLang, progress, syncStatus, markSolved, hydrated],
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) throw new Error('useGame must be used inside <GameProvider>');
  return context;
}
