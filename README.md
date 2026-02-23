# Monolith

Pre-launch landing page for Monolith:

- One chosen voice per day
- OAuth-only onboarding (Google + GitHub)
- Pseudonymous public usernames
- Live "people waiting" counter

## Stack

- Astro + React + Tailwind
- Supabase Auth + Postgres

## Local setup

1. Install dependencies:

```bash
npm install
```

2. Create your local env:

```bash
cp .env.example .env
```

3. Create a Supabase project and apply `supabase/migrations/*.sql` in filename order.
4. In Supabase Auth, enable OAuth providers:
- Google
- GitHub
5. Set OAuth redirect URLs:
- `http://localhost:4321/` (local dev)
- `https://your-domain.com/` (production)
6. Start dev server:

```bash
npm run dev
```

## Environment variables

| Variable | Required | Description |
| --- | --- | --- |
| `PUBLIC_SUPABASE_URL` | yes (for auth) | Supabase project URL |
| `PUBLIC_SUPABASE_PUBLISHABLE_KEY` | yes (for auth) | Supabase publishable key |
| `PUBLIC_LAUNCH_DATE` | no | Launch date in `YYYY-MM-DD` (default: `2026-03-31`) |
| `PUBLIC_SITE_URL` | recommended | Public site URL used for canonical + Open Graph image URLs |

## Database migrations

- Canonical source: `supabase/migrations/*.sql`
- Snapshot reference: `supabase/schema.sql` (legacy snapshot for inspection/export)

For new environments, apply all migration files in filename order.
For existing environments originally initialized from `supabase/schema.sql`,
do not re-run the baseline migration; apply only missing incremental files after it.

Current migration list:

- `supabase/migrations/20260216090000_initial_schema.sql`
- `supabase/migrations/20260218163000_username_immutable.sql`
- `supabase/migrations/20260223194000_pick_launch_gate.sql`
- `supabase/migrations/20260223195500_pool_rank_rpc.sql`

## Auth and username flow

1. User clicks `Join the speaker pool`.
2. User authenticates with Google or GitHub.
3. User chooses public username (`3-20`, lowercase letters, numbers, underscore).
4. Backend reserves one immutable pool position.
5. Landing shows: `You're #X in the pool`.

Email and OAuth identity are used internally for auth/spam prevention; public UI shows only username.
Username is immutable once set (DB-enforced trigger).

## Abuse + fairness rules (DB-enforced)

- Title minimum: `16` chars (`max 140`).
- Body minimum: `280` chars (`max 12000`).
- No AI "quality gate" is required to publish.
- Winner repetition is blocked with cooldown:
  - Default: `90` days (`pick_daily_chosen(..., 90)`).
  - The selected user gets `eligible_from = now() + cooldown`.

If no one is eligible under cooldown, selection falls back to any user in pool so daily operation never blocks.

## Daily selection + posting

The SQL schema includes:

- `pick_daily_chosen(p_day, p_cooldown_days)`:
  - Picks one user for the day (random from eligible pool).
  - Rejects days before launch date (DB-enforced gate).
  - Stores result in `daily_choices`.
  - Updates cooldown state in `selection_state`.
  - Execution is granted only to privileged backend key (run from backend/Edge Function/cron).
- `submit_monolith_post(p_day, p_title, p_body)`:
  - Only authenticated chosen author can write/update that day post.
  - Enforces title/body minimums.
- `get_chosen_for_day(p_day)`:
  - Public-safe read helper to get chosen user + username.
- `get_pool_rank(p_user_id)`:
  - Authenticated helper to return current queue rank without sequence gaps.

## Automation (daily pick)

Included in repo:

- GitHub Action: `.github/workflows/daily-pick.yml`
- Script: `scripts/pick-daily.mjs`

### Required GitHub secrets

- `SUPABASE_URL`
- `SUPABASE_SECRET_KEY`

The workflow runs every day at `00:05 UTC` and can also be triggered manually from GitHub Actions UI.
The picker script is launch-gated and skips selection before `PUBLIC_LAUNCH_DATE` (default `2026-03-31`).

### Manual run

```bash
SUPABASE_URL="https://YOUR_PROJECT.supabase.co" \
SUPABASE_SECRET_KEY="YOUR_SECRET_KEY" \
npm run pick:daily
```

Optional overrides:

```bash
PICK_DAY=2026-02-16 COOLDOWN_DAYS=90 LAUNCH_DATE=2026-03-31 npm run pick:daily
```

Legacy compatibility:
- The script still accepts `SUPABASE_SERVICE_ROLE_KEY` as fallback.
- Frontend still accepts `PUBLIC_SUPABASE_ANON_KEY` as fallback.

## Open Graph preview

Meta tags are included in `src/layouts/Layout.astro`.
Preview image is `public/og-image.svg`.

## Notes

- No password auth is implemented.
- If Supabase env vars are missing, UI stays in pre-launch mode and shows a config hint.
