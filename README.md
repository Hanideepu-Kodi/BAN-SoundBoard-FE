# Kodi-board (Next.js)

Fresh rebuild of the Kodi-board mock experience with the new visual system.

## Scripts
- `npm install` - install deps
- `npm run dev` - start dev server on http://localhost:3000
- `npm run build` - production build
- `npm start` - run production build
- `npm run lint` - lint

## Notes
- TailwindCSS with custom design tokens lives in `tailwind.config.ts` and `src/app/globals.css`.
- Fonts: Space Grotesk (display), Manrope (body), JetBrains Mono (accents).
- Configure Supabase credentials and API base URL in `.env.local` (see `.env.example`).

## Backend (FastAPI)
- Install: `python -m venv .venv && .venv\\Scripts\\activate`
- `pip install -r backend/requirements.txt`
- Run: `uvicorn app.main:app --reload --port 8000` (from `backend/`)
- Backend reads env vars from the repo root `.env`.

## Supabase Setup
- Create a private storage bucket named `sounds`.
- Run the SQL in `backend/sql/001_schema.sql` and `backend/sql/002_rls.sql`.
- Populate `.env` using `.env.example`.
- If your network blocks the direct DB host, use the Supabase connection pooler URI.
