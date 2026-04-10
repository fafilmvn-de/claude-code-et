/**
 * simulator.js — Paper Trading Simulator for Stock Market Learning Guide
 * 5 fictional companies, 8 weeks, news events, portfolio tracking, animated chart.
 *
 * Layout: 3-panel (left: portfolio table, right: chart, bottom: news)
 * Features: ticker tape, sparklines, market mood, volatility-aware drift,
 *           OHLC candlestick tracking, animated chart points.
 *
 * ⚠️ All companies and prices are FICTIONAL. Educational only.
 * <!-- FUTURE: Vietnamese i18n -->
 */

'use strict';

const Simulator = (() => {
  /* ──────────── State ──────────── */
  let sim = null;
  let chart = null;
  let selectedCompanyId = null;
  let currentChartType = 'line'; // 'line' | 'candlestick'

  function createFreshState() {
    return {
      week: 0,
      maxWeeks: CONFIG.simulationWeeks,
      cash: CONFIG.startingCash,
      companies: COMPANIES.map(c => ({
        ...c,
        price: +(c.startPrice + (Math.random() - 0.5) * 10).toFixed(2),
        shares: 0,
        avgCost: 0,
        priceHistory: [],
        ohlcHistory: [],  // [{ open, high, low, close }]
      })),
      portfolioHistory: [],
      newsLog: [],
      finished: false,
    };
  }

  /* ──────────── Init ──────────── */
  function init(forceNew) {
    if (!forceNew) {
      const saved = loadSimState();
      if (saved && !saved.finished) {
        sim = saved;
        // Migrate old saves without ohlcHistory
        sim.companies.forEach(c => { if (!c.ohlcHistory) c.ohlcHistory = []; });
        const container = document.getElementById('simulatorContainer');
        if (container) {
          container.removeAttribute('data-initialized');
        }
        renderUI();
        return;
      }
    }

    sim = createFreshState();
    sim.companies.forEach(c => {
      c.priceHistory.push(c.price);
    });
    sim.portfolioHistory.push(getPortfolioValue());
    chart = null;
    selectedCompanyId = null;
    const container = document.getElementById('simulatorContainer');
    if (container) container.removeAttribute('data-initialized');
    saveSimState();
    renderUI();
  }

  /* ──────────── Portfolio Calculation ──────────── */
  function getPortfolioValue() {
    return +(sim.cash + sim.companies.reduce((s, c) => s + c.shares * c.price, 0)).toFixed(2);
  }

  /* ──────────── Trade Actions ──────────── */
  function buyShare(companyId) {
    if (sim.finished) return;
    const c = sim.companies.find(co => co.id === companyId);
    if (!c || sim.cash < c.price) return;
    const totalCost = c.avgCost * c.shares + c.price;
    c.shares++;
    c.avgCost = +(totalCost / c.shares).toFixed(2);
    sim.cash = +(sim.cash - c.price).toFixed(2);
    saveSimState();
    renderDynamicData();
  }

  function sellShare(companyId) {
    if (sim.finished) return;
    const c = sim.companies.find(co => co.id === companyId);
    if (!c || c.shares <= 0) return;
    c.shares--;
    sim.cash = +(sim.cash + c.price).toFixed(2);
    if (c.shares === 0) c.avgCost = 0;
    saveSimState();
    renderDynamicData();
  }

  /* ──────────── Advance Week ──────────── */
  function advanceWeek() {
    if (sim.finished || sim.week >= sim.maxWeeks) return;

    // Disable advance button during animation
    const btn = document.getElementById('simAdvanceBtn');
    if (btn) btn.disabled = true;

    sim.week++;
    const weekNews = [];
    const numEvents = 1 + (Math.random() > 0.5 ? 1 : 0);
    const shuffled = [...sim.companies].sort(() => Math.random() - 0.5);

    // Apply news impacts
    for (let i = 0; i < numEvents && i < shuffled.length; i++) {
      const company = shuffled[i];
      const pool = NEWS_POOL[company.id];
      if (!pool || pool.length === 0) continue;
      const newsItem = pool[Math.floor(Math.random() * pool.length)];
      const impact = newsItem.impact[0] + Math.random() * (newsItem.impact[1] - newsItem.impact[0]);
      company.price = +(company.price * impact).toFixed(2);
      company.price = Math.max(1, company.price);
      weekNews.push({ week: sim.week, company: company.name, emoji: company.emoji, text: newsItem.text, sentiment: newsItem.sentiment });
    }

    // Apply volatility-aware drift + market-wide drift to non-news companies
    const marketDrift = 1 + (Math.random() - 0.49) * 0.02; // slight upward bias
    const volScale = { low: 0.04, medium: 0.07, high: 0.12 };

    sim.companies.forEach(c => {
      const open = c.price;
      if (!weekNews.find(n => n.company === c.name)) {
        const scale = volScale[c.volatility] ?? 0.06;
        const drift = (1 + (Math.random() - 0.48) * scale) * marketDrift;
        c.price = +(c.price * drift).toFixed(2);
        c.price = Math.max(1, c.price);
      }
      const close = c.price;
      const high = +(Math.max(open, close) * (1 + Math.random() * 0.02)).toFixed(2);
      const low  = +(Math.min(open, close) * (1 - Math.random() * 0.02)).toFixed(2);
      c.ohlcHistory.push({ open, high, low, close });
      c.priceHistory.push(c.price);
    });

    sim.newsLog.push(...weekNews);
    sim.portfolioHistory.push(getPortfolioValue());

    if (sim.week >= sim.maxWeeks) sim.finished = true;

    saveSimState();

    if (sim.finished) {
      renderUI();
    } else {
      renderDynamicData(true /* animateChart */);
    }
  }

  /* ──────────── Company Selection ──────────── */
  function selectCompany(companyId) {
    selectedCompanyId = companyId;

    // Highlight selected row
    document.querySelectorAll('.portfolio-table tr[data-company]').forEach(r => {
      r.classList.toggle('selected-row', r.dataset.company === companyId);
    });

    // Switch chart to this company
    const c = sim.companies.find(co => co.id === companyId);
    if (!c || !chart) return;

    const labelEl = document.getElementById('simChartLabel');
    if (labelEl) labelEl.textContent = `${c.emoji} ${c.name} — ${c.sector}`;

    const weeks = c.priceHistory.map((_, i) => i);
    if (currentChartType === 'candlestick' && c.ohlcHistory.length > 0) {
      const opens  = c.ohlcHistory.map(o => o.open);
      const highs  = c.ohlcHistory.map(o => o.high);
      const lows   = c.ohlcHistory.map(o => o.low);
      const closes = c.ohlcHistory.map(o => o.close);
      // Pad week 0 with the first price for OHLC
      const xWeeks = c.ohlcHistory.map((_, i) => i + 1);
      chart.opts.chartType = 'candlestick';
      chart.animateSwitchTo([xWeeks, opens, highs, lows, closes], [{ label: c.name, color: c.color }]);
    } else {
      chart.opts.chartType = 'line';
      chart.animateSwitchTo([weeks, c.priceHistory], [{ label: c.name, color: c.color }]);
    }
  }

  function showPortfolioChart() {
    selectedCompanyId = null;
    document.querySelectorAll('.portfolio-table tr[data-company]').forEach(r => r.classList.remove('selected-row'));
    const labelEl = document.getElementById('simChartLabel');
    if (labelEl) labelEl.textContent = '📊 Portfolio Value Over Time';
    _renderPortfolioChartData();
  }

  function toggleChartType() {
    currentChartType = currentChartType === 'line' ? 'candlestick' : 'line';
    const btn = document.getElementById('chartTypeToggle');
    if (btn) btn.textContent = currentChartType === 'line' ? '📊 Candlestick View' : '📈 Line View';
    if (selectedCompanyId) {
      selectCompany(selectedCompanyId);
    } else {
      showPortfolioChart();
    }
  }

  /* ──────────── Render: Static Shell (first render only) ──────────── */
  function renderStaticShell(container) {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

    container.innerHTML = `
      <!-- Stats bar -->
      <div class="sim-header" id="simStats"></div>

      <!-- Ticker tape -->
      <div class="sim-ticker-wrap">
        <div class="sim-ticker-inner" id="simTicker"></div>
      </div>

      <!-- Three-panel body -->
      <div class="sim-body">
        <!-- Left: portfolio table -->
        <div class="sim-left-panel">
          <table class="portfolio-table" id="simPortfolioTable">
            <thead>
              <tr>
                <th>Company</th>
                <th>Sector</th>
                <th>Price</th>
                <th>Wk%</th>
                <th>Shares</th>
                <th>Avg Cost</th>
                <th>P/L</th>
                <th class="spark-cell">Trend</th>
                <th>Trade</th>
              </tr>
            </thead>
            <tbody id="simPortfolioBody"></tbody>
          </table>
        </div>

        <!-- Right: chart panel -->
        <div class="sim-right-panel">
          <div class="sim-chart-label" id="simChartLabel">📊 Portfolio Value Over Time</div>
          <button class="chart-type-toggle" id="chartTypeToggle" onclick="Simulator.toggleChartType()">📊 Candlestick View</button>
          <div id="simChartWrap"></div>
        </div>
      </div>

      <!-- Market mood -->
      <div id="simMarketMood"></div>

      <!-- News panel -->
      <div class="news-ticker" id="simNews" style="display:none;">
        <h4 style="margin-bottom:8px;font-size:0.85rem;color:var(--text-muted);">📰 Market News</h4>
        <div id="simNewsList"></div>
      </div>

      <!-- Advance button -->
      <div style="text-align:center;margin-top:16px;">
        <button class="sim-advance-btn" id="simAdvanceBtn" onclick="Simulator.advanceWeek()">
          ▶️ Start Week 1
        </button>
        <p style="font-size:0.8rem;color:var(--text-muted);margin-top:8px;">
          Click a company row to see its chart · Buy and sell anytime
        </p>
      </div>
    `;

    container.dataset.initialized = '1';

    // Init chart after shell is in DOM
    _createChart();
  }

  /* ──────────── Render: Dynamic Data update ──────────── */
  function renderDynamicData(animateChart = false) {
    const container = document.getElementById('simulatorContainer');
    if (!container) return;

    if (!container.dataset.initialized) {
      renderStaticShell(container);
    }

    _updateStats();
    _updateTicker();
    _updatePortfolioBody();
    _updateMarketMood();
    _updateNews();
    _updateAdvanceButton();

    // Render sparklines after DOM update
    requestAnimationFrame(() => {
      document.querySelectorAll('.spark-canvas').forEach(canvas => {
        const cId = canvas.dataset.company;
        const c = sim.companies.find(co => co.id === cId);
        if (c && c.priceHistory.length > 1) {
          _renderSparkline(canvas, c.priceHistory, c.color);
        }
      });
    });

    // Update chart
    if (chart) {
      const newChartData = _buildChartData();
      if (animateChart) {
        chart.animateTo(newChartData.data, newChartData.series, () => {
          const btn = document.getElementById('simAdvanceBtn');
          if (btn) btn.disabled = false;
        });
      } else {
        chart.update(newChartData.data, newChartData.series);
      }
    }
  }

  /* ──────────── Render: Individual Sections ──────────── */

  function _updateStats() {
    const el = document.getElementById('simStats');
    if (!el) return;
    const portfolioVal = getPortfolioValue();
    const returnPct = ((portfolioVal - CONFIG.startingCash) / CONFIG.startingCash * 100).toFixed(1);
    const returnClass = portfolioVal >= CONFIG.startingCash ? 'positive' : 'negative';
    el.innerHTML = `
      <div class="sim-stats">
        <div class="sim-stat">
          <div class="stat-val">Week ${sim.week}/${sim.maxWeeks}</div>
          <div class="stat-lbl">⏰ Time</div>
        </div>
        <div class="sim-stat">
          <div class="stat-val">$${sim.cash.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}</div>
          <div class="stat-lbl">💵 Cash</div>
        </div>
        <div class="sim-stat">
          <div class="stat-val ${returnClass}">$${portfolioVal.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}</div>
          <div class="stat-lbl">📊 Portfolio</div>
        </div>
        <div class="sim-stat">
          <div class="stat-val ${returnClass}">${returnPct >= 0 ? '+' : ''}${returnPct}%</div>
          <div class="stat-lbl">📈 Return</div>
        </div>
      </div>
    `;
  }

  function _updateTicker() {
    const el = document.getElementById('simTicker');
    if (!el) return;
    if (sim.week === 0) {
      el.textContent = sim.companies.map(c => `${c.emoji} ${c.name} $${c.price.toFixed(2)}`).join('  ·  ');
      return;
    }
    const items = sim.companies.map(c => {
      const prev = c.priceHistory.length >= 2 ? c.priceHistory[c.priceHistory.length - 2] : c.price;
      const chg = ((c.price - prev) / prev * 100).toFixed(2);
      const dir = chg >= 0 ? '▲' : '▼';
      const cls = chg >= 0 ? 'tick-up' : 'tick-dn';
      return `<span class="tick-item ${cls}">${c.emoji} ${c.name} $${c.price.toFixed(2)} ${dir}${Math.abs(chg)}%</span>`;
    }).join('<span class="tick-sep">·</span>');
    el.innerHTML = items;
    // Restart animation by toggling class
    el.classList.add('restart');
    requestAnimationFrame(() => el.classList.remove('restart'));
  }

  function _updatePortfolioBody() {
    const tbody = document.getElementById('simPortfolioBody');
    if (!tbody) return;
    let rows = '';
    sim.companies.forEach(c => {
      const value = +(c.shares * c.price).toFixed(2);
      const gl = c.shares > 0 ? +((c.price - c.avgCost) * c.shares).toFixed(2) : 0;
      const glPct = c.shares > 0 && c.avgCost > 0 ? ((c.price - c.avgCost) / c.avgCost * 100).toFixed(1) : '0.0';
      const glClass = gl >= 0 ? 'positive' : 'negative';
      const canBuy = sim.cash >= c.price;
      const canSell = c.shares > 0;
      const isSelected = c.id === selectedCompanyId;

      // Week-over-week price change
      let wkChg = '—';
      let wkClass = '';
      if (c.priceHistory.length >= 2) {
        const prev = c.priceHistory[c.priceHistory.length - 2];
        const pct = ((c.price - prev) / prev * 100).toFixed(1);
        const dir = pct >= 0 ? '▲' : '▼';
        wkClass = pct >= 0 ? 'tick-up' : 'tick-dn';
        wkChg = `${dir}${Math.abs(pct)}%`;
      }

      rows += `
        <tr data-company="${c.id}" class="${isSelected ? 'selected-row' : ''}" onclick="Simulator.selectCompany('${c.id}')">
          <td><strong>${c.emoji} ${c.name}</strong></td>
          <td><span class="sector-badge">${c.sector.split(' ')[0]}</span></td>
          <td>$${c.price.toFixed(2)}</td>
          <td class="wk-change ${wkClass}">${wkChg}</td>
          <td>${c.shares}</td>
          <td>${c.shares > 0 ? '$' + c.avgCost.toFixed(2) : '—'}</td>
          <td class="${glClass}">${c.shares > 0 ? (gl >= 0 ? '+' : '') + '$' + gl.toFixed(2) + ' (' + (gl >= 0 ? '+' : '') + glPct + '%)' : '—'}</td>
          <td class="spark-cell"><canvas class="spark-canvas" data-company="${c.id}" width="60" height="24"></canvas></td>
          <td>
            <div class="trade-btn-group" onclick="event.stopPropagation()">
              <button class="trade-btn buy" onclick="Simulator.buyShare('${c.id}')" ${canBuy ? '' : 'disabled'} title="Buy 1 share">+</button>
              <button class="trade-btn sell" onclick="Simulator.sellShare('${c.id}')" ${canSell ? '' : 'disabled'} title="Sell 1 share">−</button>
            </div>
          </td>
        </tr>
      `;
    });
    tbody.innerHTML = rows;
  }

  function _updateMarketMood() {
    const el = document.getElementById('simMarketMood');
    if (!el || sim.week === 0) { if (el) el.innerHTML = ''; return; }

    const gainers = sim.companies.filter(c => {
      if (c.priceHistory.length < 2) return false;
      return c.price > c.priceHistory[c.priceHistory.length - 2];
    }).length;

    const mood = gainers >= 4 ? 'bull' : gainers <= 1 ? 'bear' : 'mixed';
    const moodEmoji = { bull: '🐂', bear: '🐻', mixed: '🦊' }[mood];
    const moodLabel = {
      bull: 'Bull Market — Most stocks rising!',
      bear: 'Bear Market — Most stocks falling.',
      mixed: 'Mixed Market — Half up, half down.',
    }[mood];

    el.innerHTML = `
      <div class="market-summary ${mood}">
        <span class="market-emoji">${moodEmoji}</span>
        <div class="market-info">
          <strong>Market Mood — Week ${sim.week}</strong>
          <span>${moodLabel}</span>
        </div>
        <div class="market-stats">${gainers}/5 rising</div>
      </div>
    `;
  }

  function _updateNews() {
    if (sim.newsLog.length === 0) return;
    const panel = document.getElementById('simNews');
    const list  = document.getElementById('simNewsList');
    if (!panel || !list) return;
    panel.style.display = 'block';
    const recent = [...sim.newsLog].reverse().slice(0, 6);
    list.innerHTML = recent.map(n => {
      const sentColor = n.sentiment === 'positive' ? 'var(--gain)' : n.sentiment === 'negative' ? 'var(--loss)' : 'var(--text-muted)';
      return `<div class="news-item"><span class="news-week">W${n.week}</span><span style="color:${sentColor};">${n.text}</span></div>`;
    }).join('');
  }

  function _updateAdvanceButton() {
    const btn = document.getElementById('simAdvanceBtn');
    if (!btn) return;
    btn.disabled = sim.finished;
    btn.textContent = sim.week === 0
      ? '▶️ Start Week 1'
      : sim.week < sim.maxWeeks
        ? `⏭️ Advance to Week ${sim.week + 1}`
        : '✅ Simulation Complete';
  }

  /* ──────────── Chart Management ──────────── */

  function _createChart() {
    const chartEl = document.getElementById('simChartWrap');
    if (!chartEl) return;
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const { data, series } = _buildChartData();

    if (chart) { chart.destroy(); chart = null; }

    chart = new MiniChart(chartEl, {
      width: Math.max(200, Math.min(chartEl.offsetWidth || 300, 308)),
      height: 240,
      series,
      data,
      title: '',
      animateNewPoint: true,
      textColor: isDark ? 'rgba(200,200,200,0.8)' : 'rgba(100,100,100,0.9)',
      gridColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
    });

    chart.startLiveTick(CONFIG.liveTickInterval || 3000);
  }

  function _buildChartData() {
    if (selectedCompanyId) {
      const c = sim.companies.find(co => co.id === selectedCompanyId);
      if (c) {
        const weeks = c.priceHistory.map((_, i) => i);
        return { data: [weeks, c.priceHistory], series: [{ label: c.name, color: c.color }] };
      }
    }
    return _buildPortfolioChartData();
  }

  function _buildPortfolioChartData() {
    const weeks = sim.portfolioHistory.map((_, i) => i);
    return { data: [weeks, sim.portfolioHistory], series: [{ label: 'Portfolio Value', color: '#14b8a6' }] };
  }

  function _renderPortfolioChartData() {
    if (!chart) return;
    const { data, series } = _buildPortfolioChartData();
    const labelEl = document.getElementById('simChartLabel');
    if (labelEl) labelEl.textContent = '📊 Portfolio Value Over Time';
    chart.animateSwitchTo(data, series);
  }

  /* ──────────── Sparkline ──────────── */

  function _renderSparkline(canvas, prices, color) {
    if (!canvas || prices.length < 2) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const range = max - min || 1;
    ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.beginPath();
    prices.forEach((p, i) => {
      const x = (i / (prices.length - 1)) * w;
      const y = h - ((p - min) / range) * (h - 4) - 2;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.stroke();
  }

  /* ──────────── Main renderUI ──────────── */
  function renderUI() {
    const container = document.getElementById('simulatorContainer');
    if (!container) return;

    if (sim.finished) {
      renderEndScreen(container);
      return;
    }

    if (!container.dataset.initialized) {
      renderStaticShell(container);
    }

    renderDynamicData(false);
  }

  /* ──────────── End Screen ──────────── */
  function renderEndScreen(container) {
    if (chart) { chart.stopLiveTick(); }

    const finalVal = getPortfolioValue();
    const returnPct = ((finalVal - CONFIG.startingCash) / CONFIG.startingCash * 100).toFixed(1);
    const isProfit = finalVal >= CONFIG.startingCash;

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
          $${finalVal.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}
        </div>
        <div class="return-badge" style="background:${isProfit ? 'var(--quiz-correct)' : 'var(--quiz-wrong)'};color:${isProfit ? 'var(--gain)' : 'var(--loss)'};">
          ${isProfit ? '📈' : '📉'} ${returnPct >= 0 ? '+' : ''}${returnPct}% Total Return
        </div>
        <div style="text-align:left;max-width:500px;margin:0 auto 20px;">
          <p>💵 <strong>Started with:</strong> $${CONFIG.startingCash.toLocaleString()}</p>
          <p>💰 <strong>Ended with:</strong> $${finalVal.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}</p>
          <p>${isProfit ? '🎉' : '💪'} <strong>${isProfit ? 'You made a profit!' : 'You lost some money — but that\'s how you learn!'}</strong></p>
    `;

    if (bestPick) html += `<p>🏆 <strong>Best pick:</strong> ${bestPick.emoji} ${bestPick.name} (${bestPick.gl >= 0 ? '+' : ''}${bestPick.gl.toFixed(1)}%)</p>`;
    if (worstPick && worstPick.name !== bestPick?.name) html += `<p>📉 <strong>Worst pick:</strong> ${worstPick.emoji} ${worstPick.name} (${worstPick.gl >= 0 ? '+' : ''}${worstPick.gl.toFixed(1)}%)</p>`;
    html += '</div>';

    html += '<div class="chart-container"><div id="simChart"></div></div>';

    html += `
        <h3 style="margin-bottom:8px;">🤔 What Did You Learn?</h3>
        <p style="color:var(--text-muted);font-size:0.9rem;margin-bottom:8px;">Take a moment to think about your experience:</p>
        <textarea class="reflection-box" placeholder="What strategy worked? What would you do differently? What surprised you?"></textarea>
        <div style="margin-top:20px;display:flex;gap:12px;justify-content:center;flex-wrap:wrap;">
          <button class="btn-primary" onclick="Simulator.init(true)">🔄 Play Again</button>
          <button class="btn-secondary" onclick="App.completeModule(6)">🏆 Claim Badge &amp; Finish</button>
        </div>
      </div>
    `;

    container.removeAttribute('data-initialized');
    container.innerHTML = html;

    // Replay portfolio arc on end screen
    const chartEl = document.getElementById('simChart');
    if (chartEl) {
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      const weeks = sim.portfolioHistory.map((_, i) => i);
      const endChart = new MiniChart(chartEl, {
        width: Math.min(chartEl.parentElement.offsetWidth - 32, 700),
        height: 260,
        series: [{ label: 'Portfolio Value', color: '#14b8a6' }],
        data: [weeks.slice(0, 1), [sim.portfolioHistory[0]]],
        title: '📊 Your Portfolio Journey',
        textColor: isDark ? 'rgba(200,200,200,0.8)' : 'rgba(100,100,100,0.9)',
        gridColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
      });
      // Animate full arc in
      setTimeout(() => {
        endChart.animateTo([weeks, sim.portfolioHistory], [{ label: 'Portfolio Value', color: '#14b8a6' }]);
      }, 300);
    }
  }

  /* ──────────── Chart Pause / Resume (for module navigation) ──────────── */
  function pauseChart() {
    if (chart) {
      chart.stopLiveTick();
      chart._cancelAnimation && chart._cancelAnimation();
    }
  }

  function resumeChart() {
    if (chart && sim && !sim.finished) {
      chart.startLiveTick(CONFIG.liveTickInterval || 3000);
    }
  }

  /* ──────────── Persistence ──────────── */
  function _simKey() {
    if (typeof App !== 'undefined' && App.activeProfileId && App.STORAGE_PREFIX) {
      return App.STORAGE_PREFIX + 'sim_' + App.activeProfileId;
    }
    return 'stockGuide_sim';
  }

  function saveSimState() {
    if (!sim) return;
    try {
      const serialized = {
        week: sim.week,
        maxWeeks: sim.maxWeeks,
        cash: sim.cash,
        companies: sim.companies.map(c => ({
          id: c.id, name: c.name, emoji: c.emoji, sector: c.sector,
          color: c.color, startPrice: c.startPrice, backstory: c.backstory,
          volatility: c.volatility,
          price: c.price, shares: c.shares, avgCost: c.avgCost,
          priceHistory: [...c.priceHistory],
          ohlcHistory: [...c.ohlcHistory],
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
    selectCompany,
    showPortfolioChart,
    toggleChartType,
    pauseChart,
    resumeChart,
  };
})();
