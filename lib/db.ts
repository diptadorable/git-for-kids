import { neon } from '@neondatabase/serverless';

/**
 * Neon Postgres access.
 *
 * The database is OPTIONAL by design. With no DATABASE_URL the game still
 * runs: accounts are unavailable and progress lives in localStorage only.
 * That keeps the site deployable and playable before any backend exists, and
 * means a database outage degrades to local play instead of a broken page.
 */

export const databaseConfigured = Boolean(process.env.DATABASE_URL);

type Sql = ReturnType<typeof neon>;
let cached: Sql | null = null;

export function getSql(): Sql | null {
  if (!databaseConfigured) return null;
  if (!cached) cached = neon(process.env.DATABASE_URL!);
  return cached;
}

export interface UserRow {
  id: string;
  email: string;
  display_name: string | null;
  password_hash: string;
}

/**
 * Create the tables if they are missing.
 *
 * Called lazily from the auth paths rather than shipped as a migration step,
 * so a fresh Neon database set up through the Vercel dashboard just works
 * without the user running anything.
 */
let ensured: Promise<void> | null = null;

export function ensureSchema(): Promise<void> {
  const sql = getSql();
  if (!sql) return Promise.resolve();
  if (ensured) return ensured;

  ensured = (async () => {
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id            TEXT PRIMARY KEY,
        email         TEXT UNIQUE NOT NULL,
        display_name  TEXT,
        password_hash TEXT NOT NULL,
        created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS progress (
        user_id    TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        data       JSONB NOT NULL,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `;
    // Emails are matched case-insensitively so Bram@x.com and bram@x.com are
    // the same account -- a child will not remember which case they used.
    await sql`
      CREATE UNIQUE INDEX IF NOT EXISTS users_email_lower_idx
      ON users (lower(email))
    `;
  })().catch((err) => {
    // Let the next call retry rather than caching a failure forever.
    ensured = null;
    throw err;
  });

  return ensured;
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}
