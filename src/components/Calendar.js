/**
 * Calendar Component
 * @module components/Calendar
 */

'use strict';

import { getMonthName, getShortDayName, getDaysInMonth, getFirstDayOfMonth, getToday } from '../utils/helpers.js';

/**
 * Create calendar component
 * @param {Date} currentDate
 * @param {Task[]} tasks
 * @param {Function} onDayClick
 * @returns {HTMLElement}
 */
export function createCalendar(currentDate, tasks, onDayClick) {
  const container = document.createElement('div');
  container.style.cssText = 'padding: 0 16px;';

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const today = getToday();

  // Header
  const header = document.createElement('div');
  header.style.cssText = `
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
    padding: 0 8px;
  `;

  const prevBtn = document.createElement('button');
  prevBtn.style.cssText = `
    background: none;
    border: none;
    color: var(--text-secondary);
    cursor: pointer;
    padding: 8px;
    border-radius: 10px;
    transition: all 0.2s ease;
  `;
  prevBtn.innerHTML = '<i data-lucide="chevron-right" style="width:20px;height:20px"></i>';
  prevBtn.addEventListener('click', () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(month - 1);
    if (onDayClick) onDayClick(null, newDate);
  });

  const title = document.createElement('h2');
  title.textContent = `${getMonthName(month)} ${year}`;
  title.style.cssText = 'font-size: 18px; font-weight: 700;';

  const nextBtn = document.createElement('button');
  nextBtn.style.cssText = prevBtn.style.cssText;
  nextBtn.innerHTML = '<i data-lucide="chevron-left" style="width:20px;height:20px"></i>';
  nextBtn.addEventListener('click', () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(month + 1);
    if (onDayClick) onDayClick(null, newDate);
  });

  header.appendChild(prevBtn);
  header.appendChild(title);
  header.appendChild(nextBtn);
  container.appendChild(header);

  // Days of week
  const daysRow = document.createElement('div');
  daysRow.style.cssText = `
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 4px;
    margin-bottom: 8px;
  `;

  for (let i = 0; i < 7; i++) {
    const dayLabel = document.createElement('div');
    dayLabel.textContent = getShortDayName(i);
    dayLabel.style.cssText = `
      text-align: center;
      font-size: 12px;
      color: var(--text-secondary);
      padding: 8px 0;
      font-weight: 500;
    `;
    daysRow.appendChild(dayLabel);
  }
  container.appendChild(daysRow);

  // Calendar grid
  const grid = document.createElement('div');
  grid.style.cssText = `
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 4px;
  `;

  // Empty cells before first day
  for (let i = 0; i < firstDay; i++) {
    const empty = document.createElement('div');
    empty.style.cssText = 'height: 40px;';
    grid.appendChild(empty);
  }

  // Days
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayTasks = tasks.filter(t => t.date === dateStr && !t.completed);
    const hasTasks = dayTasks.length > 0;
    const isToday = dateStr === today;

    const dayEl = document.createElement('div');
    dayEl.className = `calendar-day ${isToday ? 'today' : ''} ${hasTasks ? 'has-tasks' : ''}`;
    dayEl.textContent = day;
    dayEl.dataset.date = dateStr;

    if (hasTasks) {
      dayEl.title = `${dayTasks.length} مهمة`;
    }

    dayEl.addEventListener('click', () => {
      if (onDayClick) onDayClick(dateStr, currentDate);
    });

    grid.appendChild(dayEl);
  }

  container.appendChild(grid);

  // Today's tasks summary
  const todayTasks = tasks.filter(t => t.date === today && !t.completed);
  if (todayTasks.length > 0) {
    const summary = document.createElement('div');
    summary.style.cssText = `
      margin-top: 20px;
      padding: 16px;
      background: rgba(0, 230, 118, 0.05);
      border: 1px solid rgba(0, 230, 118, 0.1);
      border-radius: var(--radius);
    `;
    summary.innerHTML = `
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px">
        <i data-lucide="calendar-check" style="width:18px;height:18px;color:var(--primary)"></i>
        <span style="font-weight:600;font-size:14px">مهام اليوم</span>
        <span style="margin-right:auto;background:var(--primary);color:#000;padding:2px 10px;border-radius:12px;font-size:12px;font-weight:700">${todayTasks.length}</span>
      </div>
      <div style="display:flex;flex-direction:column;gap:8px">
        ${todayTasks.map(t => `
          <div style="display:flex;align-items:center;gap:8px;font-size:13px;color:var(--text-secondary)">
            <div style="width:6px;height:6px;border-radius:50%;background:var(--primary);flex-shrink:0"></div>
            <span style="flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${t.title}</span>
            ${t.time ? `<span style="font-size:11px;opacity:0.7">${t.time}</span>` : ''}
          </div>
        `).join('')}
      </div>
    `;
    container.appendChild(summary);
  }

  return container;
}
