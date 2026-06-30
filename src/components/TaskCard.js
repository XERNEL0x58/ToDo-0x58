/**
 * Task Card Component
 * @module components/TaskCard
 */

'use strict';

import { PRIORITIES } from '../types/index.js';
import { formatDate, formatTime, getRelativeTime } from '../utils/helpers.js';

/**
 * Create a task card element
 * @param {Task} task
 * @param {Object} options
 * @returns {HTMLElement}
 */
export function createTaskCard(task, { onToggle, onEdit, onDelete, showDate = true } = {}) {
  const card = document.createElement('div');
  card.className = 'card';
  card.dataset.taskId = task.id;
  card.style.cssText = `
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 16px;
    margin-bottom: 12px;
    position: relative;
    overflow: hidden;
    display: flex;
    align-items: flex-start;
    gap: 12px;
    transition: all 0.2s ease;
  `;

  const priority = PRIORITIES[task.priority] || PRIORITIES.medium;
  const isCompleted = task.completed;

  // Priority indicator bar
  const priorityBar = document.createElement('div');
  priorityBar.style.cssText = `
    position: absolute;
    right: 0;
    top: 0;
    bottom: 0;
    width: 4px;
    background: ${priority.color};
    border-radius: 0 var(--radius) var(--radius) 0;
    opacity: ${isCompleted ? 0.3 : 1};
    transition: opacity 0.2s ease;
  `;
  card.appendChild(priorityBar);

  // Checkbox
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.className = 'task-checkbox';
  checkbox.checked = isCompleted;
  checkbox.style.marginTop = '2px';
  checkbox.addEventListener('change', (e) => {
    e.stopPropagation();
    if (onToggle) onToggle(task.id, e.target.checked);
  });
  card.appendChild(checkbox);

  // Content
  const content = document.createElement('div');
  content.style.cssText = 'flex: 1; min-width: 0;';

  // Title
  const title = document.createElement('h3');
  title.textContent = task.title;
  title.style.cssText = `
    font-size: 15px;
    font-weight: 600;
    margin-bottom: 4px;
    word-break: break-word;
    text-decoration: ${isCompleted ? 'line-through' : 'none'};
    color: ${isCompleted ? 'var(--text-secondary)' : 'var(--text-primary)'};
    transition: all 0.2s ease;
  `;
  content.appendChild(title);

  // Description
  if (task.description) {
    const desc = document.createElement('p');
    desc.textContent = task.description;
    desc.style.cssText = `
      font-size: 13px;
      color: var(--text-secondary);
      margin-bottom: 8px;
      line-height: 1.5;
      word-break: break-word;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    `;
    content.appendChild(desc);
  }

  // Meta info row
  const meta = document.createElement('div');
  meta.style.cssText = `
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
  `;

  // Time
  if (task.time) {
    const timeEl = document.createElement('span');
    timeEl.style.cssText = 'display:flex;align-items:center;gap:4px;font-size:12px;color:var(--text-secondary)';
    timeEl.innerHTML = `<i data-lucide="clock" style="width:14px;height:14px"></i> ${formatTime(task.time)}`;
    meta.appendChild(timeEl);
  }

  // Date
  if (showDate && task.date) {
    const dateEl = document.createElement('span');
    dateEl.style.cssText = 'display:flex;align-items:center;gap:4px;font-size:12px;color:var(--text-secondary)';
    const relative = getRelativeTime(task.date);
    dateEl.innerHTML = `<i data-lucide="calendar" style="width:14px;height:14px"></i> ${relative}`;
    meta.appendChild(dateEl);
  }

  // Tag
  if (task.tag) {
    const tagEl = document.createElement('span');
    tagEl.style.cssText = `
      display: inline-flex;
      align-items: center;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 11px;
      background: rgba(255,255,255,0.05);
      color: var(--text-secondary);
      border: 1px solid var(--border);
    `;
    tagEl.textContent = `#${task.tag}`;
    meta.appendChild(tagEl);
  }

  // Priority badge
  const priorityBadge = document.createElement('span');
  priorityBadge.style.cssText = `
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 11px;
    background: ${priority.color}15;
    color: ${priority.color};
    border: 1px solid ${priority.color}30;
  `;
  priorityBadge.textContent = priority.label;
  meta.appendChild(priorityBadge);

  content.appendChild(meta);
  card.appendChild(content);

  // Actions
  const actions = document.createElement('div');
  actions.style.cssText = `
    display: flex;
    flex-direction: column;
    gap: 8px;
    opacity: 0;
    transition: opacity 0.2s ease;
  `;

  // Show actions on hover (desktop) or always on mobile
  const isMobile = /Android|webOS|iPhone|iPad|iPod/i.test(navigator.userAgent);
  if (isMobile) {
    actions.style.opacity = '1';
    actions.style.flexDirection = 'row';
  } else {
    card.addEventListener('mouseenter', () => actions.style.opacity = '1');
    card.addEventListener('mouseleave', () => actions.style.opacity = '0');
  }

  // Edit button
  const editBtn = document.createElement('button');
  editBtn.style.cssText = `
    background: none;
    border: none;
    color: var(--text-secondary);
    cursor: pointer;
    padding: 6px;
    border-radius: 8px;
    transition: all 0.2s ease;
  `;
  editBtn.innerHTML = '<i data-lucide="pencil" style="width:16px;height:16px"></i>';
  editBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (onEdit) onEdit(task);
  });
  editBtn.addEventListener('mouseenter', () => editBtn.style.background = 'rgba(255,255,255,0.05)');
  editBtn.addEventListener('mouseleave', () => editBtn.style.background = 'none');
  actions.appendChild(editBtn);

  // Delete button
  const deleteBtn = document.createElement('button');
  deleteBtn.style.cssText = `
    background: none;
    border: none;
    color: var(--danger);
    cursor: pointer;
    padding: 6px;
    border-radius: 8px;
    transition: all 0.2s ease;
  `;
  deleteBtn.innerHTML = '<i data-lucide="trash-2" style="width:16px;height:16px"></i>';
  deleteBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (onDelete) onDelete(task);
  });
  deleteBtn.addEventListener('mouseenter', () => deleteBtn.style.background = 'rgba(255,61,113,0.1)');
  deleteBtn.addEventListener('mouseleave', () => deleteBtn.style.background = 'none');
  actions.appendChild(deleteBtn);

  card.appendChild(actions);

  // Click on card to toggle (except buttons)
  card.addEventListener('click', (e) => {
    if (e.target === card || e.target === content || e.target === title || e.target === meta) {
      checkbox.checked = !checkbox.checked;
      if (onToggle) onToggle(task.id, checkbox.checked);
    }
  });

  return card;
}

/**
 * Create skeleton task card
 * @returns {HTMLElement}
 */
export function createSkeletonCard() {
  const card = document.createElement('div');
  card.style.cssText = `
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 16px;
    margin-bottom: 12px;
    display: flex;
    align-items: flex-start;
    gap: 12px;
  `;

  card.innerHTML = `
    <div class="skeleton" style="width:24px;height:24px;border-radius:6px;flex-shrink:0"></div>
    <div style="flex:1">
      <div class="skeleton" style="width:70%;height:16px;margin-bottom:8px"></div>
      <div class="skeleton" style="width:40%;height:12px;margin-bottom:8px"></div>
      <div class="skeleton" style="width:50%;height:12px"></div>
    </div>
  `;

  return card;
}

/**
 * Create empty state
 * @param {string} message
 * @param {string} icon
 * @returns {HTMLElement}
 */
export function createEmptyState(message, icon = 'clipboard-list') {
  const container = document.createElement('div');
  container.className = 'empty-state';

  container.innerHTML = `
    <div class="empty-state-icon">
      <i data-lucide="${icon}" style="width:36px;height:36px;color:var(--text-secondary)"></i>
    </div>
    <h3 style="font-size:16px;font-weight:600;margin-bottom:8px;color:var(--text-secondary)">${message}</h3>
    <p style="font-size:13px;color:var(--text-secondary);opacity:0.7">اضغط على الزر + لإضافة مهمة جديدة</p>
  `;

  return container;
}
