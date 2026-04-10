/**
 * minichart.js — Lightweight canvas chart for Stock Market Learning Guide
 * Purpose-built replacement for uPlot. Draws line charts with:
 *   - Multiple series (portfolio value, individual stocks)
 *   - Axis labels, grid lines, tooltips on hover
 *   - Responsive sizing
 *   - Animated new data points via requestAnimationFrame
 *   - Live tick cosmetic oscillation between week advances
 *   - Cross-fade animation when switching company views
 *   - Optional OHLC candlestick chart type
 *
 * Usage:
 *   const chart = new MiniChart(containerEl, { ...opts, animateNewPoint: true });
 *   chart.animateTo(newData, newSeries, onComplete);  // animate new week point
 *   chart.animateSwitchTo(newData, newSeries);         // cross-fade company switch
 *   chart.startLiveTick();                             // cosmetic micro-oscillation
 *   chart.update(newData);                             // instant update (static use)
 *   chart.destroy();
 */

'use strict';

class MiniChart {
  constructor(container, opts = {}) {
    this.container = typeof container === 'string' ? document.querySelector(container) : container;
    this.opts = Object.assign({
      width: 560,
      height: 280,
      padding: { top: 30, right: 20, bottom: 40, left: 60 },
      gridLines: 5,
      lineWidth: 2.5,
      pointRadius: 4,
      fontFamily: 'system-ui, -apple-system, sans-serif',
      fontSize: 11,
      showLegend: true,
      animate: true,
      animateNewPoint: false,
      backgroundColor: 'transparent',
      gridColor: 'rgba(128,128,128,0.15)',
      axisColor: 'rgba(128,128,128,0.6)',
      textColor: 'rgba(128,128,128,0.9)',
      title: '',
      chartType: 'line', // 'line' | 'candlestick'
    }, opts);

    this.series = opts.series || []; // [{ label, color }]
    this.data = opts.data || [];     // [[x values], [y1 values], [y2 values], ...]
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.tooltip = null;
    this.hoveredIdx = -1;

    // Animation state
    this._animRaf = null;
    this._animStartTime = null;
    this._animDuration = 600;
    this._animFromData = null;
    this._animToData = null;
    this._animOnComplete = null;

    // Live tick state
    this._liveTick = null;
    this._liveOffsets = null;

    this._initCanvas();
    this._initTooltip();
    this._bindEvents();
    this.render();
  }

  /* ─────────────────────── Canvas Setup ─────────────────────── */

  _initCanvas() {
    const dpr = window.devicePixelRatio || 1;
    const { width, height } = this.opts;
    this.canvas.width = width * dpr;
    this.canvas.height = height * dpr;
    this.canvas.style.width = width + 'px';
    this.canvas.style.height = height + 'px';
    this.ctx.scale(dpr, dpr);
    this.container.innerHTML = '';
    this.container.appendChild(this.canvas);
    this.canvas.style.display = 'block';
  }

  _initTooltip() {
    this.tooltip = document.createElement('div');
    this.tooltip.className = 'minichart-tooltip';
    this.tooltip.style.cssText = `
      position: absolute; display: none; pointer-events: none;
      background: rgba(30,30,30,0.92); color: #fff; padding: 8px 12px;
      border-radius: 8px; font-size: 12px; font-family: ${this.opts.fontFamily};
      box-shadow: 0 4px 12px rgba(0,0,0,0.25); z-index: 100; white-space: nowrap;
    `;
    this.container.style.position = 'relative';
    this.container.appendChild(this.tooltip);
  }

  _bindEvents() {
    this._onMouseMove = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this._handleHover(e.clientX - rect.left, e.clientY - rect.top);
    };
    this._onMouseLeave = () => {
      this.hoveredIdx = -1;
      this.tooltip.style.display = 'none';
      this.render();
    };
    this.canvas.addEventListener('mousemove', this._onMouseMove);
    this.canvas.addEventListener('touchmove', (e) => {
      const t = e.touches[0];
      const rect = this.canvas.getBoundingClientRect();
      this._handleHover(t.clientX - rect.left, t.clientY - rect.top);
    }, { passive: true });
    this.canvas.addEventListener('mouseleave', this._onMouseLeave);
    this.canvas.addEventListener('touchend', this._onMouseLeave);
  }

  _handleHover(mx, _my) {
    if (!this.data.length || !this.data[0].length) return;
    if (this.opts.chartType === 'candlestick') {
      this._handleCandlestickHover(mx);
      return;
    }
    const { padding, width } = this.opts;
    const plotW = width - padding.left - padding.right;
    const xs = this.data[0];
    const step = plotW / Math.max(xs.length - 1, 1);
    let closest = 0, minDist = Infinity;
    for (let i = 0; i < xs.length; i++) {
      const dist = Math.abs(mx - (padding.left + i * step));
      if (dist < minDist) { minDist = dist; closest = i; }
    }
    this.hoveredIdx = closest;
    this.render();

    let html = `<strong>Week ${this.data[0][closest]}</strong><br>`;
    for (let s = 0; s < this.series.length; s++) {
      const val = this.data[s + 1]?.[closest];
      if (val != null) {
        const color = this.series[s].color || '#888';
        html += `<span style="color:${color}">●</span> ${this.series[s].label}: <strong>$${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong><br>`;
      }
    }
    this.tooltip.innerHTML = html;
    this.tooltip.style.display = 'block';
    const px = padding.left + closest * step;
    this.tooltip.style.left = Math.min(px + 12, this.opts.width - 160) + 'px';
    this.tooltip.style.top = '8px';
  }

  _handleCandlestickHover(mx) {
    if (!this.data[0] || !this.data[0].length) return;
    const { padding, width } = this.opts;
    const plotW = width - padding.left - padding.right;
    const xs = this.data[0];
    const step = plotW / Math.max(xs.length - 1, 1);
    let closest = 0, minDist = Infinity;
    for (let i = 0; i < xs.length; i++) {
      const dist = Math.abs(mx - (padding.left + i * step));
      if (dist < minDist) { minDist = dist; closest = i; }
    }
    this.hoveredIdx = closest;
    this.render();

    const open = this.data[1]?.[closest];
    const high = this.data[2]?.[closest];
    const low  = this.data[3]?.[closest];
    const close = this.data[4]?.[closest];
    if (open == null) return;
    const change = ((close - open) / open * 100).toFixed(2);
    const sign = change >= 0 ? '+' : '';
    const color = close >= open ? '#10b981' : '#f43f5e';
    this.tooltip.innerHTML = `
      <strong>Week ${xs[closest]}</strong><br>
      <span style="color:${color}">■</span> O: $${open.toFixed(2)} H: $${high.toFixed(2)}<br>
      L: $${low.toFixed(2)} C: $${close.toFixed(2)}<br>
      <strong style="color:${color}">${sign}${change}%</strong>
    `;
    this.tooltip.style.display = 'block';
    const px = padding.left + closest * step;
    this.tooltip.style.left = Math.min(px + 12, this.opts.width - 160) + 'px';
    this.tooltip.style.top = '8px';
  }

  /* ─────────────────────── Public API ─────────────────────── */

  update(data, series) {
    this._cancelAnimation();
    if (data) this.data = data;
    if (series) this.series = series;
    this.hoveredIdx = -1;
    this._liveOffsets = null;
    if (this.tooltip) this.tooltip.style.display = 'none';
    this.render();
  }

  /**
   * Animate the newest data point being drawn over ~600ms.
   * Earlier points stay static; only the last segment animates in.
   */
  animateTo(newData, newSeries, onComplete) {
    this._cancelAnimation();
    this._liveOffsets = null;

    // Snapshot: from = current data; to = newData
    this._animFromData = this._deepCopyData(this.data);
    this._animToData = this._deepCopyData(newData);
    if (newSeries) this.series = newSeries;
    this._animOnComplete = onComplete || null;
    this._animStartTime = null;

    this._animRaf = requestAnimationFrame(this._animFrame.bind(this));
  }

  _animFrame(timestamp) {
    if (!this._animStartTime) this._animStartTime = timestamp;
    const elapsed = timestamp - this._animStartTime;
    const t = Math.min(1, elapsed / this._animDuration);
    const eased = this._easeInOutCubic(t);

    this.data = this._interpolateLastPoint(this._animFromData, this._animToData, eased);
    this.render();

    if (t < 1) {
      this._animRaf = requestAnimationFrame(this._animFrame.bind(this));
    } else {
      this.data = this._animToData;
      this.render();
      this._animRaf = null;
      if (this._animOnComplete) {
        this._animOnComplete();
        this._animOnComplete = null;
      }
    }
  }

  _interpolateLastPoint(fromData, toData, t) {
    if (!toData || !toData[0]) return toData;
    const result = [toData[0]]; // x-axis is always from toData
    for (let s = 1; s < toData.length; s++) {
      const toArr = toData[s];
      if (!toArr) { result.push(toArr); continue; }
      const fromArr = fromData && fromData[s];
      const arr = [...toArr];
      // Interpolate only the last point
      const lastIdx = arr.length - 1;
      const toVal = toArr[lastIdx];
      const fromVal = fromArr && fromArr.length > 0
        ? (fromArr[lastIdx] != null ? fromArr[lastIdx] : fromArr[fromArr.length - 1])
        : toVal;
      if (fromVal != null && toVal != null) {
        arr[lastIdx] = fromVal + (toVal - fromVal) * t;
      }
      result.push(arr);
    }
    return result;
  }

  _easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  _cancelAnimation() {
    if (this._animRaf) {
      cancelAnimationFrame(this._animRaf);
      this._animRaf = null;
    }
  }

  /**
   * Cross-fade to new data: fade out (200ms) → swap → fade in (200ms).
   */
  animateSwitchTo(newData, newSeries, duration = 400) {
    this._cancelAnimation();
    const halfDur = duration / 2;
    let startTime = null;
    let phase = 'fadeOut';
    const nextData = this._deepCopyData(newData);
    const nextSeries = newSeries;

    const frame = (ts) => {
      if (!startTime) startTime = ts;
      const elapsed = ts - startTime;

      if (phase === 'fadeOut') {
        this.opts._globalAlpha = Math.max(0, 1 - elapsed / halfDur);
        this.render();
        if (elapsed >= halfDur) {
          phase = 'fadeIn';
          startTime = ts;
          this.data = nextData;
          if (nextSeries) this.series = nextSeries;
          this.opts._globalAlpha = 0;
          this.render();
        }
        this._animRaf = requestAnimationFrame(frame);
      } else {
        this.opts._globalAlpha = Math.min(1, elapsed / halfDur);
        this.render();
        if (elapsed >= halfDur) {
          this.opts._globalAlpha = 1;
          this.render();
          this._animRaf = null;
          return;
        }
        this._animRaf = requestAnimationFrame(frame);
      }
    };
    this._animRaf = requestAnimationFrame(frame);
  }

  /**
   * Cosmetic micro-oscillation of the last data point.
   * Does NOT change this.data permanently.
   */
  startLiveTick(intervalMs = 3000, amplitudePct = 0.003) {
    this.stopLiveTick();
    this._liveTick = setInterval(() => {
      if (!this.data || !this.data[0] || !this.data[0].length) return;
      this._liveOffsets = this.series.map((_, s) => {
        const arr = this.data[s + 1];
        if (!arr) return 0;
        const lastVal = arr[arr.length - 1] ?? 0;
        return (Math.random() - 0.5) * 2 * amplitudePct * lastVal;
      });
      this.render();
    }, intervalMs);
  }

  stopLiveTick() {
    if (this._liveTick) {
      clearInterval(this._liveTick);
      this._liveTick = null;
    }
    this._liveOffsets = null;
  }

  /* ─────────────────────── Rendering ─────────────────────── */

  render() {
    if (this.opts.chartType === 'candlestick') {
      this._renderCandlestick();
      return;
    }

    const ctx = this.ctx;
    const { width, height, padding, gridLines, lineWidth, pointRadius, fontFamily, fontSize,
            backgroundColor, gridColor, textColor, title } = this.opts;

    const alpha = this.opts._globalAlpha ?? 1;
    ctx.globalAlpha = alpha;

    ctx.clearRect(0, 0, width, height);
    if (backgroundColor && backgroundColor !== 'transparent') {
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, width, height);
    }

    const plotX = padding.left;
    const plotY = padding.top;
    const plotW = width - padding.left - padding.right;
    const plotH = height - padding.top - padding.bottom;

    if (!this.data.length || !this.data[0].length) {
      ctx.fillStyle = textColor;
      ctx.font = `14px ${fontFamily}`;
      ctx.textAlign = 'center';
      ctx.globalAlpha = 1;
      ctx.fillText('No data yet — start trading!', width / 2, height / 2);
      return;
    }

    const xs = this.data[0];
    const allYs = [];
    for (let s = 1; s < this.data.length; s++) {
      for (const v of (this.data[s] || [])) { if (v != null) allYs.push(v); }
    }
    // Include live offsets in range
    if (this._liveOffsets) {
      this._liveOffsets.forEach((off, s) => {
        const arr = this.data[s + 1];
        if (arr && arr.length) allYs.push((arr[arr.length - 1] ?? 0) + off);
      });
    }
    if (!allYs.length) { ctx.globalAlpha = 1; return; }

    let yMin = Math.min(...allYs);
    let yMax = Math.max(...allYs);
    const yPad = (yMax - yMin) * 0.1 || 100;
    yMin -= yPad;
    yMax += yPad;

    const xStep = plotW / Math.max(xs.length - 1, 1);
    const toX = (i) => plotX + i * xStep;
    const toY = (v) => plotY + plotH - ((v - yMin) / (yMax - yMin)) * plotH;

    // Title
    if (title) {
      ctx.fillStyle = textColor;
      ctx.font = `bold 14px ${fontFamily}`;
      ctx.textAlign = 'center';
      ctx.fillText(title, width / 2, 18);
    }

    // Grid & Y-axis labels
    ctx.font = `${fontSize}px ${fontFamily}`;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    for (let i = 0; i <= gridLines; i++) {
      const y = plotY + (plotH / gridLines) * i;
      const val = yMax - ((yMax - yMin) / gridLines) * i;
      ctx.strokeStyle = gridColor;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(plotX, y);
      ctx.lineTo(plotX + plotW, y);
      ctx.stroke();
      ctx.fillStyle = textColor;
      ctx.fillText('$' + val.toFixed(0), plotX - 8, y);
    }

    // X-axis labels
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    for (let i = 0; i < xs.length; i++) {
      ctx.fillStyle = textColor;
      ctx.fillText('W' + xs[i], toX(i), plotY + plotH + 8);
    }

    // Hover line
    if (this.hoveredIdx >= 0 && this.hoveredIdx < xs.length) {
      const hx = toX(this.hoveredIdx);
      ctx.strokeStyle = 'rgba(128,128,128,0.3)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(hx, plotY);
      ctx.lineTo(hx, plotY + plotH);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Draw each series
    for (let s = 0; s < this.series.length; s++) {
      const ys = this.data[s + 1];
      if (!ys) continue;
      const color = this.series[s].color || '#3b82f6';
      const liveOff = (this._liveOffsets && this._liveOffsets[s]) || 0;

      // Build effective y values (add live offset to last point)
      const effectiveYs = ys.map((v, i) =>
        (i === ys.length - 1 && liveOff && v != null) ? v + liveOff : v
      );

      // Line
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      ctx.beginPath();
      let started = false;
      for (let i = 0; i < effectiveYs.length; i++) {
        if (effectiveYs[i] == null) continue;
        const x = toX(i);
        const y = toY(effectiveYs[i]);
        if (!started) { ctx.moveTo(x, y); started = true; }
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Area fill (single series only)
      if (this.series.length === 1) {
        ctx.fillStyle = this._toRgba(color, 0.08);
        ctx.beginPath();
        let first = true;
        for (let i = 0; i < effectiveYs.length; i++) {
          if (effectiveYs[i] == null) continue;
          const x = toX(i);
          const y = toY(effectiveYs[i]);
          if (first) { ctx.moveTo(x, y); first = false; }
          else ctx.lineTo(x, y);
        }
        ctx.lineTo(toX(effectiveYs.length - 1), plotY + plotH);
        ctx.lineTo(toX(0), plotY + plotH);
        ctx.closePath();
        ctx.fill();
      }

      // Points
      for (let i = 0; i < effectiveYs.length; i++) {
        if (effectiveYs[i] == null) continue;
        const x = toX(i);
        const y = toY(effectiveYs[i]);
        const isHovered = i === this.hoveredIdx;
        ctx.fillStyle = isHovered ? '#fff' : color;
        ctx.strokeStyle = color;
        ctx.lineWidth = isHovered ? 3 : 2;
        ctx.beginPath();
        ctx.arc(x, y, isHovered ? pointRadius + 2 : pointRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
    }

    // Legend
    if (this.opts.showLegend && this.series.length > 1) {
      const lx = plotX + 8;
      let ly = plotY + 4;
      ctx.font = `${fontSize}px ${fontFamily}`;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      for (const s of this.series) {
        ctx.fillStyle = s.color;
        ctx.fillRect(lx, ly + 2, 12, 12);
        ctx.fillStyle = textColor;
        ctx.fillText(s.label, lx + 18, ly);
        ly += 18;
      }
    }

    ctx.globalAlpha = 1;
  }

  /* ─────────────────────── Candlestick ─────────────────────── */

  _renderCandlestick() {
    const ctx = this.ctx;
    const { width, height, padding, gridLines, fontFamily, fontSize,
            backgroundColor, gridColor, textColor, title } = this.opts;

    const alpha = this.opts._globalAlpha ?? 1;
    ctx.globalAlpha = alpha;
    ctx.clearRect(0, 0, width, height);
    if (backgroundColor && backgroundColor !== 'transparent') {
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, width, height);
    }

    const plotX = padding.left;
    const plotY = padding.top;
    const plotW = width - padding.left - padding.right;
    const plotH = height - padding.top - padding.bottom;

    // data: [[weeks], [open], [high], [low], [close]]
    if (!this.data[0] || !this.data[0].length) {
      ctx.fillStyle = textColor;
      ctx.font = `14px ${fontFamily}`;
      ctx.textAlign = 'center';
      ctx.globalAlpha = 1;
      ctx.fillText('No candlestick data yet', width / 2, height / 2);
      return;
    }

    const xs = this.data[0];
    const opens  = this.data[1] || [];
    const highs  = this.data[2] || [];
    const lows   = this.data[3] || [];
    const closes = this.data[4] || [];

    const allPrices = [...highs, ...lows].filter(v => v != null);
    if (!allPrices.length) { ctx.globalAlpha = 1; return; }

    let yMin = Math.min(...allPrices);
    let yMax = Math.max(...allPrices);
    const yPad = (yMax - yMin) * 0.1 || 5;
    yMin -= yPad;
    yMax += yPad;

    const xStep = plotW / Math.max(xs.length - 1, 1);
    const toX = (i) => plotX + i * xStep;
    const toY = (v) => plotY + plotH - ((v - yMin) / (yMax - yMin)) * plotH;
    const candleW = Math.max(4, xStep * 0.4);

    // Title
    if (title) {
      ctx.fillStyle = textColor;
      ctx.font = `bold 14px ${fontFamily}`;
      ctx.textAlign = 'center';
      ctx.fillText(title, width / 2, 18);
    }

    // Grid & Y labels
    ctx.font = `${fontSize}px ${fontFamily}`;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    for (let i = 0; i <= gridLines; i++) {
      const y = plotY + (plotH / gridLines) * i;
      const val = yMax - ((yMax - yMin) / gridLines) * i;
      ctx.strokeStyle = gridColor;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(plotX, y);
      ctx.lineTo(plotX + plotW, y);
      ctx.stroke();
      ctx.fillStyle = textColor;
      ctx.fillText('$' + val.toFixed(0), plotX - 8, y);
    }

    // X labels
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    for (let i = 0; i < xs.length; i++) {
      ctx.fillStyle = textColor;
      ctx.fillText('W' + xs[i], toX(i), plotY + plotH + 8);
    }

    // Hover line
    if (this.hoveredIdx >= 0 && this.hoveredIdx < xs.length) {
      const hx = toX(this.hoveredIdx);
      ctx.strokeStyle = 'rgba(128,128,128,0.3)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(hx, plotY);
      ctx.lineTo(hx, plotY + plotH);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Draw candles
    for (let i = 0; i < xs.length; i++) {
      if (opens[i] == null || closes[i] == null) continue;
      const cx = toX(i);
      const open = opens[i];
      const close = closes[i];
      const high = highs[i];
      const low  = lows[i];
      const isUp = close >= open;
      const color = isUp ? '#10b981' : '#f43f5e';

      // Wick
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(cx, toY(high));
      ctx.lineTo(cx, toY(low));
      ctx.stroke();

      // Body
      const bodyTop = toY(Math.max(open, close));
      const bodyBot = toY(Math.min(open, close));
      const bodyH = Math.max(2, bodyBot - bodyTop);
      ctx.fillStyle = isUp ? this._toRgba(color, 0.85) : color;
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.fillRect(cx - candleW / 2, bodyTop, candleW, bodyH);
      ctx.strokeRect(cx - candleW / 2, bodyTop, candleW, bodyH);
    }

    ctx.globalAlpha = 1;
  }

  /* ─────────────────────── Utilities ─────────────────────── */

  _toRgba(color, alpha) {
    if (color.startsWith('#')) {
      const hex = color.slice(1);
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      return `rgba(${r},${g},${b},${alpha})`;
    }
    if (color.startsWith('rgba')) return color.replace(/[\d.]+\)$/, alpha + ')');
    if (color.startsWith('rgb')) return color.replace(')', `, ${alpha})`).replace('rgb', 'rgba');
    return color;
  }

  _deepCopyData(data) {
    if (!data) return [];
    return data.map(arr => Array.isArray(arr) ? [...arr] : arr);
  }

  resize(width, height) {
    this.opts.width = width;
    this.opts.height = height;
    this._initCanvas();
    this.render();
  }

  destroy() {
    this._cancelAnimation();
    this.stopLiveTick();
    this.canvas.removeEventListener('mousemove', this._onMouseMove);
    this.canvas.removeEventListener('mouseleave', this._onMouseLeave);
    this.container.innerHTML = '';
  }
}
