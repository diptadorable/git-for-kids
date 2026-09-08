'use client';

import { useMemo, useState } from 'react';
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

  // No reset effect here on purpose: the page mounts this with key={level.id},
  // so moving to another level remounts with fresh state. That is React's
  // documented way to reset state on a prop change.

  const run = (line: string) => {
    if (line === 'reset') return setSession((s) => resetLevel(level, s));
    if (line === 'undo') return setSession((s) => undo(s));

    setSession((current) => {
      const { state, justSolved } = applyCommand(level, current, line);
      if (justSolved) {
        markSolved(level.id, state.commandCount);
        setCelebrating(true);
      }
      return state;
    });
  };

  const finishRebase = (chosen: string[]) => {
    setSession((current) => {
      const { state, justSolved } = applyInteractiveRebase(level, current, chosen);
      if (justSolved) {
        markSolved(level.id, state.commandCount);
        setCelebrating(true);
      }
      return state;
    });
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
          <div className="gfk-graph-scroll">
            <CommitGraph tree={session.tree} />
          </div>
        </section>

        {showGoal && (
          <section className="gfk-panel gfk-goal-panel">
            <h2 className="gfk-panel-title gfk-pixel">{t('goal')}</h2>
            <div className="gfk-graph-scroll">
              <CommitGraph tree={goalTree(level)} animate={false} />
            </div>
          </section>
        )}

        <section className="gfk-panel gfk-terminal-panel">
          <div className="gfk-terminal-toolbar">
            <button
              type="button"
              className="gfk-btn gfk-btn-ghost gfk-btn-small"
              onClick={() => setSession((s) => undo(s))}
              disabled={session.past.length === 0}
            >
              ↺ {t('undo')}
            </button>
            <button
              type="button"
              className="gfk-btn gfk-btn-ghost gfk-btn-small"
              onClick={() => setSession((s) => resetLevel(level, s))}
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
