'use client';

import Link from 'next/link';
import { useGame } from '@/components/GameProvider';
import { LANGS } from '@/lib/i18n/strings';

export function TopBar({
  signedIn,
  playerName,
  onSignOut,
  accountsAvailable = true,
}: {
  signedIn: boolean;
  playerName?: string | null;
  onSignOut: () => void;
  /** False when no database is configured -- then there is nothing to sign in to. */
  accountsAvailable?: boolean;
}) {
  const { t, lang, setLang, syncStatus } = useGame();

  return (
    <header className="gfk-topbar">
      <Link href="/" style={{ textDecoration: 'none' }}>
        <h1 className="gfk-pixel">{t('appName')}</h1>
      </Link>

      <div className="gfk-topbar-spacer" />

      {signedIn && syncStatus !== 'idle' && (
        <span className="gfk-sync">
          {syncStatus === 'saving'
            ? t('savingProgress')
            : syncStatus === 'saved'
              ? `✓ ${t('progressSaved')}`
              : t('saveFailed')}
        </span>
      )}

      <div className="gfk-langswitch" role="group" aria-label="Language">
        {LANGS.map((code) => (
          <button
            key={code}
            type="button"
            aria-pressed={lang === code}
            onClick={() => setLang(code)}
          >
            {code.toUpperCase()}
          </button>
        ))}
      </div>

      {signedIn ? (
        <>
          {playerName && <span className="gfk-muted">{playerName}</span>}
          <button type="button" className="gfk-btn gfk-btn-ghost gfk-btn-small" onClick={onSignOut}>
            {t('signOut')}
          </button>
        </>
      ) : (
        // Without a database, a sign-in link is a dead end -- hide it rather
        // than sending a child to a page that can only apologise.
        accountsAvailable && (
          <Link href="/login" className="gfk-btn gfk-btn-ghost gfk-btn-small">
            {t('signIn')}
          </Link>
        )
      )}
    </header>
  );
}
