/**
 * minichart.js — Lightweight canvas chart for Stock Market Learning Guide
 * Purpose-built replacement for uPlot. Draws line charts with:
 *   - Multiple series (portfolio value, individual stocks)
 *   - Axis labels, grid lines, tooltips on hover
 *   - Responsive sizing
 *   - Smooth rendering via requestAnimationFrame
 *
 * Usage:
 *   const chart = new MiniChart(containerEl, { width, height, series, data, colors });
 *   chart.update(newData);
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
      backgroundColor: 'transparent',
      gridColor: 'rgba(128,128,128,0.15)',
      axisColor: 'rgba(128,128,128,0.6)',
      textColor: 'rgba(128,128,128,0.9)',
      title: '',
    }, opts);

    this.series = opts.series || []; // [{ label, color }]
    this.data = opts.data || [];     // [[x values], [y1 values], [y2 values], ...]
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.tooltip = null;
    this.hoveredIdx = -1;

    this._initCanvas();
    this._initTooltip();
    this._bindEvents();
    this.render();
  }

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
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      this._handleHover(mx, my);
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
    const { padding, width } = this.opts;
    const plotW = width - padding.left - padding.right;
    const xs = this.data[0];
    const step = plotW / Math.max(xs.length - 1, 1);
    let closest = 0;
    let minDist = Infinity;
    for (let i = 0; i < xs.length; i++) {
      const px = padding.left + i * step;
      const dist = Math.abs(mx - px);
      if (dist < minDist) { minDist = dist; closest = i; }
    }
    this.hoveredIdx = closest;
    this.render();

    // Show tooltip
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
    const px = this.opts.padding.left + closest * step;
    this.tooltip.style.left = Math.min(px + 12, this.opts.width - 160) + 'px';
    this.tooltip.style.top = '8px';
  }

  update(data, series) {
    if (data) this.data = data;
    if (series) this.series = series;
    this.hoveredIdx = -1;
    this.tooltip.style.display = 'none';
    this.render();
  }

  render() {
    const ctx = this.ctx;
    const { width, height, padding, gridLines, lineWidth, pointRadius, fontFamily, fontSize,
            backgroundColor, gridColor, axisColor, textColor, title } = this.opts;

    // Clear
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
      ctx.fillText('No data yet — start trading!', width / 2, height / 2);
      return;
    }

    const xs = this.data[0];
    const allYs = [];
    for (let s = 1; s < this.data.length; s++) {
      for (const v of this.data[s]) { if (v != null) allYs.push(v); }
    }
    if (!allYs.length) return;

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
      const x = toX(i);
      ctx.fillStyle = textColor;
      ctx.fillText('W' + xs[i], x, plotY + plotH + 8);
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

      // Line
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      ctx.beginPath();
      let started = false;
      for (let i = 0; i < ys.length; i++) {
        if (ys[i] == null) continue;
        const x = toX(i);
        const y = toY(ys[i]);
        if (!started) { ctx.moveTo(x, y); started = true; }
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Area fill
      if (this.series.length === 1) {
        ctx.fillStyle = this._toRgba(color, 0.08);
        ctx.beginPath();
        let first = true;
        for (let i = 0; i < ys.length; i++) {
          if (ys[i] == null) continue;
          const x = toX(i);
          const y = toY(ys[i]);
          if (first) { ctx.moveTo(x, y); first = false; }
          else ctx.lineTo(x, y);
        }
        ctx.lineTo(toX(ys.length - 1), plotY + plotH);
        ctx.lineTo(toX(0), plotY + plotH);
        ctx.closePath();
        ctx.fill();
      }

      // Points
      for (let i = 0; i < ys.length; i++) {
        if (ys[i] == null) continue;
        const x = toX(i);
        const y = toY(ys[i]);
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
  }

  _toRgba(color, alpha) {
    // Convert any CSS color to rgba with given alpha
    if (color.startsWith('#')) {
      const hex = color.slice(1);
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      return `rgba(${r},${g},${b},${alpha})`;
    }
    if (color.startsWith('rgba')) {
      return color.replace(/[\d.]+\)$/, alpha + ')');
    }
    if (color.startsWith('rgb')) {
      return color.replace(')', `, ${alpha})`).replace('rgb', 'rgba');
    }
    return color;
  }

  resize(width, height) {
    this.opts.width = width;
    this.opts.height = height;
    this._initCanvas();
    this.render();
  }

  destroy() {
    this.canvas.removeEventListener('mousemove', this._onMouseMove);
    this.canvas.removeEventListener('mouseleave', this._onMouseLeave);
    this.container.innerHTML = '';
  }
}
