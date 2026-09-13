# Poker Tournament Leaderboard

A static leaderboard site for tracking your poker tournament season. No build step, no server — just HTML/CSS/JS plus one data file.

## Updating results

After each game, edit [`data/players.json`](data/players.json). Each player is an object like this:

```json
{
  "name": "Conor",
  "gamesPlayed": 6,
  "wins": 2,
  "top3": 4,
  "top5": 5,
  "points": 145
}
```

- Add a new player by adding a new object to the array (copy an existing one and change the values).
- Ranking is automatic — the page sorts everyone by `points` descending, so you don't need to reorder the file yourself.
- `points` is whatever your own scoring system produces (this site doesn't calculate points from placements — you enter the total).

Save the file, then commit and push (see below) to update the live site.

## Changing the title, logo and top-right stats

Edit [`data/config.json`](data/config.json) — no HTML editing needed:

```json
{
  "eventName": "Poker Tournament",
  "subtitle": "Season Leaderboard",
  "logoText": "♠",
  "logoImage": "",
  "headerStats": [
    { "label": "Players", "type": "playerCount" },
    { "label": "Games", "type": "maxGames" },
    { "label": "Total Pts", "type": "totalPoints" }
  ]
}
```

- `eventName` / `subtitle` — the big title and text underneath it.
- `logoText` — an emoji or short text shown as the logo (e.g. `"♠"`, `"🏆"`).
- `logoImage` — set this to a path (e.g. `"assets/logo.png"`) to use an image instead; leave it `""` to use `logoText`. Drop your image file into an `assets/` folder in this project first.
- `headerStats` — the three tiles top-right. Each one has a `label` (whatever text you want) and a `type`:
  - `"playerCount"` — number of players
  - `"maxGames"` — highest `gamesPlayed` across all players
  - `"totalPoints"` — sum of everyone's `points`
  - `"custom"` — a fixed value you set yourself, add a `"value"` field, e.g. `{ "label": "Prize Pool", "type": "custom", "value": "$400" }`

Reorder, remove, or add tiles by editing the `headerStats` array — the layout adjusts automatically.

## Viewing changes locally before publishing

Because the page loads `players.json` with `fetch`, double-clicking `index.html` won't work (browsers block that for local files). Run a tiny local server from this folder instead:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000` in your browser.

## Publishing to GitHub Pages

1. Push this folder to a GitHub repository.
2. In the repo, go to **Settings → Pages**.
3. Under **Build and deployment**, set **Source** to "Deploy from a branch", branch `main`, folder `/ (root)`.
4. Save — GitHub will give you a URL like `https://<username>.github.io/<repo>/` within a minute or two.

From then on, any push to `main` updates the live site automatically — so updating results is just: edit `players.json`, commit, push.

## Structure

- `index.html` — page markup
- `css/styles.css` — all styling
- `js/app.js` — loads the JSON, renders the table, handles the click-through detail panel
- `data/players.json` — the file you touch to update results
- `data/config.json` — the file you touch to change the title, logo and header stats
