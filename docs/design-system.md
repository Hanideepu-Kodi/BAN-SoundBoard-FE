# Design System Blueprint (YouTube-style)

## Tokens
- Colors
  - `bg.base` #0b0f17, `bg.panel` #111827, `bg.elevated` #162137
  - `fg.primary` #e9f1fb, `fg.muted` #94a3b8, `fg.invert` #0b0f17
  - `brand.primary` #4ff0c6, `brand.accent` #9f7bff, `brand.warm` #ffb864
  - `stroke.subtle` #1f2937, `stroke.strong` #2f3b52
  - `status.success` #4ade80, `status.info` #38bdf8, `status.warn` #fbbf24, `status.error` #f87171
- Typography
  - Display: Space Grotesk 700/600 (H1-H3)
  - Body/UI: Manrope 500/400
  - Mono: JetBrains Mono 500
- Spacing & Radii
  - Base 4px scale; macro steps: 4, 8, 12, 16, 20, 24, 32, 48, 64
  - Radii: `pill` 999px, `xl` 24px, `lg` 16px, `md` 12px, `sm` 8px
- Shadows/Blur
  - Base: 0 10px 30px rgba(0,0,0,0.35)
  - Glow: 0 0 0 1px rgba(79,240,198,0.35), 0 10px 40px rgba(79,240,198,0.25)
  - Frosted: backdrop-blur 10-16px with subtle inner border
- Motion
  - Easing: cubic-bezier(0.22, 1, 0.36, 1)
  - Durations: 120-240ms for UI, 400-800ms for section reveals

## Layout & Structure
- Separate routes per page: Home, Explore, Creator, Playlist, My Sounds, Saved.
- Shared chrome across pages: sidebar (desktop), top bar, and mobile bottom nav.

## Components
- Sidebar: shadcn/aceternity sidebar component (add via `npx shadcn@latest add https://21st.dev/r/aceternity/sidebar`) with Home, Explore, My Sounds, Playlists, Saved, Create.
- Top Bar (desktop): centered search with icon.
- Top Bar (mobile): logo-only left, search icon right; expand-to-search on tap.
- Bottom Nav (mobile): icon-only tabs for Home, Explore, Playlists, Profile; Create button centered (inspired by 21st.dev bottom-nav).
- Sound Card: title, creator row, tags, duration; click to play.
- Three-dot Menu: Save to playlist, Share, View creator.
- Creator Header: avatar, name, plays count, action buttons.
- Playlist Card: cover, count, privacy badge, save button.
- Playlist View: list/grid of sounds with play on click.
- Upload Modal: Create button opens modal; reuse current upload component inside modal shell.
- Empty States: friendly, short, action-led.
- Selects: themed dropdowns with custom chevron, glass background, focus glow.

## States & Variants
- Buttons: primary (brand gradient), secondary (outline + glow), ghost, destructive.
- Inputs: default, focus glow, error with inline hint.
- Cards: default, hover lift, active/playing (border + glow).
- Menus: hover highlight, divider lines, small icons for actions.

## Accessibility & Performance Notes
- Focus-visible styling on all interactive controls.
- Keyboard actions for play/stop and search focus.
- Reduced-motion disables card lift and background shimmer.
