/**
 * Stats Page
 * @module pages/StatsPage
 */

'use strict';

import { PRIORITIES } from '../types/index.js';
import { getTasks, getTags } from '../services/storage.js';
import { getToday, isThisMonth, getMonthName } from '../utils/helpers.js';
import { createStatsRing, createStatsBar, createMiniStatCard } from '../components/StatsRing.js';

/**
 * Render stats page
 * @returns {HTMLElement}
 */
export function renderStatsPage() {
  const container = document.createElement('div');
  container.className = 'page';
  container.id = 'stats';

  const tasks = getTasks();
  const today = getToday();

  // Calculate stats
  const total = tasks.length;
  const completed = tasks.filter(t => t.completed).length;
  const pending = total - completed;
  const completionRate = total > 0 ? (completed / total) * 100 : 0;

  const monthTasks = tasks.filter(t => isThisMonth(t.date));
  const monthCompleted = monthTasks.filter(t => t.completed);
  const monthRate = monthTasks.length > 0 ? (monthCompleted.length / monthTasks.length) * 100 : 0;

  // Priority breakdown
  const byPriority = {};
  Object.keys(PRIORITIES).forEach(p => {
    byPriority[p] = {
      total: tasks.filter(t => t.priority === p).length,
      completed: tasks.filter(t => t.priority === p && t.completed).length
    };
  });

  // Tag breakdown
  const byTag = {};
  const tags = getTags();
  tags.forEach(tag => {
    byTag[tag] = tasks.filter(t => t.tag === tag).length;
  });

  // Weekly data
  const byDay = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    byDay[dateStr] = tasks.filter(t => t.date === dateStr && t.completed).length;
  }

  // Header
  const header = document.createElement('header');
  header.style.cssText = `
    padding: 24px 20px 16px;
    position: sticky;
    top: 0;
    background: var(--bg-primary);
    z-index: 10;
  `;
  header.innerHTML = `<h1 style="font-size:20px;font-weight:700">الإحصائيات</h1>`;
  container.appendChild(header);

  // Main stats ring
  const ringSection = document.createElement('div');
  ringSection.style.cssText = `
    display: flex;
    justify-content: center;
    padding: 20px;
  `;
  ringSection.appendChild(createStatsRing(monthRate, `إنجاز ${getMonthName(new Date().getMonth())}`, 'lg'));
  container.appendChild(ringSection);

  // Stats grid
  const statsGrid = document.createElement('div');
  statsGrid.style.cssText = `
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    padding: 0 20px 20px;
  `;

  statsGrid.appendChild(createMiniStatCard('list-todo', 'إجمالي المهام', total, '#00BCD4'));
  statsGrid.appendChild(createMiniStatCard('check-circle-2', 'المنجزة', completed, '#00E676'));
  statsGrid.appendChild(createMiniStatCard('clock', 'المتبقية', pending, '#FF9800'));
  statsGrid.appendChild(createMiniStatCard('percent', 'نسبة الإنجاز', Math.round(completionRate) + '%', '#4CAF50'));

  container.appendChild(statsGrid);

  // Priority breakdown
  const prioritySection = document.createElement('div');
  prioritySection.style.cssText = 'padding: 0 20px 20px;';
  prioritySection.innerHTML = `
    <h2 style="font-size:16px;font-weight:700;margin-bottom:16px">حسب الأولوية</h2>
    <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius);padding:20px">
      ${Object.entries(PRIORITIES).map(([key, p]) => {
        const data = byPriority[key];
        const rate = data.total > 0 ? (data.completed / data.total) * 100 : 0;
        return `
          <div style="margin-bottom:16px">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
              <span style="display:flex;align-items:center;gap:6px;font-size:13px">
                <span style="width:8px;height:8px;border-radius:50%;background:${p.color}"></span>
                ${p.label}
              </span>
              <span style="font-size:13px;font-weight:600">${data.completed}/${data.total}</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" style="width:0%;background:${p.color}"></div>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
  container.appendChild(prioritySection);

  // Animate priority bars
  setTimeout(() => {
    const bars = prioritySection.querySelectorAll('.progress-fill');
    Object.entries(PRIORITIES).forEach(([key], i) => {
      const data = byPriority[key];
      const rate = data.total > 0 ? (data.completed / data.total) * 100 : 0;
      if (bars[i]) bars[i].style.width = rate + '%';
    });
  }, 300);

  // Tag breakdown
  if (Object.keys(byTag).some(k => byTag[k] > 0)) {
    const tagSection = document.createElement('div');
    tagSection.style.cssText = 'padding: 0 20px 20px;';
    tagSection.innerHTML = `<h2 style="font-size:16px;font-weight:700;margin-bottom:16px">حسب الوسم</h2>`;

    const maxTag = Math.max(...Object.values(byTag));

    Object.entries(byTag)
      .filter(([, count]) => count > 0)
      .sort(([, a], [, b]) => b - a)
      .forEach(([tag, count]) => {
        tagSection.appendChild(createStatsBar(`#${tag}`, count, maxTag, '#00BCD4'));
      });

    container.appendChild(tagSection);
  }

  // Weekly activity
  const weeklySection = document.createElement('div');
  weeklySection.style.cssText = 'padding: 0 20px 100px;';
  weeklySection.innerHTML = `<h2 style="font-size:16px;font-weight:700;margin-bottom:16px">نشاط الأسبوع</h2>`;

  const chartContainer = document.createElement('div');
  chartContainer.style.cssText = `
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 20px;
    display: flex;
    align-items: flex-end;
    justify-content: space-around;
    height: 180px;
    gap: 8px;
  `;

  const maxDay = Math.max(...Object.values(byDay), 1);
  const dayNames = ['أحد', 'إثن', 'ثل', 'أرب', 'خم', 'جم', 'سب'];
  const todayIndex = new Date().getDay();

  Object.entries(byDay).forEach(([date, count], i) => {
    const dayIndex = (todayIndex - 6 + i + 7) % 7;
    const height = (count / maxDay) * 120;
    const isToday = i === 6;

    const bar = document.createElement('div');
    bar.style.cssText = `
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      flex: 1;
    `;

    bar.innerHTML = `
      <span style="font-size:12px;font-weight:600;color:var(--primary)">${count}</span>
      <div style="
        width: 100%;
        max-width: 32px;
        height: ${height}px;
        background: ${isToday ? 'var(--primary)' : 'rgba(255,255,255,0.1)'};
        border-radius: 6px 6px 0 0;
        transition: all 0.5s ease;
        min-height: 4px;
      "></div>
      <span style="font-size:11px;color:var(--text-secondary)">${dayNames[dayIndex]}</span>
    `;

    chartContainer.appendChild(bar);
  });

  weeklySection.appendChild(chartContainer);
  container.appendChild(weeklySection);

  return container;
}
