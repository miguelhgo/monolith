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

3. Create a Supabase project and run `supabase/schema.sql` in SQL Editor.
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
| `PUBLIC_SUPABASE_ANON_KEY` | yes (for auth) | Supabase anon key |
| `PUBLIC_LAUNCH_DATE` | no | Launch date in `YYYY-MM-DD` (default: `2026-03-31`) |
| `PUBLIC_SITE_URL` | recommended | Public site URL used for canonical + Open Graph image URLs |

## Auth and username flow

1. User clicks `Join the speaker pool`.
2. User authenticates with Google or GitHub.
3. User chooses public username (`3-20`, lowercase letters, numbers, underscore).
4. Backend reserves one immutable pool position.
5. Landing shows: `You're #X in the pool`.

Email and OAuth identity are used internally for auth/spam prevention; public UI shows only username.

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
  - Stores result in `daily_choices`.
  - Updates cooldown state in `selection_state`.
  - Execution is granted only to `service_role` (run from backend/Edge Function/cron).
- `submit_monolith_post(p_day, p_title, p_body)`:
  - Only authenticated chosen author can write/update that day post.
  - Enforces title/body minimums.
- `get_chosen_for_day(p_day)`:
  - Public-safe read helper to get chosen user + username.

## Automation (daily pick)

Included in repo:

- GitHub Action: `.github/workflows/daily-pick.yml`
- Script: `scripts/pick-daily.mjs`

### Required GitHub secrets

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

The workflow runs every day at `00:05 UTC` and can also be triggered manually from GitHub Actions UI.

### Manual run

```bash
SUPABASE_URL="https://YOUR_PROJECT.supabase.co" \
SUPABASE_SERVICE_ROLE_KEY="YOUR_SERVICE_ROLE_KEY" \
npm run pick:daily
```

Optional overrides:

```bash
PICK_DAY=2026-02-16 COOLDOWN_DAYS=90 npm run pick:daily
```

## Open Graph preview

Meta tags are included in `src/layouts/Layout.astro`.
Preview image is `public/og-image.svg`.

## Notes

- No password auth is implemented.
- If Supabase env vars are missing, UI stays in pre-launch mode and shows a config hint.
