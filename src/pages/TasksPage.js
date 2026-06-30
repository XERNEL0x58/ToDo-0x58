/**
 * Tasks Page
 * @module pages/TasksPage
 */

'use strict';

import { FILTERS } from '../types/index.js';
import { getTasks, getTags } from '../services/storage.js';
import { getToday, isToday, isThisWeek, isThisMonth, debounce } from '../utils/helpers.js';
import { createTaskCard, createEmptyState } from '../components/TaskCard.js';

let currentFilter = 'all';
let searchQuery = '';
let selectedTag = '';

/**
 * Render tasks page
 * @returns {HTMLElement}
 */
export function renderTasksPage() {
  const container = document.createElement('div');
  container.className = 'page';
  container.id = 'tasks';

  // Header with search
  const header = document.createElement('header');
  header.style.cssText = `
    padding: 24px 20px 16px;
    position: sticky;
    top: 0;
    background: var(--bg-primary);
    z-index: 10;
  `;

  header.innerHTML = `
    <h1 style="font-size:20px;font-weight:700;margin-bottom:16px">المهام</h1>
    <div style="position:relative">
      <i data-lucide="search" style="position:absolute;right:14px;top:50%;transform:translateY(-50%);width:18px;height:18px;color:var(--text-secondary)"></i>
      <input type="text" id="taskSearch" class="input-field" placeholder="البحث في المهام..." style="padding-right:42px" value="${searchQuery}">
    </div>
  `;
  container.appendChild(header);

  // Filters
  const filtersContainer = document.createElement('div');
  filtersContainer.style.cssText = `
    display: flex;
    gap: 8px;
    padding: 0 20px 12px;
    overflow-x: auto;
    scrollbar-width: none;
    -ms-overflow-style: none;
  `;
  filtersContainer.style.cssText += '::-webkit-scrollbar { display: none; }';

  FILTERS.forEach(filter => {
    const btn = document.createElement('button');
    btn.className = `tag ${filter.id === currentFilter ? 'active' : ''}`;
    btn.textContent = filter.label;
    btn.style.cssText += 'white-space: nowrap; padding: 6px 14px;';
    btn.addEventListener('click', () => {
      currentFilter = filter.id;
      refreshTasksList(container);
    });
    filtersContainer.appendChild(btn);
  });

  container.appendChild(filtersContainer);

  // Tags filter
  const tags = getTags();
  if (tags.length > 0) {
    const tagsContainer = document.createElement('div');
    tagsContainer.style.cssText = `
      display: flex;
      gap: 8px;
      padding: 0 20px 16px;
      overflow-x: auto;
      scrollbar-width: none;
    `;

    const allTag = document.createElement('button');
    allTag.className = `tag ${selectedTag === '' ? 'active' : ''}`;
    allTag.textContent = 'الكل';
    allTag.style.whiteSpace = 'nowrap';
    allTag.addEventListener('click', () => {
      selectedTag = '';
      refreshTasksList(container);
    });
    tagsContainer.appendChild(allTag);

    tags.forEach(tag => {
      const btn = document.createElement('button');
      btn.className = `tag ${selectedTag === tag ? 'active' : ''}`;
      btn.textContent = `#${tag}`;
      btn.style.whiteSpace = 'nowrap';
      btn.addEventListener('click', () => {
        selectedTag = tag;
        refreshTasksList(container);
      });
      tagsContainer.appendChild(btn);
    });

    container.appendChild(tagsContainer);
  }

  // Tasks list
  const tasksList = document.createElement('div');
  tasksList.id = 'tasksList';
  tasksList.style.cssText = 'padding: 0 20px 100px;';
  container.appendChild(tasksList);

  // Initial render
  refreshTasksList(container);

  // Search handler
  const searchInput = header.querySelector('#taskSearch');
  if (searchInput) {
    searchInput.addEventListener('input', debounce((e) => {
      searchQuery = e.target.value;
      refreshTasksList(container);
    }, 200));
  }

  return container;
}

/**
 * Refresh tasks list based on filters
 * @param {HTMLElement} container
 */
function refreshTasksList(container) {
  const tasksList = container.querySelector('#tasksList');
  if (!tasksList) return;

  tasksList.innerHTML = '';

  const tasks = getTasks();
  const today = getToday();

  // Apply filters
  let filtered = tasks;

  switch (currentFilter) {
    case 'today':
      filtered = tasks.filter(t => isToday(t.date));
      break;
    case 'week':
      filtered = tasks.filter(t => isThisWeek(t.date));
      break;
    case 'month':
      filtered = tasks.filter(t => isThisMonth(t.date));
      break;
    case 'completed':
      filtered = tasks.filter(t => t.completed);
      break;
    case 'pending':
      filtered = tasks.filter(t => !t.completed);
      break;
  }

  // Apply tag filter
  if (selectedTag) {
    filtered = filtered.filter(t => t.tag === selectedTag);
  }

  // Apply search
  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase();
    filtered = filtered.filter(t => 
      t.title.toLowerCase().includes(query) ||
      (t.description && t.description.toLowerCase().includes(query)) ||
      (t.tag && t.tag.toLowerCase().includes(query))
    );
  }

  // Sort: pending first, then by date, then by priority
  filtered.sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  // Update filter buttons
  const filterButtons = container.querySelectorAll('.tag');
  filterButtons.forEach(btn => {
    const isFilter = FILTERS.some(f => f.label === btn.textContent);
    const isTag = !isFilter && btn.textContent !== 'الكل';

    if (isFilter) {
      const filter = FILTERS.find(f => f.label === btn.textContent);
      btn.classList.toggle('active', filter && filter.id === currentFilter);
    } else if (isTag) {
      const tag = btn.textContent.replace('#', '');
      btn.classList.toggle('active', tag === selectedTag);
    } else if (btn.textContent === 'الكل') {
      btn.classList.toggle('active', selectedTag === '');
    }
  });

  if (filtered.length === 0) {
    const emptyMsg = searchQuery 
      ? 'لا توجد نتائج للبحث' 
      : currentFilter === 'completed' 
        ? 'لا توجد مهام منجزة' 
        : 'لا توجد مهام';
    tasksList.appendChild(createEmptyState(emptyMsg, 'search'));
  } else {
    filtered.forEach(task => {
      tasksList.appendChild(createTaskCard(task, {
        onToggle: window.app?.toggleTask,
        onEdit: window.app?.editTask,
        onDelete: window.app?.deleteTask,
        showDate: currentFilter === 'all' || currentFilter === 'completed' || currentFilter === 'pending'
      }));
    });
  }

  // Re-initialize icons
  if (window.lucide) {
    window.lucide.createIcons();
  }
}
