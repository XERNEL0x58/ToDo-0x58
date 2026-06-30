/**
 * Notifications Service
 * @module services/notifications
 */

'use strict';

import { getSettings } from './storage.js';

/**
 * Request notification permission
 * @returns {Promise<string>}
 */
export async function requestPermission() {
  if (!('Notification' in window)) {
    return 'unsupported';
  }

  if (Notification.permission === 'granted') {
    return 'granted';
  }

  if (Notification.permission === 'denied') {
    return 'denied';
  }

  return await Notification.requestPermission();
}

/**
 * Check if notifications are supported and permitted
 * @returns {boolean}
 */
export function canNotify() {
  return 'Notification' in window && Notification.permission === 'granted';
}

/**
 * Send a notification
 * @param {string} title
 * @param {Object} options
 */
export function notify(title, options = {}) {
  const settings = getSettings();
  if (!settings.notifications || !canNotify()) return;

  const defaultOptions = {
    icon: 'src/assets/icons/icon-192x192.png',
    badge: 'src/assets/icons/icon-72x72.png',
    tag: 'todo-0x58',
    requireInteraction: false,
    silent: !settings.sound,
    vibrate: settings.haptic ? [200, 100, 200] : undefined
  };

  try {
    new Notification(title, { ...defaultOptions, ...options });
  } catch (err) {
    console.error('Notification error:', err);
  }
}

/**
 * Schedule a task reminder
 * @param {Task} task
 */
export function scheduleTaskReminder(task) {
  if (!task.time || !canNotify()) return;

  const [hours, minutes] = task.time.split(':').map(Number);
  const taskDate = new Date(task.date + 'T00:00:00');
  taskDate.setHours(hours, minutes, 0, 0);

  // Remind 15 minutes before
  const reminderTime = new Date(taskDate.getTime() - 15 * 60 * 1000);
  const now = new Date();

  if (reminderTime > now) {
    const delay = reminderTime - now;
    setTimeout(() => {
      notify(`تذكير: ${task.title}`, {
        body: `المهمة ستبدأ خلال 15 دقيقة (${task.time})`,
        tag: `task-${task.id}`,
        requireInteraction: true,
        data: { taskId: task.id }
      });
    }, delay);
  }
}

/**
 * Schedule all pending task reminders
 * @param {Task[]} tasks
 */
export function scheduleAllReminders(tasks) {
  if (!canNotify()) return;

  const pendingTasks = tasks.filter(t => !t.completed && t.time);
  pendingTasks.forEach(scheduleTaskReminder);
}

/**
 * Cancel a scheduled reminder
 * @param {string} taskId
 */
export function cancelReminder(taskId) {
  // In a real app with service workers, we'd use registration.getNotifications()
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then(registration => {
      registration.getNotifications({ tag: `task-${taskId}` }).then(notifications => {
        notifications.forEach(n => n.close());
      });
    });
  }
}

/**
 * Test notification
 */
export function testNotification() {
  notify('اختبار الإشعارات', {
    body: 'تم تفعيل الإشعارات بنجاح!',
    requireInteraction: false
  });
}

/**
 * Get notification status
 * @returns {Object}
 */
export function getNotificationStatus() {
  return {
    supported: 'Notification' in window,
    permission: Notification.permission || 'default',
    enabled: canNotify()
  };
}
