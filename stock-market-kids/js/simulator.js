/**
 * simulator.js — Paper Trading Simulator for Stock Market Learning Guide
 * 5 fictional companies, 8 weeks, news events, portfolio tracking, chart.
 *
 * ⚠️ All companies and prices are FICTIONAL. Educational only.
 * <!-- FUTURE: Vietnamese i18n -->
 */

'use strict';

const Simulator = (() => {
  /* ──────────── State ──────────── */
  let sim = null; // initialized on start
  let chart = null;

  function createFreshState() {
    return {
      week: 0,
      maxWeeks: CONFIG.simulationWeeks,
      cash: CONFIG.startingCash,
      companies: COMPANIES.map(c => ({
        ...c,
        price: c.startPrice + (Math.random() - 0.5) * 10, // randomize ±$5
        shares: 0,
        avgCost: 0,
        priceHistory: [],
      })),
      portfolioHistory: [],
      newsLog: [],
      finished: false,
    };
  }

  /* ──────────── Init ──────────── */
  function init(forceNew) {
    // Try to resume a saved simulation unless forceNew
    if (!forceNew) {
      const saved = loadSimState();
      if (saved && !saved.finished) {
        sim = saved;
        renderUI();
        return;
      }
    }

    sim = createFreshState();
    // Record initial prices
    sim.companies.forEach(c => {
      c.price = +c.price.toFixed(2);
      c.priceHistory.push(c.price);
    });
    sim.portfolioHistory.push(getPortfolioValue());
    saveSimState();
    renderUI();
  }

  /* ──────────── Portfolio Calculation ──────────── */
  function getPortfolioValue() {
    const holdings = sim.companies.reduce((sum, c) => sum + c.shares * c.price, 0);
    return +(sim.cash + holdings).toFixed(2);
  }

  function getHoldingsValue() {
    return sim.companies.reduce((sum, c) => sum + c.shares * c.price, 0);
  }

  /* ──────────── Trade Actions ──────────── */
  function buyShare(companyId) {
    if (sim.finished) return;
    const c = sim.companies.find(co => co.id === companyId);
    if (!c || sim.cash < c.price) return;

    // Update average cost
    const totalCost = c.avgCost * c.shares + c.price;
    c.shares++;
    c.avgCost = +(totalCost / c.shares).toFixed(2);
    sim.cash = +(sim.cash - c.price).toFixed(2);

    saveSimState();
    renderUI();
  }

  function sellShare(companyId) {
    if (sim.finished) return;
    const c = sim.companies.find(co => co.id === companyId);
    if (!c || c.shares <= 0) return;

    c.shares--;
    sim.cash = +(sim.cash + c.price).toFixed(2);
    if (c.shares === 0) c.avgCost = 0;

    saveSimState();
    renderUI();
  }

  /* ──────────── Advance Week ──────────── */
  function advanceWeek() {
    if (sim.finished || sim.week >= sim.maxWeeks) return;
    sim.week++;

    // Generate news events
    const weekNews = [];
    const numEvents = 1 + (Math.random() > 0.5 ? 1 : 0); // 1-2 events
    const shuffledCompanies = [...sim.companies].sort(() => Math.random() - 0.5);

    for (let i = 0; i < numEvents && i < shuffledCompanies.length; i++) {
      const company = shuffledCompanies[i];
      const pool = NEWS_POOL[company.id];
      if (!pool || pool.length === 0) continue;

      const newsItem = pool[Math.floor(Math.random() * pool.length)];
      const impact = newsItem.impact[0] + Math.random() * (newsItem.impact[1] - newsItem.impact[0]);

      company.price = +(company.price * impact).toFixed(2);
      company.price = Math.max(1, company.price); // Floor at $1

      weekNews.push({
        week: sim.week,
        company: company.name,
        emoji: company.emoji,
        text: newsItem.text,
        sentiment: newsItem.sentiment,
      });
    }

    // Also apply small random drift to companies without news
    sim.companies.forEach(c => {
      if (!weekNews.find(n => n.company === c.name)) {
        const drift = 1 + (Math.random() - 0.48) * 0.06; // slight upward bias, ±3%
        c.price = +(c.price * drift).toFixed(2);
        c.price = Math.max(1, c.price);
      }
      c.priceHistory.push(c.price);
    });

    sim.newsLog.push(...weekNews);
    sim.portfolioHistory.push(getPortfolioValue());

    // Check if finished
    if (sim.week >= sim.maxWeeks) {
      sim.finished = true;
    }

    saveSimState();
    renderUI();
  }

  /* ──────────── Render ──────────── */
  function renderUI() {
    const container = document.getElementById('simulatorContainer');
    if (!container) return;

    if (sim.finished) {
      renderEndScreen(container);
      return;
    }

    let html = '';

    // Stats bar
    const portfolioVal = getPortfolioValue();
    const returnPct = ((portfolioVal - CONFIG.startingCash) / CONFIG.startingCash * 100).toFixed(1);
    const returnClass = portfolioVal >= CONFIG.startingCash ? 'positive' : 'negative';

    html += `
      <div class="sim-header">
        <div class="sim-stats">
          <div class="sim-stat">
            <div class="stat-val">Week ${sim.week}/${sim.maxWeeks}</div>
            <div class="stat-lbl">⏰ Time</div>
          </div>
          <div class="sim-stat">
            <div class="stat-val">$${sim.cash.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
            <div class="stat-lbl">💵 Cash</div>
          </div>
          <div class="sim-stat">
            <div class="stat-val ${returnClass}">$${portfolioVal.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
            <div class="stat-lbl">📊 Portfolio</div>
          </div>
          <div class="sim-stat">
            <div class="stat-val ${returnClass}">${returnPct >= 0 ? '+' : ''}${returnPct}%</div>
            <div class="stat-lbl">📈 Return</div>
          </div>
        </div>
      </div>
    `;

    // News ticker
    if (sim.newsLog.length > 0) {
      html += '<div class="news-ticker">';
      html += '<h4 style="margin-bottom:8px;font-size:0.85rem;color:var(--text-muted);">📰 Market News</h4>';
      // Show most recent first
      const recentNews = [...sim.newsLog].reverse().slice(0, 6);
      recentNews.forEach(n => {
        const sentColor = n.sentiment === 'positive' ? 'var(--gain)' : n.sentiment === 'negative' ? 'var(--loss)' : 'var(--text-muted)';
        html += `<div class="news-item">
          <span class="news-week">W${n.week}</span>
          <span style="color:${sentColor};">${n.text}</span>
        </div>`;
      });
      html += '</div>';
    }

    // Portfolio table
    html += `
      <table class="portfolio-table">
        <thead>
          <tr>
            <th>Company</th>
            <th>Price</th>
            <th>Shares</th>
            <th>Avg Cost</th>
            <th>Value</th>
            <th>Gain/Loss</th>
            <th>Trade</th>
          </tr>
        </thead>
        <tbody>
    `;

    sim.companies.forEach(c => {
      const value = +(c.shares * c.price).toFixed(2);
      const gl = c.shares > 0 ? +((c.price - c.avgCost) * c.shares).toFixed(2) : 0;
      const glPct = c.shares > 0 && c.avgCost > 0 ? ((c.price - c.avgCost) / c.avgCost * 100).toFixed(1) : '0.0';
      const glClass = gl >= 0 ? 'positive' : 'negative';
      const canBuy = sim.cash >= c.price;
      const canSell = c.shares > 0;

      html += `
        <tr>
          <td><strong>${c.emoji} ${c.name}</strong><br><span style="font-size:0.75rem;color:var(--text-muted);">${c.sector}</span></td>
          <td>$${c.price.toFixed(2)}</td>
          <td>${c.shares}</td>
          <td>${c.shares > 0 ? '$' + c.avgCost.toFixed(2) : '—'}</td>
          <td>${c.shares > 0 ? '$' + value.toFixed(2) : '—'}</td>
          <td class="${glClass}">${c.shares > 0 ? (gl >= 0 ? '+' : '') + '$' + gl.toFixed(2) + ' (' + (gl >= 0 ? '+' : '') + glPct + '%)' : '—'}</td>
          <td>
            <div class="trade-btn-group">
              <button class="trade-btn buy" onclick="Simulator.buyShare('${c.id}')" ${canBuy ? '' : 'disabled'} title="Buy 1 share">+</button>
              <button class="trade-btn sell" onclick="Simulator.sellShare('${c.id}')" ${canSell ? '' : 'disabled'} title="Sell 1 share">−</button>
            </div>
          </td>
        </tr>
      `;
    });

    html += '</tbody></table>';

    // Chart container
    html += '<div class="chart-container"><div id="simChart"></div></div>';

    // Advance button
    html += `
      <div style="text-align:center;">
        <button class="sim-advance-btn" onclick="Simulator.advanceWeek()" ${sim.finished ? 'disabled' : ''}>
          ${sim.week === 0 ? '▶️ Start Week 1' : sim.week < sim.maxWeeks ? `⏭️ Advance to Week ${sim.week + 1}` : '✅ Simulation Complete'}
        </button>
      </div>
    `;

    container.innerHTML = html;

    // Render chart
    renderChart();
  }

  function renderChart() {
    const chartEl = document.getElementById('simChart');
    if (!chartEl || sim.portfolioHistory.length < 1) return;

    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

    const weeks = sim.portfolioHistory.map((_, i) => i);
    const data = [weeks, sim.portfolioHistory];
    const series = [{ label: 'Portfolio Value', color: '#14b8a6' }];

    // Also add individual company price lines once trading has begun
    sim.companies.forEach(c => {
      if (c.priceHistory.length > 1) {
        data.push(c.priceHistory.map(p => p));
        series.push({ label: c.name, color: c.color });
      }
    });

    if (chart) chart.destroy();
    chart = new MiniChart(chartEl, {
      width: Math.min(chartEl.parentElement.offsetWidth - 32, 700),
      height: 260,
      series,
      data,
      title: '📊 Portfolio & Stock Prices Over Time',
      textColor: isDark ? 'rgba(200,200,200,0.8)' : 'rgba(100,100,100,0.9)',
      gridColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
    });
  }

  /* ──────────── End Screen ──────────── */
  function renderEndScreen(container) {
    const finalVal = getPortfolioValue();
    const returnPct = ((finalVal - CONFIG.startingCash) / CONFIG.startingCash * 100).toFixed(1);
    const isProfit = finalVal >= CONFIG.startingCash;

    // Find best and worst picks
    let bestPick = null, worstPick = null;
    sim.companies.forEach(c => {
      if (c.shares > 0) {
        const gl = (c.price - c.avgCost) / c.avgCost * 100;
        if (!bestPick || gl > bestPick.gl) bestPick = { name: c.name, emoji: c.emoji, gl };
        if (!worstPick || gl < worstPick.gl) worstPick = { name: c.name, emoji: c.emoji, gl };
      }
    });

    let html = `
      <div class="sim-end-screen">
        <h2>🎬 Simulation Complete!</h2>
        <div class="final-value ${isProfit ? 'positive' : 'negative'}">
          $${finalVal.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
        </div>
        <div class="return-badge" style="background:${isProfit ? 'var(--quiz-correct)' : 'var(--quiz-wrong)'};color:${isProfit ? 'var(--gain)' : 'var(--loss)'};">
          ${isProfit ? '📈' : '📉'} ${returnPct >= 0 ? '+' : ''}${returnPct}% Total Return
        </div>

        <div style="text-align:left;max-width:500px;margin:0 auto 20px;">
          <p>💵 <strong>Started with:</strong> $${CONFIG.startingCash.toLocaleString()}</p>
          <p>💰 <strong>Ended with:</strong> $${finalVal.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
          <p>${isProfit ? '🎉' : '💪'} <strong>${isProfit ? 'You made a profit!' : 'You lost some money — but that\'s how you learn!'}</strong></p>
    `;

    if (bestPick) {
      html += `<p>🏆 <strong>Best pick:</strong> ${bestPick.emoji} ${bestPick.name} (${bestPick.gl >= 0 ? '+' : ''}${bestPick.gl.toFixed(1)}%)</p>`;
    }
    if (worstPick && worstPick.name !== bestPick?.name) {
      html += `<p>📉 <strong>Worst pick:</strong> ${worstPick.emoji} ${worstPick.name} (${worstPick.gl >= 0 ? '+' : ''}${worstPick.gl.toFixed(1)}%)</p>`;
    }

    html += '</div>';

    // Chart
    html += '<div class="chart-container"><div id="simChart"></div></div>';

    // Reflection
    html += `
        <h3 style="margin-bottom:8px;">🤔 What Did You Learn?</h3>
        <p style="color:var(--text-muted);font-size:0.9rem;margin-bottom:8px;">Take a moment to think about your experience:</p>
        <textarea class="reflection-box" placeholder="What strategy worked? What would you do differently? What surprised you?"></textarea>

        <div style="margin-top:20px;display:flex;gap:12px;justify-content:center;flex-wrap:wrap;">
          <button class="btn-primary" onclick="Simulator.init(true)">🔄 Play Again</button>
          <button class="btn-secondary" onclick="App.completeModule(6)">🏆 Claim Badge & Finish</button>
        </div>
      </div>
    `;

    container.innerHTML = html;
    renderChart();
  }

  /* ──────────── Simulator Persistence ──────────── */
  function _simKey() {
    // Per-profile sim state key (falls back to generic if no profile system)
    if (typeof App !== 'undefined' && App.activeProfileId && App.STORAGE_PREFIX) {
      return App.STORAGE_PREFIX + 'sim_' + App.activeProfileId;
    }
    return 'stockGuide_sim';
  }

  function saveSimState() {
    if (!sim) return;
    try {
      // Serialize only what's needed (strip functions, circular refs)
      const serialized = {
        week: sim.week,
        maxWeeks: sim.maxWeeks,
        cash: sim.cash,
        companies: sim.companies.map(c => ({
          id: c.id,
          name: c.name,
          emoji: c.emoji,
          sector: c.sector,
          color: c.color,
          startPrice: c.startPrice,
          backstory: c.backstory,
          price: c.price,
          shares: c.shares,
          avgCost: c.avgCost,
          priceHistory: [...c.priceHistory],
        })),
        portfolioHistory: [...sim.portfolioHistory],
        newsLog: [...sim.newsLog],
        finished: sim.finished,
      };
      localStorage.setItem(_simKey(), JSON.stringify(serialized));
    } catch { /* ignore storage full */ }
  }

  function loadSimState() {
    try {
      const raw = localStorage.getItem(_simKey());
      if (!raw) return null;
      const data = JSON.parse(raw);
      // Validate shape
      if (!data || typeof data.week !== 'number' || !Array.isArray(data.companies)) return null;
      return data;
    } catch { return null; }
  }

  /* ──────────── Public API ──────────── */
  return {
    init,
    advanceWeek,
    buyShare,
    sellShare,
  };
})();
