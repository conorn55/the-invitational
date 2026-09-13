const DATA_URL = 'data/players.csv';
const CONFIG_URL = 'data/config.json';

// CSV header -> player field. Columns are matched by name, so their order doesn't matter.
const CSV_COLUMNS = {
  'name': 'name',
  'nickname': 'nickname',
  'games': 'gamesPlayed',
  'wins': 'wins',
  'top 3': 'top3',
  'top 5': 'top5',
  'points': 'points',
};

// Splits one CSV line. Quotes are only special at the start of a field, so both
// Excel-style "Steve ""The Joker""" and hand-typed Steve "The Joker" work.
function splitCsvLine(line) {
  const fields = [];
  let i = 0;
  while (i <= line.length) {
    let value = '';
    if (line[i] === '"') {
      i++;
      while (i < line.length) {
        if (line[i] === '"' && line[i + 1] === '"') { value += '"'; i += 2; }
        else if (line[i] === '"') { i++; break; }
        else { value += line[i++]; }
      }
      const end = line.indexOf(',', i);
      i = end === -1 ? line.length + 1 : end + 1;
    } else {
      const end = line.indexOf(',', i);
      value = line.slice(i, end === -1 ? line.length : end);
      i = end === -1 ? line.length + 1 : end + 1;
    }
    fields.push(value.trim());
  }
  return fields;
}

function parsePlayersCsv(text) {
  // Strip the byte-order mark spreadsheet apps sometimes add, and skip blank lines
  const lines = text.replace(/^﻿/, '').split(/\r?\n/).filter(l => l.trim());
  const headers = splitCsvLine(lines[0]).map(h => CSV_COLUMNS[h.toLowerCase()]);
  return lines.slice(1).map(line => {
    const player = {};
    splitCsvLine(line).forEach((value, i) => {
      const field = headers[i];
      if (!field) return;
      player[field] = field === 'name' || field === 'nickname' ? value : Number(value) || 0;
    });
    return player;
  });
}

function withDerived(players) {
  return players.map(p => {
    const winRate = p.gamesPlayed ? p.wins / p.gamesPlayed : 0;
    const top3Rate = p.gamesPlayed ? p.top3 / p.gamesPlayed : 0;
    const top5Rate = p.gamesPlayed ? p.top5 / p.gamesPlayed : 0;
    const avgPoints = p.gamesPlayed ? p.points / p.gamesPlayed : 0;
    return { ...p, winRate, top3Rate, top5Rate, avgPoints };
  });
}

function statValue(type, players, custom) {
  switch (type) {
    case 'playerCount': return players.length;
    case 'maxGames': return Math.max(...players.map(p => p.gamesPlayed), 0);
    case 'totalPoints': return players.reduce((sum, p) => sum + p.points, 0);
    case 'custom': return custom ?? '';
    default: return '';
  }
}

function renderHeaderStats(config, players) {
  const el = document.getElementById('headerStats');
  const stats = config.headerStats || [];
  el.innerHTML = stats.map(s => `
    <div class="hstat"><div class="val">${statValue(s.type, players, s.value)}</div><div class="lbl">${escapeHtml(s.label)}</div></div>
  `).join('');
}

function renderHeader(config) {
  document.getElementById('eventName').textContent = config.eventName;
  document.getElementById('eventSubtitle').textContent = config.subtitle;
  document.title = config.eventName;

  const logoEl = document.getElementById('eventLogo');
  if (config.logoImage) {
    logoEl.innerHTML = `<img src="${config.logoImage}" alt="${escapeHtml(config.eventName)} logo">`;
  } else {
    // Empty logoText and logoImage means no logo; .chip-suit:empty hides the space
    logoEl.textContent = config.logoText || '';
  }
}

function renderLeaderboard(players) {
  const tbody = document.getElementById('leaderboardBody');
  tbody.innerHTML = '';

  players.forEach((p, i) => {
    const rank = i + 1;
    const tr = document.createElement('tr');
    tr.dataset.rank = rank;
    tr.style.animationDelay = `${i * 45}ms`;
    tr.innerHTML = `
      <td class="col-rank"><span class="rank-badge"><span>${rank}</span></span></td>
      <td class="player-name">${escapeHtml(p.name)}${nicknameHtml(p)}</td>
      <td class="col-num">${p.gamesPlayed}</td>
      <td class="col-num">${p.wins}</td>
      <td class="col-num">${p.top3}</td>
      <td class="col-num">${p.top5}</td>
      <td class="col-num points-val">${p.points.toLocaleString('en-AU')}</td>
    `;
    tr.addEventListener('click', () => openDetail(p, rank, players.length));
    tbody.appendChild(tr);
  });
}

function nicknameHtml(p) {
  // Leading space gives the browser a place to wrap the nickname onto its own line
  return p.nickname ? ` <span class="nickname">“${escapeHtml(p.nickname)}”</span>` : '';
}

function pct(n) {
  return Math.round(n * 100);
}

function openDetail(p, rank, totalPlayers) {
  const content = document.getElementById('detailContent');
  content.innerHTML = `
    <div class="detail-header">
      <div class="detail-rank">${rank}</div>
      <div>
        <p class="detail-name">${escapeHtml(p.name)}${nicknameHtml(p)}</p>
        <p class="detail-sub">Rank ${rank} of ${totalPlayers}</p>
      </div>
    </div>
    <div class="stat-grid">
      <div class="stat-box"><div class="val">${p.gamesPlayed}</div><div class="lbl">Games Played</div></div>
      <div class="stat-box"><div class="val">${p.points}</div><div class="lbl">Total Points</div></div>
      <div class="stat-box"><div class="val">${p.wins}</div><div class="lbl">Wins</div></div>
      <div class="stat-box"><div class="val">${p.avgPoints.toFixed(1)}</div><div class="lbl">Avg Pts / Game</div></div>
    </div>
    <div class="bar-row">
      <div class="bar-label"><span>Win Rate</span><span>${pct(p.winRate)}%</span></div>
      <div class="bar-track"><div class="bar-fill" data-target="${pct(p.winRate)}"></div></div>
    </div>
    <div class="bar-row">
      <div class="bar-label"><span>Top 3 Finish Rate</span><span>${pct(p.top3Rate)}%</span></div>
      <div class="bar-track"><div class="bar-fill" data-target="${pct(p.top3Rate)}"></div></div>
    </div>
    <div class="bar-row">
      <div class="bar-label"><span>Top 5 Finish Rate</span><span>${pct(p.top5Rate)}%</span></div>
      <div class="bar-track"><div class="bar-fill" data-target="${pct(p.top5Rate)}"></div></div>
    </div>
  `;

  const overlay = document.getElementById('overlay');
  overlay.classList.add('open');

  requestAnimationFrame(() => {
    content.querySelectorAll('.bar-fill').forEach(bar => {
      bar.style.width = bar.dataset.target + '%';
    });
  });
}

function closeDetail() {
  document.getElementById('overlay').classList.remove('open');
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

async function init() {
  const overlay = document.getElementById('overlay');
  document.getElementById('closeBtn').addEventListener('click', closeDetail);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeDetail();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeDetail();
  });

  // no-cache: GitHub Pages lets browsers reuse JSON for 10 minutes, so results looked stale after a push
  const [playersRes, configRes] = await Promise.all([
    fetch(DATA_URL, { cache: 'no-cache' }),
    fetch(CONFIG_URL, { cache: 'no-cache' }),
  ]);
  const raw = parsePlayersCsv(await playersRes.text());
  const config = await configRes.json();
  const players = withDerived(raw).sort((a, b) => b.points - a.points);

  renderHeader(config);
  renderHeaderStats(config, players);
  renderLeaderboard(players);
}

init();
