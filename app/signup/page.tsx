import { AuthForm } from '@/components/AuthForm';
import { signUpAction } from '@/app/actions/auth';
import { databaseConfigured } from '@/lib/db';

export default function SignUpPage() {
  return (
    <main className="gfk-shell">
      <div className="gfk-hero">
        <h1 className="gfk-pixel">Petualangan Git</h1>
      </div>
      <AuthForm mode="signup" action={signUpAction} databaseConfigured={databaseConfigured} />
    </main>
  );
}
