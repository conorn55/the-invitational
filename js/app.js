const DATA_URL = 'data/players.json';

function withDerived(players) {
  return players.map(p => {
    const winRate = p.gamesPlayed ? p.wins / p.gamesPlayed : 0;
    const top3Rate = p.gamesPlayed ? p.top3 / p.gamesPlayed : 0;
    const top5Rate = p.gamesPlayed ? p.top5 / p.gamesPlayed : 0;
    const avgPoints = p.gamesPlayed ? p.points / p.gamesPlayed : 0;
    return { ...p, winRate, top3Rate, top5Rate, avgPoints };
  });
}

function renderHeaderStats(players) {
  const totalGames = Math.max(...players.map(p => p.gamesPlayed), 0);
  const totalPlayers = players.length;
  const totalPoints = players.reduce((sum, p) => sum + p.points, 0);

  const el = document.getElementById('headerStats');
  el.innerHTML = `
    <div class="hstat"><div class="val">${totalPlayers}</div><div class="lbl">Players</div></div>
    <div class="hstat"><div class="val">${totalGames}</div><div class="lbl">Games</div></div>
    <div class="hstat"><div class="val">${totalPoints}</div><div class="lbl">Total Pts</div></div>
  `;
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
      <td class="col-rank"><span class="rank-badge">${rank}</span></td>
      <td class="player-name">${escapeHtml(p.name)}</td>
      <td class="col-num">${p.gamesPlayed}</td>
      <td class="col-num">${p.wins}</td>
      <td class="col-num">${p.top3}</td>
      <td class="col-num">${p.top5}</td>
      <td class="col-num points-val">${p.points}</td>
    `;
    tr.addEventListener('click', () => openDetail(p, rank, players.length));
    tbody.appendChild(tr);
  });
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
        <p class="detail-name">${escapeHtml(p.name)}</p>
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

function setLastUpdated(players) {
  const el = document.getElementById('lastUpdated');
  el.textContent = `${players.length} players tracked — edit data/players.json to update`;
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

  const res = await fetch(DATA_URL);
  const raw = await res.json();
  const players = withDerived(raw).sort((a, b) => b.points - a.points);

  renderHeaderStats(players);
  renderLeaderboard(players);
  setLastUpdated(players);
}

init();
