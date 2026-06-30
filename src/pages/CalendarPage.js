/**
 * Calendar Page
 * @module pages/CalendarPage
 */

'use strict';

import { getTasks } from '../services/storage.js';
import { getToday, formatDate } from '../utils/helpers.js';
import { createCalendar } from '../components/Calendar.js';
import { createTaskCard, createEmptyState } from '../components/TaskCard.js';

let currentCalendarDate = new Date();
let selectedDate = getToday();

/**
 * Render calendar page
 * @returns {HTMLElement}
 */
export function renderCalendarPage() {
  const container = document.createElement('div');
  container.className = 'page';
  container.id = 'calendar';

  // Header
  const header = document.createElement('header');
  header.style.cssText = `
    padding: 24px 20px 16px;
    position: sticky;
    top: 0;
    background: var(--bg-primary);
    z-index: 10;
  `;
  header.innerHTML = `<h1 style="font-size:20px;font-weight:700">التقويم</h1>`;
  container.appendChild(header);

  // Calendar
  const tasks = getTasks();
  const calendarWrapper = document.createElement('div');
  calendarWrapper.id = 'calendarWrapper';
  calendarWrapper.style.cssText = 'margin-bottom: 20px;';

  const calendar = createCalendar(currentCalendarDate, tasks, handleDayClick);
  calendarWrapper.appendChild(calendar);
  container.appendChild(calendarWrapper);

  // Selected date tasks
  const tasksSection = document.createElement('div');
  tasksSection.id = 'calendarTasks';
  tasksSection.style.cssText = 'padding: 0 20px 100px;';
  container.appendChild(tasksSection);

  renderDateTasks(tasksSection, tasks);

  return container;
}

/**
 * Handle day click
 * @param {string|null} dateStr
 * @param {Date} newDate
 */
function handleDayClick(dateStr, newDate) {
  if (dateStr) {
    selectedDate = dateStr;
  }
  if (newDate) {
    currentCalendarDate = newDate;
    // Re-render calendar
    const wrapper = document.querySelector('#calendarWrapper');
    if (wrapper) {
      wrapper.innerHTML = '';
      const tasks = getTasks();
      wrapper.appendChild(createCalendar(currentCalendarDate, tasks, handleDayClick));
      if (window.lucide) window.lucide.createIcons();
    }
  }

  // Re-render tasks for selected date
  const tasksSection = document.querySelector('#calendarTasks');
  if (tasksSection) {
    renderDateTasks(tasksSection, getTasks());
  }
}

/**
 * Render tasks for selected date
 * @param {HTMLElement} container
 * @param {Task[]} tasks
 */
function renderDateTasks(container, tasks) {
  container.innerHTML = '';

  const dateTasks = tasks.filter(t => t.date === selectedDate);
  const completedCount = dateTasks.filter(t => t.completed).length;

  const header = document.createElement('div');
  header.style.cssText = `
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
  `;
  header.innerHTML = `
    <div>
      <h2 style="font-size:16px;font-weight:700">${formatDate(selectedDate)}</h2>
      <span style="font-size:12px;color:var(--text-secondary)">${dateTasks.length} مهمة (${completedCount} منجزة)</span>
    </div>
  `;
  container.appendChild(header);

  if (dateTasks.length === 0) {
    container.appendChild(createEmptyState('لا توجد مهام في هذا اليوم', 'calendar-x'));
  } else {
    // Sort by time then priority
    const sorted = [...dateTasks].sort((a, b) => {
      if (a.time && b.time) return a.time.localeCompare(b.time);
      if (a.time) return -1;
      if (b.time) return 1;
      const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    sorted.forEach(task => {
      container.appendChild(createTaskCard(task, {
        onToggle: window.app?.toggleTask,
        onEdit: window.app?.editTask,
        onDelete: window.app?.deleteTask,
        showDate: false
      }));
    });
  }

  if (window.lucide) window.lucide.createIcons();
}
