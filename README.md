# Poker Tournament Leaderboard

A static leaderboard site for tracking your poker tournament season. No build step, no server — just HTML/CSS/JS plus one data file.

## Updating results

After each game, edit [`data/players.csv`](data/players.csv) in Excel, Numbers, Google Sheets or a text editor. Each row is one player:

```csv
Name,Nickname,Games,Wins,Top 3,Top 5,Points
Conor,,6,2,4,5,145
Steve,The Joker,6,1,3,4,120
```

- Add a new player by adding a new row. Keep the header row; its column order doesn't matter, but don't rename the headings.
- `Nickname` is optional; leave it blank for players without one. It shows in gold italics on the line under the name. Type it plainly (`The Joker`); the quote marks are added for you.
- Save as CSV (not .xlsx or .numbers) and keep the filename `players.csv`.
- Ranking is automatic — the page sorts everyone by `Points`, highest first, so you don't need to reorder the file yourself.
- `Points` is whatever your own scoring system produces (this site doesn't calculate points from placements — you enter the total).
- If a name contains a comma, wrap it in double quotes. Spreadsheet apps do this for you.

Save the file, then commit and push (see below) to update the live site.

## Updating the schedule

The **Leaderboard** and **Schedule** buttons (top right) switch views; the one you're on is lit up gold. The schedule lists games from [`data/schedule.csv`](data/schedule.csv):

```csv
Game,Date,Location,Complete
2,26/09/2026,Conor's place,No
```

- `Date` must be `DD/MM/YYYY`. Games are sorted by date; none are ever hidden.
- Set `Complete` to `Yes` once a game has happened — that row shows with a strikethrough instead of disappearing. Leave it `No` for games still to come.
- The list shows exactly as many rows as the file has. Add as many games as you like — past about 8 rows it scrolls inside its own box instead of growing the page.
- Add, edit or remove rows freely; keep the header row and filename.

## Changing the title, logo and header stats

Edit [`data/config.json`](data/config.json) — no HTML editing needed:

```json
{
  "eventName": "The Invitational",
  "subtitle": "Season Leaderboard",
  "logoText": "♠",
  "logoImage": "assets/logo.png",
  "headerStats": []
}
```

- `eventName` / `subtitle` — the big gold title and the spaced-out line underneath it, centred at the top of the page.
- `logoText` — an emoji or short text shown above the title (e.g. `"♠"`, `"🏆"`).
- `logoImage` — a path to an image (e.g. `"assets/logo.png"`) shown above the title instead of `logoText`; set it to `""` to use `logoText`. Put the image in the `assets/` folder first.
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

GitHub takes a minute or two to publish after a push. New results then show on a normal refresh. Design changes (HTML, CSS or JavaScript) can take up to 10 minutes to appear because browsers keep a saved copy; use a hard refresh (`Cmd + Shift + R` on Mac, `Ctrl + F5` on Windows) or a private window to see them straight away.

## On phones

On screens 560px wide or narrower (most phones), the Top 5 column is hidden to save space. Long nicknames may wrap onto two lines.

## Structure

- `index.html` — page markup
- `css/styles.css` — all styling
- `js/app.js` — loads the CSV and config, renders the table, handles the click-through detail panel
- `data/players.csv` — the file you touch to update results
- `data/config.json` — the file you touch to change the title, logo and header stats
- `assets/` — images: `logo.png` (header logo), `background.png` (blurred page background) and `rank.png` (the four rank shields, cut out by position, so keep the shields in the same places if you replace it)
