# Kodi-board Checkpoint

## Decisions Locked
- Auth: Supabase Auth (Google provider) with RLS.
- Storage: Supabase Storage private bucket + signed URLs.
- Link-only access: share token.
- Tags: normalized tags table (not text[]).
- All data access via FastAPI (no direct client DB access).
- UX direction: YouTube-style feed (sound cards), creator profiles, playlist pages, sidebar navigation.
- Pages are separate routes (not a single long scroll); multi-play remains core.
- Sidebar uses the shadcn/aceternity component from `https://21st.dev/r/aceternity/sidebar`.

## Current Code State (for reference)
- Next.js app uses Supabase Auth (client-side) and calls FastAPI for data.
- Next.js API routes and SQLite were removed.
- UI is wired for playlists, sounds, uploads, playback, add/remove/reorder.

## Supabase Setup Needed (when you return)
- Enable Google provider in Supabase Auth.
- Create private storage bucket: `sounds`.
- Create Postgres schema (tables + RLS + policies).

## Proposed Schema (normalized tags + share tokens)
- profiles (id uuid pk -> auth.users, handle, display_name, avatar_url, created_at)
- sounds (id uuid, owner_id uuid, name, description, storage_path, duration_seconds, size_bytes, format, privacy enum, created_at, updated_at)
- tags (id uuid, slug text unique, display text)
- sound_tags (sound_id uuid, tag_id uuid, primary key (sound_id, tag_id))
- playlists (id uuid, owner_id uuid, name, description, privacy enum, share_token_hash text, created_at, updated_at)
- playlist_sounds (playlist_id uuid, sound_id uuid, position int, added_at)

## RLS Policy Intent (summary)
- sounds: owner full access; public read when privacy = public; link-only read via share token check in FastAPI.
- playlists: owner full access; public read when privacy = public; link-only read via share token check in FastAPI.
- playlist_sounds: readable only if playlist readable; writable only if owner.
- tags: read public; write admin or owner-only (TBD).

## FastAPI Status
- Auth: Supabase JWT verification implemented.
- Storage: uploads to Supabase Storage + signed URLs implemented.
- Endpoints implemented:
  - GET/POST /playlists
  - GET /playlists/{id}
  - POST/DELETE/PUT /playlists/{id}/sounds (add/remove/reorder)
  - GET/POST /sounds (search + upload)
  - GET /playlists/share/{token} (link-only)

## Frontend Migration Status
- Supabase Auth client wired in `src/components/AuthProvider.tsx`.
- UI calls FastAPI via `src/lib/api-client.ts`.
- Local Next.js API routes removed.

## Env Vars You Will Need
- SUPABASE_URL
- SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY (server only)
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- NEXT_PUBLIC_API_BASE_URL (FastAPI)
- GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET (in Supabase dashboard)

When you are back, tell me:
- Your Supabase project URL and keys (or confirm they are set in `.env.local`).
- Whether you want tags admin-managed or user-managed.
