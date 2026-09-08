'use server';

import { randomUUID } from 'node:crypto';
import { AuthError } from 'next-auth';
import { hash } from 'bcryptjs';
import { z } from 'zod';
import { signIn, signOut } from '@/lib/auth';
import { databaseConfigured, ensureSchema, getSql, normalizeEmail } from '@/lib/db';

export interface AuthFormState {
  error?: 'invalid' | 'taken' | 'short' | 'nodb' | 'unavailable';
  message?: string;
}

const signUpSchema = z.object({
  email: z.string().email().max(200),
  password: z.string().min(8).max(200),
  displayName: z.string().trim().max(60).optional(),
});

export async function signUpAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  if (!databaseConfigured) return { error: 'nodb' };

  const parsed = signUpSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
    displayName: formData.get('displayName') || undefined,
  });

  if (!parsed.success) {
    const tooShort = parsed.error.issues.some(
      (issue) => issue.path[0] === 'password' && issue.code === 'too_small',
    );
    return { error: tooShort ? 'short' : 'invalid' };
  }

  const email = normalizeEmail(parsed.data.email);

  try {
    await ensureSchema();
    const sql = getSql()!;

    const existing = (await sql`
      SELECT id FROM users WHERE lower(email) = ${email} LIMIT 1
    `) as unknown as { id: string }[];
    if (existing.length > 0) return { error: 'taken' };

    const passwordHash = await hash(parsed.data.password, 10);
    await sql`
      INSERT INTO users (id, email, display_name, password_hash)
      VALUES (${randomUUID()}, ${email}, ${parsed.data.displayName ?? null}, ${passwordHash})
    `;
  } catch {
    return { error: 'unavailable' };
  }

  // Sign the new player straight in -- no "now go and log in" step.
  await signIn('credentials', {
    email,
    password: parsed.data.password,
    redirectTo: '/map',
  });
  return {};
}

export async function signInAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  if (!databaseConfigured) return { error: 'nodb' };

  try {
    await signIn('credentials', {
      email: String(formData.get('email') ?? ''),
      password: String(formData.get('password') ?? ''),
      redirectTo: '/map',
    });
    return {};
  } catch (error) {
    // NEXT_REDIRECT is how a successful signIn navigates; never swallow it.
    if (error instanceof AuthError) return { error: 'invalid' };
    throw error;
  }
}

export async function signOutAction() {
  await signOut({ redirectTo: '/' });
}
