# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A static poker season leaderboard: plain HTML/CSS/JS, no build step, no dependencies, no tests or linter. Hosted on GitHub Pages from `main` (root folder), so every push to `main` updates the live site.

## Running locally

The page loads `data/players.csv` and `data/config.json` with `fetch`, so opening `index.html` directly won't work. Serve the folder:

```bash
python3 -m http.server 8737
```

`.claude/launch.json` defines this as the `poker-leaderboard` preview server on port 8737. Rows fade in with a staggered animation, so wait a few seconds before screenshotting.

## Architecture

- `js/app.js` `init()` fetches `data/players.csv` and `data/config.json` in parallel, parses the CSV with `parsePlayersCsv` (headers mapped to fields via `CSV_COLUMNS`), adds derived rates (`withDerived`), sorts by `points` descending, then renders the header, header stats, and table. Rank is array position after sorting; it is never stored in the data.
- Both fetches use `cache: 'no-cache'` because GitHub Pages serves files with `max-age=600`, which made pushed results look stale. This only covers the data files: HTML/CSS/JS changes still need a hard refresh to show on the live site.
- `data/config.json` drives the title (`eventName`), `subtitle` and `headerStats`. `logoImage`/`logoText` keys may still be present in old config files but are no longer read — the header has no logo. `headerStats` is currently `[]` on purpose to match the design; `.header-stats:empty` hides the container.
- Table header cells (including the gold SVG icons for Wins / Top 3 / Top 5) are static in `index.html`; body rows are built in `renderLeaderboard`. The SVG icons share one `#goldGrad` gradient defined in a hidden `<svg>` above the table. `.col-icon svg` sets `letter-spacing: 0`, otherwise the header's wide letter-spacing is inherited by the digits inside the icons and pushes them off-centre.
- Clicking a row opens the detail overlay (`openDetail`), which reuses the same player object.
- `.view-tabs` is a `<nav>` above `.page-header` (not inside it), styled as a full-width tab bar — always centred, same on mobile and desktop, no per-breakpoint positioning needed. Clicking a `.view-tab` calls `showView`, which toggles `hidden` on the leaderboard table, hint and `#schedule` table, and swaps `#eventSubtitle`'s text: `renderHeader` stashes the configured subtitle in `subtitleEl.dataset.base`, and `showView` shows that verbatim for the leaderboard view or with "leaderboard" replaced by "Schedule" (case-insensitive) for the schedule view. `#schedule` reuses the `.leaderboard` table styles; `init()` loads `data/schedule.csv` (`Game,Date,Location,Complete`, dates `DD/MM/YYYY`, `Complete` is `Yes`/`No`), `parseScheduleCsv` sorts by date (all games shown, none dropped), and `renderSchedule` renders exactly one row per CSV row — no padding to a minimum count. A row with `Complete=Yes` gets the `complete` class, which strikes through its text via CSS rather than hiding the row.
- The schedule's `tbody` scrolls internally once its content exceeds `.leaderboard.schedule tbody`'s `max-height` (about 8 rows), rather than growing the page — the one exception to the "must fit one screen" rule below. This uses the "each row is its own mini-table" trick (`thead tr` and `tbody tr` both get `display: table; table-layout: fixed`) so the fixed header and scrolling body stay column-aligned; the Date and Location `<td>`s carry both their original class (for text styling) and the header's width class (`col-date`/`col-name`) so each row's independent table negotiates the same column widths as the header.
- Player names pass through `escapeHtml`. The hand-rolled CSV parser accepts both Excel-style quoting (`"Steve ""The Joker"""`) and bare quotes (`Steve "The Joker"`); a name containing a comma must be wrapped in quotes.

## Styling constraints (css/styles.css)

- **Must fit one screen without scrolling** (checked at 1440×800 and 375×812 mobile). Row height, fonts and badge size use `vh`-based `clamp()`; if you make anything taller, re-check `document.documentElement.scrollHeight === innerHeight`.
- **Rows are separate rounded cards**: `border-collapse: separate` with `border-spacing`, borders and radius on the first/last cells. Row cells must stay opaque (the PTS cell layers its gold tint over the solid row gradient) so the page background never shows through a row.
- **Background**: `.bg-image` (inside `.bg-glow`) shows `assets/background.png` blurred at low opacity. `.board-card` is a mostly opaque dark panel that mutes the background in the gaps between rows.
- **Rank shields are a sprite sheet**: `assets/rank.png` (1599×984, no transparency) holds four 380×360 shields at x = 28 / 414 / 798 / 1186, y = 290 (gold, silver, bronze, grey for rank 4+). `.rank-badge` sizes from `--w`, picks the shield with `--x` via `tr[data-rank="N"]`, and draws it in `::before` with `mix-blend-mode: lighten` to drop the dark background. The number sits in an inner `<span>` so it paints above the blended image. If `rank.png` is replaced, these coordinates must still match.
- **Mobile** (`max-width: 560px`): the Top 5 column (6th column) is hidden via `nth-child(6)`, so adding or reordering columns affects that rule. Known issue: at 375px wide the table overhangs the right edge of `.board-card` by about 7px (caused by the "GAMES" header's minimum width); the page itself doesn't scroll sideways.
- **Tablet** (`max-width: 760px`): tighter cell padding and smaller header text so the 32%-wide Player column fits.
- **Nicknames**: the optional `Nickname` CSV column renders as gold italic `.nickname` text at `0.8em`, always on its own line under the name (table and detail overlay).
