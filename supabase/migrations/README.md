# Supabase Migrations

Migration files in this folder are the canonical database history.
Apply migrations in filename order (oldest to newest).

## New environments
1. Run all files in `supabase/migrations/` in filename order.

## Existing environments
If the environment was originally initialized from `supabase/schema.sql`, do
not re-run `20260216090000_initial_schema.sql`.
Apply only missing incremental migrations after that baseline.
