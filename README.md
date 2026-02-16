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

## Open Graph preview

Meta tags are included in `src/layouts/Layout.astro`.
Preview image is `public/og-image.svg`.

## Notes

- No password auth is implemented.
- If Supabase env vars are missing, UI stays in pre-launch mode and shows a config hint.
