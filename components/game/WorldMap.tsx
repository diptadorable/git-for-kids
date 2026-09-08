'use client';

import Link from 'next/link';
import { useGame } from '@/components/GameProvider';
import { TopBar } from '@/components/TopBar';
import { SEQUENCES, isUnlocked, levelsOfSequence, resumeLevelId } from '@/lib/game/levels';
import { localizedLevel } from '@/lib/game/content';
import { SEQUENCE_INFO } from '@/lib/i18n/strings';
import { LEVELS } from '@/lib/game/levels';

const ZONE_ICON: Record<string, string> = {
  intro: '🏡',
  rampup: '🌲',
  move: '⛏️',
  mixed: '🏺',
  advanced: '🐉',
  remote: '⚓',
  remoteAdvanced: '🏰',
};

export function WorldMap({
  signedIn,
  playerName,
  onSignOut,
}: {
  signedIn: boolean;
  playerName?: string | null;
  onSignOut: () => void;
}) {
  const { t, lang, progress, hydrated } = useGame();
  const completed = progress.completed;
  const doneCount = Object.keys(completed).length;
  const percent = Math.round((doneCount / LEVELS.length) * 100);

  return (
    <main className="gfk-shell">
      <TopBar signedIn={signedIn} playerName={playerName} onSignOut={onSignOut} />

      <div className="gfk-zone-head">
        <h2 className="gfk-pixel">{t('worldMap')}</h2>
        <span className="gfk-muted">
          {doneCount} / {LEVELS.length} {t('levelsDone')}
        </span>
      </div>
      <div className="gfk-progressbar" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}>
        <div style={{ width: `${percent}%` }} />
      </div>

      {hydrated && (
        <p style={{ marginBottom: '2rem' }}>
          <Link href={`/play/${resumeLevelId(completed)}`} className="gfk-btn">
            {doneCount > 0 ? t('continue') : t('start')} →
          </Link>
        </p>
      )}

      {SEQUENCES.map((sequence) => {
        const info = SEQUENCE_INFO[sequence.key];
        const levels = levelsOfSequence(sequence.key);
        const doneHere = levels.filter((l) => completed[l.id]).length;

        return (
          <section key={sequence.key} className="gfk-zone">
            <div className="gfk-zone-head">
              <span aria-hidden="true" style={{ fontSize: '1.5rem' }}>
                {ZONE_ICON[sequence.key] ?? '⭐'}
              </span>
              <h2 className="gfk-pixel">{info?.name[lang] ?? sequence.key}</h2>
              <span className="gfk-muted">
                {doneHere}/{levels.length}
              </span>
            </div>
            <p className="gfk-zone-about">{info?.about[lang]}</p>

            <div className="gfk-nodes">
              {levels.map((level, index) => {
                const done = Boolean(completed[level.id]);
                // Before hydration everything looks locked, which would flash
                // the wrong state -- so treat unknown as unlocked until read.
                const unlocked = !hydrated || isUnlocked(level.id, completed);
                const name = localizedLevel(level, lang).name;

                const className = [
                  'gfk-node',
                  done ? 'gfk-node-done' : '',
                  unlocked ? '' : 'gfk-node-locked',
                ]
                  .filter(Boolean)
                  .join(' ');

                return unlocked ? (
                  <Link key={level.id} href={`/play/${level.id}`} className={className}>
                    <span className="gfk-node-num">{done ? '★' : index + 1}</span>
                    <span className="gfk-node-name">{name}</span>
                  </Link>
                ) : (
                  <span
                    key={level.id}
                    className={className}
                    title={t('lockedHint')}
                    aria-disabled="true"
                  >
                    <span className="gfk-node-num">🔒</span>
                    <span className="gfk-node-name">{name}</span>
                  </span>
                );
              })}
            </div>
          </section>
        );
      })}
    </main>
  );
}
