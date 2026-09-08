# Petualangan Git — Git Adventure

An adventure game for learning Git, built for a primary-school player.
Bahasa Indonesia and English, with a language toggle.

The 36 base levels are the ones from
[learnGitBranching](https://github.com/pcottle/learnGitBranching) (MIT,
© 2012–2025 Peter Cottle) — same levels, same order, nothing added or removed.
See [NOTICE](NOTICE) for full credits.

---

## What's inside

| Piece | Where | What it is |
|---|---|---|
| Git engine | `lib/git/` | An independent TypeScript implementation of the git model the levels teach |
| Grading | `lib/git/treeCompare.ts` | A port of upstream's `TreeCompare`, all 7 comparison strategies |
| Levels | `data/levels.json` | The 36 official level definitions, imported and pruned |
| Indonesian | `data/levels.id.json` | Our own translation — upstream has 17 languages but no Indonesian |
| Game UI | `components/game/` | Animated SVG commit graph, terminal, world map, quest dialogs |
| Accounts | `lib/auth.ts`, `lib/db.ts` | Email + password login, Neon Postgres, progress sync |

### Why the engine was rebuilt rather than forked

learnGitBranching is MIT-licensed, so forking it was allowed. But it is built
on jQuery, Backbone, Raphael and a gulp/browserify pipeline, and it stores
progress only in `localStorage`. Adding accounts and a database to that meant
fighting a 14-year-old build system.

Instead the level *data* was imported unchanged and the engine rewritten. The
risk in doing that is behaving subtly differently from the original — so that
risk is tested directly:

```bash
npm run conformance
```

Every level ships an official `solutionCommand` and a `goalTreeString`. The
suite runs each solution through this engine and grades the result with this
port of upstream's comparison. **All 36 levels reproduce upstream's exact goal
tree.** `scripts/negative-control.ts` confirms the suite can actually fail —
doing nothing is rejected on all 36 levels.

---

## Running it locally

```bash
npm install
```

Create `.env.local` (copy `.env.example`) and set a session key:

```bash
npx auth secret
```

Then start it:

```bash
npm run dev
```

Open http://localhost:3000.

**You do not need a database to play.** Without `DATABASE_URL` the game runs
fine and saves progress in the browser. Accounts simply aren't offered.

---

## Deploying to Vercel

### Step 1 — Import the repository

1. Go to [vercel.com/new](https://vercel.com/new).
2. Pick the `git-for-kids` repository and click **Import**.
3. Leave every build setting alone. Vercel detects Next.js automatically.
4. Before clicking Deploy, open **Environment Variables** and add:

   | Name | Value |
   |---|---|
   | `AUTH_SECRET` | Output of `npx auth secret` (or any long random string) |

5. Click **Deploy**.

At this point the game is live and playable. Progress saves in the browser.
If that is all you want, you can stop here.

### Step 2 — Add the database (needed for accounts)

Accounts and cross-device progress need Postgres.

1. In your Vercel project, open the **Storage** tab.
2. Choose **Neon** (Serverless Postgres) and create a database.
3. Vercel adds the connection string to your project automatically. Check
   **Settings → Environment Variables** for a `DATABASE_URL`.
   If the variable is named something else (for example `POSTGRES_URL`), add a
   new variable called `DATABASE_URL` with the same value.
4. **Redeploy** so the new variable is picked up
   (Deployments → latest → ⋯ → Redeploy).

The tables are created automatically the first time someone signs up. There is
no migration step to run.

> **Why Neon and not Supabase?** Supabase's free tier pauses a project after a
> week of inactivity and needs manual unpausing — so the game would break after
> a school holiday. Neon sleeps too, but wakes itself in under a second.

### Step 3 — Make an account

Visit `/signup` on your deployed site and create the player's account.
Sessions last 30 days, so they will not be asked for the password every visit.

---

## How progress saving works

1. Winning a level writes to `localStorage` **immediately**.
2. If signed in, it also syncs to the server after a short debounce.
3. Closing the tab mid-save flushes the pending write with `sendBeacon`.
4. Server writes **merge** rather than overwrite, so playing on a phone can
   never wipe a level solved on a laptop.

If the network or database is unavailable, the game keeps working and says so.
Progress is never lost to a failed sync — the local copy is the source of truth
for play.

---

## Commands

```bash
npm run dev            # local dev server
npm run build          # production build
npm run conformance    # verify all 36 levels match learnGitBranching
npm run import-levels  # re-import level data from upstream
```

---

## Translation status

All 36 level **names and hints** are translated to Indonesian, along with the
whole interface.

Full **lesson dialogs** are translated for the opening zone. Levels not yet
translated fall back to the original English text rather than showing a blank,
so every level is playable in both languages today. To see what is outstanding,
`untranslatedLevelIds()` in `lib/game/content.ts` reports it.
