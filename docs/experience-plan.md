# End-to-End Experience Plan (YouTube-style)

## Information Architecture
- Home Feed: all sounds as cards, creator attribution, quick play.
- Explore: filtered feed with tags, sorting, and search.
- Creator Profile: header with plays count, sounds grid, playlists grid.
- Playlist Page: list/grid of sounds with instant play and save actions.
- My Sounds: owner profile page with manage actions (edit, privacy, delete).
- Saved: playlists saved from other creators.
- Upload (Create): modal-based flow triggered from sidebar.
- Share Pages: public link-only playlists with play-all.
- All of the above are separate pages/routes (not a single long scroll).

## Primary Navigation
- Left sidebar (shadcn/aceternity component): Home, Explore, My Sounds, Playlists, Saved, Create.
- Top bar (desktop): centered global search, sign-in access.
- Top bar (mobile): logo-only left, search icon right; tap reveals search input.
- Mobile bottom nav: icons for Home, Explore, Playlists, Profile, plus Create action.

## Core Flows
1) Browse and play
   - Home loads a sound feed; clicking any card plays instantly.
   - Hover or menu reveals actions: Save to playlist, Share, View creator.
   - Multi-play is enabled by default; clicking multiple cards layers sounds.
2) Save to playlist
   - Three-dot menu offers "Save to playlist" for any sound.
   - If no playlist exists, prompt to create one inline.
3) Creator profile
   - Clicking creator name/avatar opens the profile page.
   - Profile shows plays count, sound grid, and playlists.
4) Playlist viewing
   - Clicking a playlist shows its sounds, all playable.
   - Users can save another creator's playlist.
5) Upload
   - Sidebar Create opens a modal using the existing upload component.
   - Validation and status are shown before and after upload.
6) My Sounds management
   - Users can edit name, tags, and privacy; delete or play instantly.
7) Share
   - Share from menu produces a link; link-only playlist pages are public.
8) Privacy control
   - Playlists and sounds can be toggled between public, link-only, private.

## Page/Section Concepts
- Sound Card: title, creator row, tags, duration, three-dot menu; click to play.
- Creator Header: avatar, name, plays count, action buttons.
- Playlist Card: cover, sound count, privacy badge, save button.
- Upload Modal: drag/drop zone, validation checklist, privacy selector.
- Multi-play: sounds stack on click; no persistent player dock.

## Interaction & Motion
- Card hover lift and subtle glow.
- Menu opens with a short fade and slight slide.
- Staggered grid entrance for feed and playlists.
- Multi-play triggers stacked pulses on cards.

## Responsiveness
- Mobile: logo + search icon topbar; bottom nav handles routes + Create action.
- Tablet: two-column feed with compact creator rows.
- Desktop: full sidebar + wide feed grid.

## Success Metrics
- Time-to-first-play under 5 seconds on Home.
- Save-to-playlist conversion per session.
- Creator profile engagement (plays, saves, playlist opens).
