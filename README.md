# Poker Tournament Leaderboard

A static leaderboard site for tracking your poker tournament season. No build step, no server — just HTML/CSS/JS plus one data file.

## Updating results

After each game, edit [`data/players.csv`](data/players.csv) in Excel, Numbers, Google Sheets or a text editor. Each row is one player:

```csv
Name,Nickname,Games,Wins,Top 3,Top 5,Points
Conor,,6,2,4,5,145
Steve,The Joker,6,1,3,4,120
```

- `Nickname` is optional; leave it blank for players without one. It shows in gold under the name.

- Add a new player by adding a new row. Keep the header row; its column order doesn't matter.
- Save as CSV (not .xlsx or .numbers) and keep the filename `players.csv`.
- Ranking is automatic — the page sorts everyone by `points` descending, so you don't need to reorder the file yourself.
- `points` is whatever your own scoring system produces (this site doesn't calculate points from placements — you enter the total).

Save the file, then commit and push (see below) to update the live site.

## Changing the title, logo and header stats

Edit [`data/config.json`](data/config.json) — no HTML editing needed:

```json
{
  "eventName": "The Invitational",
  "subtitle": "Season Leaderboard",
  "logoText": "",
  "logoImage": "",
  "headerStats": []
}
```

- `eventName` / `subtitle` — the big gold title and the spaced-out line underneath it, centred at the top of the page.
- `logoText` — an emoji or short text shown above the title (e.g. `"♠"`, `"🏆"`).
- `logoImage` — a path to an image (e.g. `"assets/logo.png"`) shown above the title instead of `logoText`; set it to `""` to use `logoText`. Put the image in the `assets/` folder first.
- Leave both `logoText` and `logoImage` as `""` for no logo (the current setting).
- `headerStats` — optional stat figures shown centred under the subtitle. It's empty (`[]`) by default, so nothing shows. To add some, give each one a `label` (whatever text you want) and a `type`:
  - `"playerCount"` — number of players
  - `"maxGames"` — highest Games value across all players
  - `"totalPoints"` — sum of everyone's Points
  - `"custom"` — a fixed value you set yourself, add a `"value"` field

  For example:

  ```json
  "headerStats": [
    { "label": "Players", "type": "playerCount" },
    { "label": "Prize Pool", "type": "custom", "value": "$400" }
  ]
  ```

  Stats sit side by side in one row, but turning them on adds that row to the header, so on shorter screens the table may no longer fit without scrolling.

## Viewing changes locally before publishing

Because the page loads `players.csv` with `fetch`, double-clicking `index.html` won't work (browsers block that for local files). Run a tiny local server from this folder instead:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000` in your browser.

## Publishing to GitHub Pages

1. Push this folder to a GitHub repository.
2. In the repo, go to **Settings → Pages**.
3. Under **Build and deployment**, set **Source** to "Deploy from a branch", branch `main`, folder `/ (root)`.
4. Save — GitHub will give you a URL like `https://<username>.github.io/<repo>/` within a minute or two.

From then on, any push to `main` updates the live site automatically — so updating results is just: edit `players.csv`, commit, push.

## Structure

- `index.html` — page markup
- `css/styles.css` — all styling
- `js/app.js` — loads the CSV and config, renders the table, handles the click-through detail panel
- `data/players.csv` — the file you touch to update results
- `data/config.json` — the file you touch to change the title, logo and header stats
