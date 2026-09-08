import Link from 'next/link';
import { auth } from '@/lib/auth';
import { databaseConfigured } from '@/lib/db';

export default async function HomePage() {
  const session = await auth();

  return (
    <main className="gfk-shell">
      <div className="gfk-hero">
        <div style={{ fontSize: '3.5rem' }} aria-hidden="true">
          🗺️
        </div>
        <h1 className="gfk-pixel">Petualangan Git</h1>
        <p>
          Belajar Git sambil bertualang. 36 level, dari commit pertama sampai jago remote.
          <br />
          <span style={{ opacity: 0.75 }}>
            Learn Git on an adventure. 36 levels, from your first commit to mastering remotes.
          </span>
        </p>
        <div className="gfk-modal-actions">
          <Link href="/map" className="gfk-btn">
            Mulai Bertualang →
          </Link>
          {databaseConfigured && !session?.user && (
            <Link href="/login" className="gfk-btn gfk-btn-ghost">
              Masuk
            </Link>
          )}
        </div>
      </div>
    </main>
  );
}
