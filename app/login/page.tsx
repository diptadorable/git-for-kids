import { AuthForm } from '@/components/AuthForm';
import { signInAction } from '@/app/actions/auth';
import { databaseConfigured } from '@/lib/db';

export default function LoginPage() {
  return (
    <main className="gfk-shell">
      <div className="gfk-hero">
        <h1 className="gfk-pixel">Petualangan Git</h1>
      </div>
      <AuthForm mode="signin" action={signInAction} databaseConfigured={databaseConfigured} />
    </main>
  );
}
