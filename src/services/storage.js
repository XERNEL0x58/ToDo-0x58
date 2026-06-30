/**
 * Storage Service - LocalStorage Manager
 * @module services/storage
 */

'use strict';

const STORAGE_KEYS = {
  TASKS: 'todo58_tasks',
  TAGS: 'todo58_tags',
  SETTINGS: 'todo58_settings',
  LAST_SYNC: 'todo58_last_sync'
};

const DEFAULT_SETTINGS = {
  notifications: true,
  sound: false,
  haptic: true,
  autoSave: true,
  defaultPriority: 'medium',
  defaultTag: 'شخصي'
};

/**
 * Get tasks from storage
 * @returns {Task[]}
 */
export function getTasks() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.TASKS);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

/**
 * Save tasks to storage
 * @param {Task[]} tasks
 */
export function saveTasks(tasks) {
  try {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
    localStorage.setItem(STORAGE_KEYS.LAST_SYNC, Date.now().toString());
    return true;
  } catch {
    return false;
  }
}

/**
 * Get tags from storage
 * @returns {string[]}
 */
export function getTags() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.TAGS);
    const tags = data ? JSON.parse(data) : [];
    const defaultTags = ['العيادة', 'كاميرات_المراقبة', 'نظام_التأجير', 'لينكس', 'شخصي'];
    return [...new Set([...defaultTags, ...tags])];
  } catch {
    return ['العيادة', 'كاميرات_المراقبة', 'نظام_التأجير', 'لينكس', 'شخصي'];
  }
}

/**
 * Save tags to storage
 * @param {string[]} tags
 */
export function saveTags(tags) {
  try {
    localStorage.setItem(STORAGE_KEYS.TAGS, JSON.stringify(tags));
    return true;
  } catch {
    return false;
  }
}

/**
 * Add a new tag
 * @param {string} tag
 */
export function addTag(tag) {
  const tags = getTags();
  if (!tags.includes(tag)) {
    tags.push(tag);
    saveTags(tags);
  }
}

/**
 * Get settings
 * @returns {Object}
 */
export function getSettings() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

/**
 * Save settings
 * @param {Object} settings
 */
export function saveSettings(settings) {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    return true;
  } catch {
    return false;
  }
}

/**
 * Export all data
 * @returns {Object}
 */
export function exportData() {
  return {
    tasks: getTasks(),
    tags: getTags(),
    settings: getSettings(),
    exportedAt: new Date().toISOString(),
    version: '1.0.0'
  };
}

/**
 * Import data
 * @param {Object} data
 * @returns {boolean}
 */
export function importData(data) {
  try {
    if (data.tasks) saveTasks(data.tasks);
    if (data.tags) saveTags(data.tags);
    if (data.settings) saveSettings(data.settings);
    return true;
  } catch {
    return false;
  }
}

/**
 * Clear all data
 */
export function clearAllData() {
  Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
}

/**
 * Get storage usage info
 * @returns {Object}
 */
export function getStorageInfo() {
  let total = 0;
  let used = 0;

  for (let key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      used += localStorage[key].length * 2; // UTF-16
    }
  }

  // Estimate total (5MB typical)
  total = 5 * 1024 * 1024;

  return {
    used,
    total,
    percentage: Math.round((used / total) * 100),
    formatted: `${(used / 1024).toFixed(1)} KB / ${(total / 1024 / 1024).toFixed(0)} MB`
  };
}

/**
 * Backup to file
 */
export function backupToFile() {
  const data = exportData();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `todo-0x58-backup-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Restore from file
 * @param {File} file
 * @returns {Promise<boolean>}
 */
export function restoreFromFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (importData(data)) {
          resolve(true);
        } else {
          reject(new Error('فشل استيراد البيانات'));
        }
      } catch {
        reject(new Error('ملف غير صالح'));
      }
    };
    reader.onerror = () => reject(new Error('فشل قراءة الملف'));
    reader.readAsText(file);
  });
}
