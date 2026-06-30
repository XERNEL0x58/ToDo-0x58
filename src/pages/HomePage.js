/**
 * Home Page
 * @module pages/HomePage
 */

'use strict';

import { PRIORITIES } from '../types/index.js';
import { getTasks } from '../services/storage.js';
import { formatDate, getToday, getGreeting, isToday, isThisWeek, isThisMonth } from '../utils/helpers.js';
import { createTaskCard, createSkeletonCard, createEmptyState } from '../components/TaskCard.js';
import { createMiniStatCard } from '../components/StatsRing.js';

/**
 * Render home page
 * @returns {HTMLElement}
 */
export function renderHomePage() {
  const container = document.createElement('div');
  container.className = 'page active';
  container.id = 'home';

  const tasks = getTasks();
  const today = getToday();
  const todayTasks = tasks.filter(t => t.date === today && !t.completed);
  const weekTasks = tasks.filter(t => isThisWeek(t.date) && !t.completed);
  const completedTasks = tasks.filter(t => t.completed);
  const monthTasks = tasks.filter(t => isThisMonth(t.date));
  const monthCompleted = monthTasks.filter(t => t.completed);
  const completionRate = monthTasks.length > 0 ? (monthCompleted.length / monthTasks.length) * 100 : 0;

  // Header
  const header = document.createElement('header');
  header.style.cssText = `
    padding: 24px 20px 16px;
    position: sticky;
    top: 0;
    background: var(--bg-primary);
    z-index: 10;
  `;

  header.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
      <div>
        <h1 style="font-size:14px;color:var(--text-secondary);font-weight:400;margin-bottom:4px">${getGreeting()}</h1>
        <div style="font-size:22px;font-weight:800">ToDo 0x58</div>
      </div>
      <div style="text-align:left">
        <div style="font-size:13px;color:var(--text-secondary)">${formatDate(today)}</div>
      </div>
    </div>
  `;
  container.appendChild(header);

  // Progress section
  const progressSection = document.createElement('div');
  progressSection.style.cssText = 'padding: 0 20px 20px;';
  progressSection.innerHTML = `
    <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius);padding:20px">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
        <span style="font-size:14px;font-weight:600">إنجاز الشهر</span>
        <span style="font-size:20px;font-weight:800;color:var(--primary)">${Math.round(completionRate)}%</span>
      </div>
      <div class="progress-bar">
        <div class="progress-fill" style="width:0%"></div>
      </div>
      <div style="display:flex;justify-content:space-between;margin-top:8px;font-size:12px;color:var(--text-secondary)">
        <span>${monthCompleted.length} منجزة</span>
        <span>${monthTasks.length - monthCompleted.length} متبقية</span>
      </div>
    </div>
  `;
  container.appendChild(progressSection);

  // Animate progress bar
  setTimeout(() => {
    const fill = progressSection.querySelector('.progress-fill');
    if (fill) fill.style.width = completionRate + '%';
  }, 200);

  // Stats cards grid
  const statsGrid = document.createElement('div');
  statsGrid.style.cssText = `
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    padding: 0 20px 20px;
  `;

  statsGrid.appendChild(createMiniStatCard('sun', 'مهام اليوم', todayTasks.length, '#FF9800'));
  statsGrid.appendChild(createMiniStatCard('calendar-days', 'هذا الأسبوع', weekTasks.length, '#00BCD4'));
  statsGrid.appendChild(createMiniStatCard('check-circle-2', 'المنجزة', completedTasks.length, '#00E676'));
  statsGrid.appendChild(createMiniStatCard('trending-up', 'نسبة الإنجاز', Math.round(completionRate) + '%', '#4CAF50'));

  container.appendChild(statsGrid);

  // Today's tasks section
  const todaySection = document.createElement('div');
  todaySection.style.cssText = 'padding: 0 20px 20px;';

  const sectionHeader = document.createElement('div');
  sectionHeader.style.cssText = `
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
  `;
  sectionHeader.innerHTML = `
    <h2 style="font-size:16px;font-weight:700">مهام اليوم</h2>
    <span style="font-size:13px;color:var(--text-secondary)">${todayTasks.length} مهمة</span>
  `;
  todaySection.appendChild(sectionHeader);

  if (todayTasks.length === 0) {
    todaySection.appendChild(createEmptyState('لا توجد مهام لهذا اليوم', 'sun'));
  } else {
    // Sort by priority then time
    const sorted = [...todayTasks].sort((a, b) => {
      const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      return (a.time || '99:99').localeCompare(b.time || '99:99');
    });

    sorted.forEach(task => {
      todaySection.appendChild(createTaskCard(task, {
        onToggle: window.app?.toggleTask,
        onEdit: window.app?.editTask,
        onDelete: window.app?.deleteTask,
        showDate: false
      }));
    });
  }

  container.appendChild(todaySection);

  // Upcoming tasks
  const upcomingTasks = tasks
    .filter(t => t.date > today && !t.completed)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 5);

  if (upcomingTasks.length > 0) {
    const upcomingSection = document.createElement('div');
    upcomingSection.style.cssText = 'padding: 0 20px 100px;';

    const upcomingHeader = document.createElement('div');
    upcomingHeader.style.cssText = `
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 12px;
    `;
    upcomingHeader.innerHTML = `
      <h2 style="font-size:16px;font-weight:700">المهام القادمة</h2>
      <button id="viewAllUpcoming" style="background:none;border:none;color:var(--primary);font-size:13px;cursor:pointer;font-family:inherit;font-weight:600">عرض الكل</button>
    `;
    upcomingSection.appendChild(upcomingHeader);

    upcomingTasks.forEach(task => {
      upcomingSection.appendChild(createTaskCard(task, {
        onToggle: window.app?.toggleTask,
        onEdit: window.app?.editTask,
        onDelete: window.app?.deleteTask,
        showDate: true
      }));
    });

    container.appendChild(upcomingSection);
  }

  return container;
}
