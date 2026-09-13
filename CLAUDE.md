# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A static poker season leaderboard: plain HTML/CSS/JS, no build step, no dependencies, no tests or linter. Hosted on GitHub Pages from `main` (root folder), so every push to `main` updates the live site.

## Running locally

The page loads its JSON with `fetch`, so opening `index.html` directly won't work. Serve the folder:

```bash
python3 -m http.server 8737
```

`.claude/launch.json` defines this as the `poker-leaderboard` preview server on port 8737. Rows fade in with a staggered animation, so wait a few seconds before screenshotting.

## Architecture

- `js/app.js` `init()` fetches `data/players.csv` and `data/config.json` in parallel, parses the CSV with `parsePlayersCsv` (headers mapped to fields via `CSV_COLUMNS`), adds derived rates (`withDerived`), sorts by `points` descending, then renders the header, header stats, and table. Rank is array position after sorting; it is never stored in the data.
- `data/config.json` drives the title (`eventName`), `subtitle`, logo (`logoImage` wins over `logoText`; both empty hides it via `.chip-suit:empty`, the current setting) and `headerStats`. `headerStats` is currently `[]` on purpose to match the design; `.header-stats:empty` hides the container.
- Table header cells (including the gold SVG icons for Wins / Top 3 / Top 5) are static in `index.html`; body rows are built in `renderLeaderboard`. The SVG icons share one `#goldGrad` gradient defined in a hidden `<svg>` above the table.
- Clicking a row opens the detail overlay (`openDetail`), which reuses the same player object.
- Player names pass through `escapeHtml`. The hand-rolled CSV parser accepts both Excel-style quoting (`"Steve ""The Joker"""`) and bare quotes (`Steve "The Joker"`); a name containing a comma must be wrapped in quotes.

## Styling constraints (css/styles.css)

- **Must fit one screen without scrolling** (checked at 1440×800 and 375×812 mobile). Row height, fonts and badge size use `vh`-based `clamp()`; if you make anything taller, re-check `document.documentElement.scrollHeight === innerHeight`.
- **Rows are separate rounded cards**: `border-collapse: separate` with `border-spacing`, borders and radius on the first/last cells. Row cells must stay opaque (the PTS cell layers its gold tint over the solid row gradient) so the page background never shows through a row.
- **Background**: `.bg-image` (inside `.bg-glow`) shows `assets/background.png` blurred at low opacity. `.board-card` is a mostly opaque dark panel that mutes the background in the gaps between rows.
- **Rank shields are a sprite sheet**: `assets/rank.png` (1599×984, no transparency) holds four 380×360 shields at x = 28 / 414 / 798 / 1186, y = 290 (gold, silver, bronze, grey for rank 4+). `.rank-badge` sizes from `--w`, picks the shield with `--x` via `tr[data-rank="N"]`, and draws it in `::before` with `mix-blend-mode: lighten` to drop the dark background. The number sits in an inner `<span>` so it paints above the blended image. If `rank.png` is replaced, these coordinates must still match.
- **Mobile** (`max-width: 560px`): the Top 5 column (6th column) is hidden via `nth-child(6)`, so adding or reordering columns affects that rule.
- **Nicknames**: the optional `Nickname` CSV column renders as small gold `.nickname` text beside the name, dropping to the next line only when there isn't room (table and detail overlay).
