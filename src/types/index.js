/**
 * @typedef {Object} Task
 * @property {string} id
 * @property {string} title
 * @property {string} description
 * @property {string} date - YYYY-MM-DD
 * @property {string} time - HH:MM
 * @property {'urgent'|'high'|'medium'|'low'} priority
 * @property {string} tag
 * @property {boolean} completed
 * @property {string} createdAt - ISO string
 */

/**
 * @typedef {Object} FilterType
 * @property {string} id
 * @property {string} label
 * @property {Function} predicate
 */

/**
 * @typedef {Object} StatsData
 * @property {number} total
 * @property {number} completed
 * @property {number} pending
 * @property {number} completionRate
 * @property {Object} byPriority
 * @property {Object} byTag
 * @property {Object} byDay
 */

/**
 * @typedef {Object} CalendarDay
 * @property {number} day
 * @property {boolean} isCurrentMonth
 * @property {boolean} isToday
 * @property {boolean} hasTasks
 * @property {number} taskCount
 */

/**
 * @typedef {Object} AppState
 * @property {Task[]} tasks
 * @property {string} currentPage
 * @property {string} currentFilter
 * @property {string} searchQuery
 * @property {string} selectedDate
 * @property {string[]} tags
 * @property {boolean} isLoading
 * @property {boolean} isModalOpen
 */

export const PRIORITIES = {
  urgent: { label: 'عاجلة', color: '#FF3D71', emoji: '🔴' },
  high: { label: 'عالية', color: '#FF9800', emoji: '🟠' },
  medium: { label: 'متوسطة', color: '#FFC107', emoji: '🟡' },
  low: { label: 'منخفضة', color: '#00E676', emoji: '🟢' }
};

export const DEFAULT_TAGS = [
  'العيادة',
  'كاميرات_المراقبة',
  'نظام_التأجير',
  'لينكس',
  'شخصي'
];

export const FILTERS = [
  { id: 'all', label: 'جميع المهام' },
  { id: 'today', label: 'مهام اليوم' },
  { id: 'week', label: 'هذا الأسبوع' },
  { id: 'month', label: 'هذا الشهر' },
  { id: 'completed', label: 'المنجزة' },
  { id: 'pending', label: 'غير المنجزة' }
];

export const PAGES = {
  home: 'home',
  tasks: 'tasks',
  calendar: 'calendar',
  stats: 'stats',
  settings: 'settings'
};
