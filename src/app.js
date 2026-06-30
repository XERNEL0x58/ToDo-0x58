/**
 * ToDo 0x58 - Main Application
 * @module app
 */

'use strict';

import { PAGES, PRIORITIES, DEFAULT_TAGS } from './types/index.js';
import { getTasks, saveTasks, getTags, addTag, getSettings } from './services/storage.js';
import { scheduleTaskReminder, cancelReminder } from './services/notifications.js';
import { 
  generateId, getToday, formatDate, createRipple, 
  showToast, triggerConfetti, debounce 
} from './utils/helpers.js';
import { renderHomePage } from './pages/HomePage.js';
import { renderTasksPage } from './pages/TasksPage.js';
import { renderCalendarPage } from './pages/CalendarPage.js';
import { renderStatsPage } from './pages/StatsPage.js';
import { renderSettingsPage } from './pages/SettingsPage.js';

// App State
let state = {
  currentPage: 'home',
  tasks: [],
  deleteTaskId: null,
  editingTask: null
};

// Initialize App
function init() {
  state.tasks = getTasks();

  // Check for URL params (shortcuts)
  const urlParams = new URLSearchParams(window.location.search);
  const action = urlParams.get('action');
  const filter = urlParams.get('filter');

  if (action === 'new-task') {
    setTimeout(() => openModal(), 500);
  }

  // Render initial page
  navigateTo('home');

  // Setup event listeners
  setupEventListeners();

  // Setup keyboard shortcuts
  setupKeyboardShortcuts();

  // Setup PWA install
  setupPWAInstall();

  // Schedule reminders
  scheduleAllReminders();

  // Initialize icons
  if (window.lucide) {
    window.lucide.createIcons();
  }

  console.log('ToDo 0x58 initialized');
}

// Navigation
function navigateTo(pageId) {
  state.currentPage = pageId;

  // Update nav
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.toggle('active', item.dataset.page === pageId);
  });

  // Render page
  const app = document.getElementById('app');
  app.innerHTML = '';

  let page;
  switch (pageId) {
    case 'home':
      page = renderHomePage();
      break;
    case 'tasks':
      page = renderTasksPage();
      break;
    case 'calendar':
      page = renderCalendarPage();
      break;
    case 'stats':
      page = renderStatsPage();
      break;
    case 'settings':
      page = renderSettingsPage();
      break;
    default:
      page = renderHomePage();
  }

  app.appendChild(page);

  // Re-initialize icons
  setTimeout(() => {
    if (window.lucide) window.lucide.createIcons();
  }, 50);
}

// Setup Event Listeners
function setupEventListeners() {
  // Bottom nav
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
      const page = item.dataset.page;
      if (page) navigateTo(page);
    });
  });

  // FAB
  const fab = document.querySelector('.fab');
  if (fab) {
    fab.addEventListener('click', (e) => {
      createRipple(e, fab);
      openModal();
    });
  }

  // Modal
  const modal = document.getElementById('taskModal');
  const closeModal = document.getElementById('closeModal');
  const taskForm = document.getElementById('taskForm');

  if (closeModal) {
    closeModal.addEventListener('click', closeTaskModal);
  }

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeTaskModal();
    });
  }

  if (taskForm) {
    taskForm.addEventListener('submit', handleTaskSubmit);
  }

  // Delete modal
  const cancelDelete = document.getElementById('cancelDelete');
  const confirmDelete = document.getElementById('confirmDelete');

  if (cancelDelete) {
    cancelDelete.addEventListener('click', closeDeleteModal);
  }

  if (confirmDelete) {
    confirmDelete.addEventListener('click', handleConfirmDelete);
  }

  const deleteModal = document.getElementById('deleteModal');
  if (deleteModal) {
    deleteModal.addEventListener('click', (e) => {
      if (e.target === deleteModal) closeDeleteModal();
    });
  }

  // Install banner
  const installBanner = document.getElementById('installBanner');
  const closeInstallBanner = document.getElementById('closeInstallBanner');

  if (closeInstallBanner) {
    closeInstallBanner.addEventListener('click', () => {
      installBanner.classList.remove('active');
      localStorage.setItem('todo58_install_dismissed', 'true');
    });
  }

  // Tags in modal
  setupTagsInModal();

  // Set default date in modal
  const taskDate = document.getElementById('taskDate');
  if (taskDate) {
    taskDate.value = getToday();
  }
}

// Setup Tags in Modal
function setupTagsInModal() {
  const container = document.getElementById('tagsContainer');
  const taskTag = document.getElementById('taskTag');

  if (!container || !taskTag) return;

  const tags = getTags();
  container.innerHTML = '';

  tags.forEach(tag => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'tag';
    btn.textContent = `#${tag}`;
    btn.style.cssText = 'font-size: 12px; padding: 4px 10px;';
    btn.addEventListener('click', () => {
      taskTag.value = tag;
      // Highlight selected
      container.querySelectorAll('.tag').forEach(t => {
        t.classList.remove('active');
        t.style.background = 'rgba(255,255,255,0.05)';
      });
      btn.classList.add('active');
    });
    container.appendChild(btn);
  });
}

// Open Modal
function openModal(task = null) {
  const modal = document.getElementById('taskModal');
  const modalTitle = document.getElementById('modalTitle');
  const taskId = document.getElementById('taskId');
  const taskTitle = document.getElementById('taskTitle');
  const taskDesc = document.getElementById('taskDesc');
  const taskDate = document.getElementById('taskDate');
  const taskTime = document.getElementById('taskTime');
  const taskPriority = document.getElementById('taskPriority');
  const taskTag = document.getElementById('taskTag');

  state.editingTask = task;

  if (task) {
    modalTitle.textContent = 'تعديل المهمة';
    taskId.value = task.id;
    taskTitle.value = task.title;
    taskDesc.value = task.description || '';
    taskDate.value = task.date;
    taskTime.value = task.time || '';
    taskPriority.value = task.priority;
    taskTag.value = task.tag || '';
  } else {
    modalTitle.textContent = 'مهمة جديدة';
    taskId.value = '';
    taskTitle.value = '';
    taskDesc.value = '';
    taskDate.value = getToday();
    taskTime.value = '';
    taskPriority.value = 'medium';
    taskTag.value = '';
  }

  setupTagsInModal();

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';

  // Focus on title
  setTimeout(() => taskTitle.focus(), 300);
}

// Close Modal
function closeTaskModal() {
  const modal = document.getElementById('taskModal');
  modal.classList.remove('active');
  document.body.style.overflow = '';
  state.editingTask = null;
}

// Handle Task Submit
function handleTaskSubmit(e) {
  e.preventDefault();

  const taskId = document.getElementById('taskId').value;
  const title = document.getElementById('taskTitle').value.trim();
  const description = document.getElementById('taskDesc').value.trim();
  const date = document.getElementById('taskDate').value;
  const time = document.getElementById('taskTime').value;
  const priority = document.getElementById('taskPriority').value;
  const tag = document.getElementById('taskTag').value.trim();

  if (!title) {
    showToast('يرجى إدخال اسم المهمة', 'error');
    return;
  }

  if (taskId) {
    // Edit existing
    const index = state.tasks.findIndex(t => t.id === taskId);
    if (index !== -1) {
      state.tasks[index] = {
        ...state.tasks[index],
        title,
        description,
        date,
        time,
        priority,
        tag
      };
      showToast('تم تحديث المهمة', 'success');
    }
  } else {
    // Create new
    const newTask = {
      id: generateId(),
      title,
      description,
      date,
      time,
      priority,
      tag,
      completed: false,
      createdAt: new Date().toISOString()
    };
    state.tasks.push(newTask);
    showToast('تمت إضافة المهمة', 'success');

    // Schedule reminder
    if (time) {
      scheduleTaskReminder(newTask);
    }
  }

  // Add tag if new
  if (tag && !getTags().includes(tag)) {
    addTag(tag);
  }

  // Save
  saveTasks(state.tasks);

  // Close modal
  closeTaskModal();

  // Refresh page
  navigateTo(state.currentPage);
}

// Toggle Task
function toggleTask(taskId, completed) {
  const index = state.tasks.findIndex(t => t.id === taskId);
  if (index === -1) return;

  state.tasks[index].completed = completed;
  saveTasks(state.tasks);

  if (completed) {
    showToast('تم إنجاز المهمة!');
    triggerConfetti();
    cancelReminder(taskId);
  } else {
    showToast('تم إرجاع المهمة');
    if (state.tasks[index].time) {
      scheduleTaskReminder(state.tasks[index]);
    }
  }

  // Refresh current page
  navigateTo(state.currentPage);
}

// Edit Task
function editTask(task) {
  openModal(task);
}

// Delete Task
function deleteTask(task) {
  state.deleteTaskId = task.id;
  const modal = document.getElementById('deleteModal');
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

// Confirm Delete
function handleConfirmDelete() {
  if (!state.deleteTaskId) return;

  state.tasks = state.tasks.filter(t => t.id !== state.deleteTaskId);
  saveTasks(state.tasks);
  cancelReminder(state.deleteTaskId);

  showToast('تم حذف المهمة', 'success');
  closeDeleteModal();
  navigateTo(state.currentPage);
}

// Close Delete Modal
function closeDeleteModal() {
  const modal = document.getElementById('deleteModal');
  modal.classList.remove('active');
  document.body.style.overflow = '';
  state.deleteTaskId = null;
}

// Keyboard Shortcuts
function setupKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + N: New task
    if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
      e.preventDefault();
      openModal();
    }

    // Ctrl/Cmd + F: Focus search (on tasks page)
    if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
      if (state.currentPage === 'tasks') {
        e.preventDefault();
        const searchInput = document.getElementById('taskSearch');
        if (searchInput) searchInput.focus();
      }
    }

    // Number keys for navigation
    if (!e.ctrlKey && !e.metaKey && !e.altKey) {
      switch (e.key) {
        case '1': navigateTo('home'); break;
        case '2': navigateTo('tasks'); break;
        case '3': navigateTo('calendar'); break;
        case '4': navigateTo('stats'); break;
        case '5': navigateTo('settings'); break;
      }
    }

    // Escape: Close modals
    if (e.key === 'Escape') {
      closeTaskModal();
      closeDeleteModal();
    }
  });
}

// PWA Install
let deferredPrompt = null;

function setupPWAInstall() {
  // Check if already installed or dismissed
  const isDismissed = localStorage.getItem('todo58_install_dismissed') === 'true';
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches;

  if (isStandalone || isDismissed) return;

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;

    // Show install banner after a delay
    setTimeout(() => {
      const banner = document.getElementById('installBanner');
      if (banner) banner.classList.add('active');
    }, 3000);
  });

  const installBtn = document.getElementById('installBtn');
  if (installBtn) {
    installBtn.addEventListener('click', async () => {
      if (!deferredPrompt) return;

      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === 'accepted') {
        showToast('تم تثبيت التطبيق!', 'success');
      }

      deferredPrompt = null;
      document.getElementById('installBanner').classList.remove('active');
    });
  }

  // Hide banner when installed
  window.addEventListener('appinstalled', () => {
    document.getElementById('installBanner').classList.remove('active');
    deferredPrompt = null;
    showToast('تم تثبيت التطبيق بنجاح!', 'success');
  });
}

// Schedule all reminders
function scheduleAllReminders() {
  const pendingTasks = state.tasks.filter(t => !t.completed && t.time);
  pendingTasks.forEach(scheduleTaskReminder);
}

// Expose app methods globally for components
window.app = {
  toggleTask,
  editTask,
  deleteTask,
  openModal,
  navigateTo
};

// Start app
document.addEventListener('DOMContentLoaded', init);

// Handle visibility change for notifications
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) {
    // Refresh when app becomes visible
    state.tasks = getTasks();
  }
});

// Handle online/offline
window.addEventListener('online', () => {
  showToast('متصل بالإنترنت', 'success');
});

window.addEventListener('offline', () => {
  showToast('وضع عدم الاتصال', 'info');
});
