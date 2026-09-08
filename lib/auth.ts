import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { compare } from 'bcryptjs';
import { z } from 'zod';
import { databaseConfigured, ensureSchema, getSql, normalizeEmail, type UserRow } from './db';

/**
 * Email + password accounts.
 *
 * Sessions are JWTs, so there is no session table and no database round trip
 * on every page -- which matters on a free serverless Postgres that sleeps
 * when idle. Sessions are long-lived on purpose: a child should not be made
 * to retype a password every time they come back to play.
 */

export const credentialsSchema = z.object({
  email: z.string().email().max(200),
  password: z.string().min(8).max(200),
});

const THIRTY_DAYS = 60 * 60 * 24 * 30;

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  session: { strategy: 'jwt', maxAge: THIRTY_DAYS },
  pages: { signIn: '/login' },
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(raw) {
        if (!databaseConfigured) return null;

        const parsed = credentialsSchema.safeParse(raw);
        if (!parsed.success) return null;

        await ensureSchema();
        const sql = getSql();
        if (!sql) return null;

        const email = normalizeEmail(parsed.data.email);
        const rows = (await sql`
          SELECT id, email, display_name, password_hash
          FROM users
          WHERE lower(email) = ${email}
          LIMIT 1
        `) as unknown as UserRow[];

        const user = rows[0];
        if (!user) return null;

        const ok = await compare(parsed.data.password, user.password_hash);
        if (!ok) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.display_name ?? user.email.split('@')[0],
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user?.id) token.sub = user.id;
      return token;
    },
    session({ session, token }) {
      if (session.user && token.sub) session.user.id = token.sub;
      return session;
    },
  },
});
