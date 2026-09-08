import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { databaseConfigured, ensureSchema, getSql } from '@/lib/db';
import { mergeProgress, type Progress } from '@/lib/game/progress';

/**
 * Progress sync.
 *
 * Writes MERGE rather than overwrite: the same child may play on a phone and
 * a laptop, and whichever device saves last must not wipe out a level solved
 * on the other one.
 */

export const runtime = 'nodejs';

function isProgress(value: unknown): value is Progress {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Progress;
  return (
    typeof candidate.completed === 'object' &&
    candidate.completed !== null &&
    typeof candidate.updatedAt === 'string'
  );
}

export async function GET() {
  if (!databaseConfigured) {
    return NextResponse.json({ progress: null, reason: 'no-database' });
  }
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'not signed in' }, { status: 401 });
  }

  try {
    await ensureSchema();
    const sql = getSql()!;
    const rows = (await sql`
      SELECT data FROM progress WHERE user_id = ${session.user.id} LIMIT 1
    `) as unknown as { data: Progress }[];

    return NextResponse.json({ progress: rows[0]?.data ?? null });
  } catch {
    // A sleeping or unreachable database must not break the game; the client
    // keeps playing from localStorage.
    return NextResponse.json({ progress: null, reason: 'unavailable' });
  }
}

export async function PUT(request: Request) {
  return save(request);
}

/** sendBeacon on page hide can only issue POST, so accept both verbs. */
export async function POST(request: Request) {
  return save(request);
}

async function save(request: Request) {
  if (!databaseConfigured) {
    return NextResponse.json({ progress: null, reason: 'no-database' });
  }
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'not signed in' }, { status: 401 });
  }

  let incoming: unknown;
  try {
    incoming = await request.json();
  } catch {
    return NextResponse.json({ error: 'bad json' }, { status: 400 });
  }
  if (!isProgress(incoming)) {
    return NextResponse.json({ error: 'bad payload' }, { status: 400 });
  }

  try {
    await ensureSchema();
    const sql = getSql()!;
    const rows = (await sql`
      SELECT data FROM progress WHERE user_id = ${session.user.id} LIMIT 1
    `) as unknown as { data: Progress }[];

    const merged = rows[0]?.data ? mergeProgress(rows[0].data, incoming) : incoming;

    await sql`
      INSERT INTO progress (user_id, data, updated_at)
      VALUES (${session.user.id}, ${JSON.stringify(merged)}::jsonb, now())
      ON CONFLICT (user_id)
      DO UPDATE SET data = EXCLUDED.data, updated_at = now()
    `;

    return NextResponse.json({ progress: merged });
  } catch {
    return NextResponse.json({ progress: null, reason: 'unavailable' });
  }
}
