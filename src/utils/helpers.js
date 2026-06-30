/**
 * Utility Functions
 * @module utils/helpers
 */

'use strict';

/**
 * Generate a unique ID
 * @returns {string}
 */
export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

/**
 * Format date to Arabic display string
 * @param {string} dateStr - YYYY-MM-DD
 * @returns {string}
 */
export function formatDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr + 'T00:00:00');
  const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };
  return date.toLocaleDateString('ar-SA', options);
}

/**
 * Format time to 12-hour Arabic format
 * @param {string} timeStr - HH:MM
 * @returns {string}
 */
export function formatTime(timeStr) {
  if (!timeStr) return '';
  const [hours, minutes] = timeStr.split(':').map(Number);
  const period = hours >= 12 ? 'م' : 'ص';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
}

/**
 * Get today's date as YYYY-MM-DD
 * @returns {string}
 */
export function getToday() {
  return new Date().toISOString().split('T')[0];
}

/**
 * Check if a date is today
 * @param {string} dateStr
 * @returns {boolean}
 */
export function isToday(dateStr) {
  return dateStr === getToday();
}

/**
 * Check if a date is this week
 * @param {string} dateStr
 * @returns {boolean}
 */
export function isThisWeek(dateStr) {
  const date = new Date(dateStr + 'T00:00:00');
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);
  return date >= startOfWeek && date <= endOfWeek;
}

/**
 * Check if a date is this month
 * @param {string} dateStr
 * @returns {boolean}
 */
export function isThisMonth(dateStr) {
  const date = new Date(dateStr + 'T00:00:00');
  const today = new Date();
  return date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
}

/**
 * Get month name in Arabic
 * @param {number} monthIndex - 0-11
 * @returns {string}
 */
export function getMonthName(monthIndex) {
  const months = [
    'يناير', 'فبراير', 'مارس', 'إبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
  ];
  return months[monthIndex];
}

/**
 * Get day name in Arabic
 * @param {number} dayIndex - 0-6
 * @returns {string}
 */
export function getDayName(dayIndex) {
  const days = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
  return days[dayIndex];
}

/**
 * Get short day name in Arabic
 * @param {number} dayIndex
 * @returns {string}
 */
export function getShortDayName(dayIndex) {
  const days = ['أحد', 'إثن', 'ثل', 'أرب', 'خم', 'جم', 'سب'];
  return days[dayIndex];
}

/**
 * Get days in month
 * @param {number} year
 * @param {number} month - 0-11
 * @returns {number}
 */
export function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

/**
 * Get first day of month
 * @param {number} year
 * @param {number} month - 0-11
 * @returns {number} - 0=Sunday
 */
export function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay();
}

/**
 * Debounce function
 * @param {Function} func
 * @param {number} wait
 * @returns {Function}
 */
export function debounce(func, wait = 300) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Create ripple effect
 * @param {Event} event
 * @param {HTMLElement} element
 */
export function createRipple(event, element) {
  const ripple = document.createElement('span');
  ripple.classList.add('ripple');

  const rect = element.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  const x = event.clientX - rect.left - size / 2;
  const y = event.clientY - rect.top - size / 2;

  ripple.style.width = ripple.style.height = size + 'px';
  ripple.style.left = x + 'px';
  ripple.style.top = y + 'px';

  element.appendChild(ripple);

  setTimeout(() => ripple.remove(), 600);
}

/**
 * Show toast notification
 * @param {string} message
 * @param {string} type - 'success' | 'error' | 'info'
 */
export function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  toast.textContent = message;

  const colors = {
    success: '#00E676',
    error: '#FF3D71',
    info: '#FF9800'
  };

  toast.style.borderColor = colors[type] || colors.success;
  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

/**
 * Animate element with CSS
 * @param {HTMLElement} element
 * @param {string} animationClass
 * @param {number} duration
 */
export function animateElement(element, animationClass, duration = 300) {
  element.classList.add(animationClass);
  setTimeout(() => element.classList.remove(animationClass), duration);
}

/**
 * Export data as JSON file
 * @param {Object} data
 * @param {string} filename
 */
export function exportToJSON(data, filename = 'todo-0x58-backup.json') {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Read JSON file
 * @param {File} file
 * @returns {Promise<Object>}
 */
export function readJSONFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        resolve(JSON.parse(e.target.result));
      } catch (err) {
        reject(new Error('ملف غير صالح'));
      }
    };
    reader.onerror = () => reject(new Error('فشل قراءة الملف'));
    reader.readAsText(file);
  });
}

/**
 * Confetti effect
 */
export function triggerConfetti() {
  const colors = ['#00E676', '#FF3D71', '#FF9800', '#4CAF50', '#00BCD4'];
  for (let i = 0; i < 50; i++) {
    const confetti = document.createElement('div');
    confetti.classList.add('confetti');
    confetti.style.left = Math.random() * 100 + 'vw';
    confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    confetti.style.animation = `confetti-fall ${Math.random() * 2 + 1}s linear forwards`;
    confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
    confetti.style.width = Math.random() * 10 + 5 + 'px';
    confetti.style.height = Math.random() * 10 + 5 + 'px';
    document.body.appendChild(confetti);
    setTimeout(() => confetti.remove(), 3000);
  }
}

/**
 * Format relative time
 * @param {string} dateStr
 * @returns {string}
 */
export function getRelativeTime(dateStr) {
  const date = new Date(dateStr + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffTime = date - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'اليوم';
  if (diffDays === 1) return 'غداً';
  if (diffDays === -1) return 'أمس';
  if (diffDays > 1 && diffDays <= 7) return `بعد ${diffDays} أيام`;
  if (diffDays < -1 && diffDays >= -7) return `منذ ${Math.abs(diffDays)} أيام`;
  return formatDate(dateStr);
}

/**
 * Get greeting based on time
 * @returns {string}
 */
export function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'صباح الخير';
  if (hour < 17) return 'مساء الخير';
  return 'مساء النور';
}

/**
 * Copy text to clipboard
 * @param {string} text
 */
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    showToast('تم النسخ', 'success');
  } catch {
    showToast('فشل النسخ', 'error');
  }
}

/**
 * Check if device is mobile
 * @returns {boolean}
 */
export function isMobile() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

/**
 * Request notification permission
 * @returns {Promise<string>}
 */
export async function requestNotificationPermission() {
  if (!('Notification' in window)) return 'denied';
  return await Notification.requestPermission();
}

/**
 * Schedule a notification
 * @param {string} title
 * @param {string} body
 * @param {number} timestamp
 */
export function scheduleNotification(title, body, timestamp) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;

  const now = Date.now();
  const delay = timestamp - now;

  if (delay > 0) {
    setTimeout(() => {
      new Notification(title, {
        body,
        icon: 'src/assets/icons/icon-192x192.png',
        badge: 'src/assets/icons/icon-72x72.png',
        tag: 'task-reminder',
        requireInteraction: true
      });
    }, delay);
  }
}

/**
 * Get Hijri date
 * @returns {string}
 */
export function getHijriDate() {
  try {
    const date = new Date();
    const options = { 
      calendar: 'islamic-umalqura',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    return date.toLocaleDateString('ar-SA-u-ca-islamic-umalqura', options);
  } catch {
    return '';
  }
}
