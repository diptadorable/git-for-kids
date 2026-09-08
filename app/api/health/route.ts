import { NextResponse } from 'next/server';
import { connectionSourceName, databaseConfigured, ensureSchema, getSql } from '@/lib/db';

/**
 * A self-check for "did my database setup actually work?".
 *
 * Reports only the connection's STATUS and which environment variable name
 * supplied it -- never the connection string, credentials, or raw driver
 * errors, which can carry host and user details.
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  if (!databaseConfigured) {
    return NextResponse.json({
      database: 'not-configured',
      via: null,
      hint:
        'No Postgres connection string found. In Vercel: Storage -> Neon -> create, ' +
        'then confirm a DATABASE_URL (or POSTGRES_URL) exists for the Production ' +
        'environment, then redeploy. Environment variables only apply to NEW deployments.',
    });
  }

  try {
    await ensureSchema();
    const sql = getSql()!;
    const rows = (await sql`SELECT count(*)::int AS users FROM users`) as unknown as {
      users: number;
    }[];

    return NextResponse.json({
      database: 'connected',
      via: connectionSourceName(),
      tablesReady: true,
      accounts: rows[0]?.users ?? 0,
      hint: 'Accounts are live. Sign up at /signup.',
    });
  } catch {
    return NextResponse.json({
      database: 'error',
      via: connectionSourceName(),
      hint:
        'A connection string was found but the database could not be reached. ' +
        'Check the value was copied whole, and that the Neon project is not deleted.',
    });
  }
}
