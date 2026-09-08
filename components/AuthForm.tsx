'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { useGame } from '@/components/GameProvider';
import type { AuthFormState } from '@/app/actions/auth';

export function AuthForm({
  mode,
  action,
  databaseConfigured,
}: {
  mode: 'signin' | 'signup';
  action: (state: AuthFormState, formData: FormData) => Promise<AuthFormState>;
  databaseConfigured: boolean;
}) {
  const { t, lang } = useGame();
  const [state, formAction, pending] = useActionState(action, {});

  const copy = {
    id: {
      offlineTitle: 'Akun belum aktif',
      offlineBody:
        'Database belum disambungkan, jadi login belum bisa dipakai. Tenang -- kamu tetap bisa main, progresmu tersimpan di perangkat ini.',
      playAnyway: 'Main tanpa akun',
      unavailable: 'Server sedang sibuk. Coba lagi sebentar lagi ya.',
      invalidEmail: 'Emailnya sepertinya belum benar.',
    },
    en: {
      offlineTitle: 'Accounts not set up yet',
      offlineBody:
        'No database is connected yet, so signing in is unavailable. You can still play -- progress is saved on this device.',
      playAnyway: 'Play without an account',
      unavailable: 'The server is busy. Please try again in a moment.',
      invalidEmail: 'That email does not look right.',
    },
  }[lang];

  if (!databaseConfigured) {
    return (
      <div className="gfk-form">
        <h2 className="gfk-pixel gfk-heading">{copy.offlineTitle}</h2>
        <p className="gfk-muted">{copy.offlineBody}</p>
        <Link href="/map" className="gfk-btn">
          {copy.playAnyway} →
        </Link>
      </div>
    );
  }

  const errorMessage =
    state.error === 'taken'
      ? t('emailTaken')
      : state.error === 'short'
        ? t('passwordTooShort')
        : state.error === 'invalid'
          ? mode === 'signup'
            ? copy.invalidEmail
            : t('authFailed')
          : state.error === 'unavailable' || state.error === 'nodb'
            ? copy.unavailable
            : null;

  return (
    <form action={formAction} className="gfk-form">
      {mode === 'signup' && (
        <div className="gfk-field">
          <label htmlFor="displayName">{t('displayName')}</label>
          <input id="displayName" name="displayName" type="text" autoComplete="nickname" />
        </div>
      )}

      <div className="gfk-field">
        <label htmlFor="email">{t('email')}</label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          autoCapitalize="off"
          spellCheck={false}
        />
      </div>

      <div className="gfk-field">
        <label htmlFor="password">{t('password')}</label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
        />
      </div>

      {errorMessage && <p className="gfk-error">{errorMessage}</p>}

      <button type="submit" className="gfk-btn" disabled={pending}>
        {pending ? t('signingIn') : mode === 'signup' ? t('createAccount') : t('signIn')}
      </button>

      <p className="gfk-muted">
        {mode === 'signup' ? t('haveAccount') : t('noAccount')}{' '}
        <Link href={mode === 'signup' ? '/login' : '/signup'}>
          {mode === 'signup' ? t('signIn') : t('signUp')}
        </Link>
      </p>
    </form>
  );
}
