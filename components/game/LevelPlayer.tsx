'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useGame } from '@/components/GameProvider';
import { CommitGraph } from './CommitGraph';
import { Terminal } from './Terminal';
import { QuestDialog } from './QuestDialog';
import { RebaseDialog } from './RebaseDialog';
import { Markdown } from '@/components/Markdown';
import {
  applyCommand,
  applyInteractiveRebase,
  goalTree,
  initSession,
  resetLevel,
  undo,
  type Level,
  type SessionState,
} from '@/lib/game/session';
import { localizedLevel } from '@/lib/game/content';
import { poseForCommand, type Pose } from '@/lib/game/characters';

export function LevelPlayer({
  level,
  nextLevelId,
}: {
  level: Level;
  nextLevelId: string | null;
}) {
  const { t, lang, markSolved, isSolved } = useGame();
  const content = useMemo(() => localizedLevel(level, lang), [level, lang]);

  const [session, setSession] = useState<SessionState>(() => initSession(level));
  const [showQuest, setShowQuest] = useState(true);
  const [showGoal, setShowGoal] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [celebrating, setCelebrating] = useState(false);
  const [pose, setPose] = useState<Pose>('idle');
  const [shaking, setShaking] = useState(false);
  const poseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Actions are momentary; drop back to idle so the world keeps breathing.
  useEffect(() => {
    if (pose === 'idle' || pose === 'cheer') return;
    if (poseTimer.current) clearTimeout(poseTimer.current);
    poseTimer.current = setTimeout(() => setPose('idle'), 700);
    return () => {
      if (poseTimer.current) clearTimeout(poseTimer.current);
    };
  }, [pose]);

  useEffect(() => {
    if (!shaking) return;
    const timer = setTimeout(() => setShaking(false), 400);
    return () => clearTimeout(timer);
  }, [shaking]);

  // No reset effect here on purpose: the page mounts this with key={level.id},
  // so moving to another level remounts with fresh state. That is React's
  // documented way to reset state on a prop change.

  /** Turn a command result into what the player sees the hero do. */
  const react = (state: SessionState, justSolved: boolean, action: Pose) => {
    setSession(state);
    const failed = state.log[state.log.length - 1]?.kind === 'error';

    if (justSolved) {
      markSolved(level.id, state.commandCount);
      setCelebrating(true);
      setPose('cheer');
    } else if (failed) {
      // A rejected command is an enemy blocking the way, not a silent no-op.
      setPose('hurt');
      setShaking(true);
    } else {
      setPose(action);
    }
  };

  const run = (line: string) => {
    if (line === 'reset') {
      setSession(resetLevel(level, session));
      setPose('idle');
      return;
    }
    if (line === 'undo') {
      setSession(undo(session));
      setPose('leap');
      return;
    }
    const { state, justSolved } = applyCommand(level, session, line);
    react(state, justSolved, poseForCommand(line));
  };

  const finishRebase = (chosen: string[]) => {
    const { state, justSolved } = applyInteractiveRebase(level, session, chosen);
    react(state, justSolved, 'leap');
  };

  const optimal = level.solutionCommand.split(';').filter((c) => c.trim()).length;

  return (
    <div className="gfk-play">
      <header className="gfk-play-head">
        <Link href="/map" className="gfk-btn gfk-btn-ghost gfk-btn-small">
          ← {t('backToMap')}
        </Link>
        <h1 className="gfk-pixel gfk-play-title">{content.name}</h1>
        <div className="gfk-play-head-actions">
          <button
            type="button"
            className="gfk-btn gfk-btn-ghost gfk-btn-small"
            onClick={() => setShowGoal((v) => !v)}
          >
            {showGoal ? t('hideGoal') : t('showGoal')}
          </button>
          <button
            type="button"
            className="gfk-btn gfk-btn-ghost gfk-btn-small"
            onClick={() => setShowQuest(true)}
          >
            {t('objective')}
          </button>
        </div>
      </header>

      <div className="gfk-play-grid">
        <section className="gfk-panel gfk-graph-panel">
          <h2 className="gfk-panel-title gfk-pixel">{t('yourRepo')}</h2>
          <div className={`gfk-graph-scroll${shaking ? ' gfk-world-hurt' : ''}`}>
            <CommitGraph tree={session.tree} pose={pose} />
          </div>
        </section>

        {showGoal && (
          <section className="gfk-panel gfk-goal-panel">
            <h2 className="gfk-panel-title gfk-pixel">{t('goal')}</h2>
            <div className="gfk-graph-scroll">
              <CommitGraph tree={goalTree(level)} animate={false} showCharacters={false} />
            </div>
          </section>
        )}

        <section className="gfk-panel gfk-terminal-panel">
          <div className="gfk-terminal-toolbar">
            <button
              type="button"
              className="gfk-btn gfk-btn-ghost gfk-btn-small"
              onClick={() => {
                setSession(undo(session));
                setPose('leap');
              }}
              disabled={session.past.length === 0}
            >
              ↺ {t('undo')}
            </button>
            <button
              type="button"
              className="gfk-btn gfk-btn-ghost gfk-btn-small"
              onClick={() => {
                setSession(resetLevel(level, session));
                setPose('idle');
              }}
            >
              ⟳ {t('reset')}
            </button>
            <button
              type="button"
              className="gfk-btn gfk-btn-ghost gfk-btn-small"
              onClick={() => setShowHint((v) => !v)}
            >
              💡 {t('showHint')}
            </button>
            {isSolved(level.id) && <span className="gfk-badge-done">★</span>}
          </div>

          {showHint && content.hint && (
            <div className="gfk-hint">
              <strong>{t('hint')}:</strong> <Markdown source={content.hint} />
            </div>
          )}

          <Terminal
            log={session.log}
            onSubmit={run}
            placeholder={t('typeCommand')}
            disabled={Boolean(session.pending)}
          />
        </section>
      </div>

      {showQuest && content.dialogViews.length > 0 && (
        <QuestDialog
          views={content.dialogViews}
          title={content.name}
          onClose={() => setShowQuest(false)}
          labels={{
            next: lang === 'id' ? 'Lanjut' : 'Next',
            back: lang === 'id' ? 'Kembali' : 'Back',
            start: lang === 'id' ? 'Ayo mulai!' : "Let's go!",
          }}
        />
      )}

      {session.pending && (
        <RebaseDialog
          commits={session.pending.commits}
          title={t('rebaseTitle')}
          help={t('rebaseHelp')}
          labels={{
            confirm: t('rebaseConfirm'),
            cancel: t('rebaseCancel'),
            dropped: t('dropped'),
          }}
          onConfirm={finishRebase}
          onCancel={() => setSession((s) => ({ ...s, pending: null }))}
        />
      )}

      {celebrating && (
        <div className="gfk-modal-backdrop">
          <div className="gfk-modal gfk-modal-narrow gfk-win">
            <div className="gfk-win-burst" aria-hidden="true">
              🎉
            </div>
            <h2 className="gfk-pixel">{t('levelComplete')}</h2>
            <p className="gfk-p">
              {session.commandCount} {t('commandsUsed')} · {t('bestSolution')}: {optimal}
            </p>
            <div className="gfk-modal-actions">
              <Link href="/map" className="gfk-btn gfk-btn-ghost">
                {t('backToMap')}
              </Link>
              {nextLevelId && (
                <Link href={`/play/${nextLevelId}`} className="gfk-btn">
                  {t('nextLevel')} →
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
