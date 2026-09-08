import { neon } from '@neondatabase/serverless';

/**
 * Neon Postgres access.
 *
 * The database is OPTIONAL by design. With no DATABASE_URL the game still
 * runs: accounts are unavailable and progress lives in localStorage only.
 * That keeps the site deployable and playable before any backend exists, and
 * means a database outage degrades to local play instead of a broken page.
 */

/**
 * Vercel's Postgres integrations do not agree on a variable name: Neon sets
 * DATABASE_URL, the older Vercel Postgres set POSTGRES_URL, and some setups
 * only expose the non-pooling variants. Accept all of them, preferring a
 * pooled connection, so a correct database is never missed just because the
 * dashboard named it something else.
 */
const CONNECTION_ENV_VARS = [
  'DATABASE_URL',
  'POSTGRES_URL',
  'POSTGRES_PRISMA_URL',
  'DATABASE_URL_UNPOOLED',
  'POSTGRES_URL_NON_POOLING',
] as const;

function findConnectionString(): { name: string; value: string } | null {
  for (const name of CONNECTION_ENV_VARS) {
    const value = process.env[name];
    if (value && value.trim()) return { name, value: value.trim() };
  }
  return null;
}

export const databaseConfigured = findConnectionString() !== null;

/** Which variable supplied the connection. Never returns the value itself. */
export function connectionSourceName(): string | null {
  return findConnectionString()?.name ?? null;
}

type Sql = ReturnType<typeof neon>;
let cached: Sql | null = null;

export function getSql(): Sql | null {
  const found = findConnectionString();
  if (!found) return null;
  if (!cached) cached = neon(found.value);
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
