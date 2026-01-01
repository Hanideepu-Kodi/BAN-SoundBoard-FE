# Kodi-board Checkpoint (2026-01-01)

## Auth + Backend State
- Supabase Auth (Google) is the chosen auth; NextAuth removed.
- Frontend uses Supabase JS client in `src/components/AuthProvider.tsx`.
- Frontend calls FastAPI via `src/lib/api-client.ts` using Supabase JWT bearer token.
- Local Next.js API routes and SQLite were removed.

## UX Direction
- Shift to a YouTube-style layout: sound feed on Home, creator profile pages, playlist pages, and a left sidebar with Create.
- All pages are separate routes (not a single long scroll); multi-play stays on by default.
- Sidebar uses the shadcn/aceternity component from `https://21st.dev/r/aceternity/sidebar`.

## FastAPI (current)
- Files: `backend/app/main.py`, `backend/app/auth.py`, `backend/app/db.py`, `backend/app/storage.py`, `backend/app/schemas.py`.
- Endpoints:
  - GET/POST `/playlists`
  - GET `/playlists/{playlist_id}`
  - POST `/playlists/{playlist_id}/sounds` (add)
  - DELETE `/playlists/{playlist_id}/sounds` (remove)
  - PUT `/playlists/{playlist_id}/sounds` (reorder)
  - POST `/playlists/{playlist_id}/share` (rotate token)
  - GET `/playlists/share/{token}`
  - GET/POST `/sounds` (search + upload)
  - GET `/health`
- Uses Supabase Storage private bucket + signed URLs.
- JWT verification uses `SUPABASE_JWT_SECRET`; RLS set via `set_config` in `backend/app/db.py`.

## Required Env Vars (root `.env`)
- `SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_JWT_SECRET`
- `DATABASE_URL`
- `SUPABASE_STORAGE_BUCKET=sounds`
- `SIGNED_URL_TTL_SECONDS=3600`
- `NEXT_PUBLIC_API_BASE_URL=http://localhost:8000`
- `FRONTEND_URL=http://localhost:3000`

## Supabase Auth Setup Checklist
- Google OAuth client in Google Cloud Console.
- Authorized redirect URI: `https://ppgrairmikllllsleogu.supabase.co/auth/v1/callback`.
- Supabase Auth URL config:
  - Site URL: `http://localhost:3000`
  - Additional Redirect URLs: `http://localhost:3000/**`

## Schema Assumptions (verify in Supabase)
- `playlists`: includes `share_token_hash`, `privacy` enum values `public | private | link_only`.
- `sounds`: includes `storage_path`, `size_bytes`, `format`, `description`.
- `tags`: `slug` (unique), `display`.
- `sound_tags`: `(sound_id, tag_id)` join.
- `playlist_sounds`: `position`.

## RLS Expectations
- All reads/writes go through FastAPI with Supabase JWT; RLS should be enabled.
- Public reads allowed for `privacy = public`; link-only via share token in FastAPI.

## Run Commands
- Frontend: `npm run dev`
- Backend (from `backend/`): `uvicorn app.main:app --reload --port 8000`

## What to do when you return
- Share any schema differences (column names/types).
- Confirm RLS policies are in place.
- I will adjust FastAPI queries and finalize end-to-end testing.
