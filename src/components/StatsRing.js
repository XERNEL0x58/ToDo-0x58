/**
 * Stats Ring Component
 * @module components/StatsRing
 */

'use strict';

/**
 * Create animated stats ring
 * @param {number} percentage - 0-100
 * @param {string} label
 * @param {string} size - 'sm' | 'md' | 'lg'
 * @returns {HTMLElement}
 */
export function createStatsRing(percentage, label, size = 'md') {
  const sizes = {
    sm: { width: 80, stroke: 6, font: 18 },
    md: { width: 120, stroke: 8, font: 24 },
    lg: { width: 160, stroke: 10, font: 32 }
  };

  const { width, stroke, font } = sizes[size] || sizes.md;
  const radius = (width - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  const container = document.createElement('div');
  container.style.cssText = `
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
  `;

  container.innerHTML = `
    <div class="stats-ring" style="width:${width}px;height:${width}px">
      <svg width="${width}" height="${width}" viewBox="0 0 ${width} ${width}">
        <circle class="stats-ring-bg" cx="${width/2}" cy="${width/2}" r="${radius}"></circle>
        <circle class="stats-ring-fill" cx="${width/2}" cy="${width/2}" r="${radius}" 
          stroke-dasharray="${circumference}" stroke-dashoffset="${circumference}"></circle>
      </svg>
      <div class="stats-ring-text" style="font-size:${font}px">${Math.round(percentage)}%</div>
    </div>
    <span style="font-size:13px;color:var(--text-secondary);font-weight:500">${label}</span>
  `;

  // Animate after a short delay
  setTimeout(() => {
    const fill = container.querySelector('.stats-ring-fill');
    if (fill) {
      fill.style.strokeDashoffset = offset;
    }
  }, 100);

  return container;
}

/**
 * Create stats bar
 * @param {string} label
 * @param {number} value
 * @param {number} max
 * @param {string} color
 * @returns {HTMLElement}
 */
export function createStatsBar(label, value, max, color = '#00E676') {
  const percentage = max > 0 ? (value / max) * 100 : 0;

  const container = document.createElement('div');
  container.style.cssText = 'margin-bottom: 16px;';

  container.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
      <span style="font-size:13px;color:var(--text-secondary)">${label}</span>
      <span style="font-size:13px;font-weight:600">${value}</span>
    </div>
    <div class="progress-bar">
      <div class="progress-fill" style="width:0%;background:${color}"></div>
    </div>
  `;

  setTimeout(() => {
    const fill = container.querySelector('.progress-fill');
    if (fill) fill.style.width = percentage + '%';
  }, 100);

  return container;
}

/**
 * Create mini stat card
 * @param {string} icon
 * @param {string} label
 * @param {string|number} value
 * @param {string} color
 * @returns {HTMLElement}
 */
export function createMiniStatCard(icon, label, value, color = '#00E676') {
  const card = document.createElement('div');
  card.style.cssText = `
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 16px;
    display: flex;
    align-items: center;
    gap: 12px;
    transition: all 0.2s ease;
  `;

  card.innerHTML = `
    <div style="
      width: 44px;
      height: 44px;
      border-radius: 12px;
      background: ${color}15;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    ">
      <i data-lucide="${icon}" style="width:22px;height:22px;color:${color}"></i>
    </div>
    <div style="min-width:0">
      <div style="font-size:20px;font-weight:700;margin-bottom:2px">${value}</div>
      <div style="font-size:12px;color:var(--text-secondary)">${label}</div>
    </div>
  `;

  return card;
}
