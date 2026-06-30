/**
 * Settings Page
 * @module pages/SettingsPage
 */

'use strict';

import { getSettings, saveSettings, backupToFile, restoreFromFile, clearAllData, getStorageInfo } from '../services/storage.js';
import { getTasks } from '../services/storage.js';
import { requestPermission, testNotification, getNotificationStatus } from '../services/notifications.js';
import { exportToJSON, readJSONFile, showToast } from '../utils/helpers.js';

/**
 * Render settings page
 * @returns {HTMLElement}
 */
export function renderSettingsPage() {
  const container = document.createElement('div');
  container.className = 'page';
  container.id = 'settings';

  const settings = getSettings();
  const tasks = getTasks();
  const storageInfo = getStorageInfo();
  const notifStatus = getNotificationStatus();

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
    <div style="display:flex;align-items:center;gap:12px">
      <img src="src/assets/icons/icon-72x72.png" width="48" height="48" style="border-radius:12px">
      <div>
        <h1 style="font-size:20px;font-weight:700">ToDo 0x58</h1>
        <span style="font-size:12px;color:var(--text-secondary)">v1.0.0</span>
      </div>
    </div>
  `;
  container.appendChild(header);

  // Settings sections
  const sections = document.createElement('div');
  sections.style.cssText = 'padding: 0 20px 100px;';

  // Notifications section
  sections.appendChild(createSectionTitle('الإشعارات'));
  sections.appendChild(createToggleItem('تفعيل الإشعارات', 'notifications', settings.notifications, async (checked) => {
    if (checked) {
      const permission = await requestPermission();
      if (permission !== 'granted') {
        showToast('يرجى السماح بالإشعارات من إعدادات المتصفح', 'error');
        return false;
      }
      testNotification();
    }
    settings.notifications = checked;
    saveSettings(settings);
    return true;
  }));

  sections.appendChild(createToggleItem('صوت الإشعارات', 'sound', settings.sound, (checked) => {
    settings.sound = checked;
    saveSettings(settings);
  }));

  sections.appendChild(createToggleItem('اهتزاز', 'haptic', settings.haptic, (checked) => {
    settings.haptic = checked;
    saveSettings(settings);
  }));

  // Data section
  sections.appendChild(createSectionTitle('البيانات'));

  // Storage info
  const storageCard = document.createElement('div');
  storageCard.style.cssText = `
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 16px;
    margin-bottom: 12px;
  `;
  storageCard.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
      <span style="font-size:13px;color:var(--text-secondary)">مساحة التخزين</span>
      <span style="font-size:13px;font-weight:600">${storageInfo.formatted}</span>
    </div>
    <div class="progress-bar">
      <div class="progress-fill" style="width:${storageInfo.percentage}%"></div>
    </div>
    <div style="display:flex;justify-content:space-between;margin-top:8px;font-size:12px;color:var(--text-secondary)">
      <span>${tasks.length} مهمة</span>
      <span>${storageInfo.percentage}% مستخدم</span>
    </div>
  `;
  sections.appendChild(storageCard);

  // Export button
  sections.appendChild(createButtonItem('تصدير البيانات', 'download', () => {
    const data = { tasks, settings, exportedAt: new Date().toISOString() };
    exportToJSON(data, `todo-0x58-export-${new Date().toISOString().split('T')[0]}.json`);
    showToast('تم تصدير البيانات', 'success');
  }));

  // Import button
  const importWrapper = document.createElement('div');
  importWrapper.style.cssText = 'margin-bottom: 12px;';
  const importInput = document.createElement('input');
  importInput.type = 'file';
  importInput.accept = '.json';
  importInput.style.display = 'none';
  importInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      await restoreFromFile(file);
      showToast('تم استيراد البيانات بنجاح', 'success');
      setTimeout(() => window.location.reload(), 1000);
    } catch (err) {
      showToast(err.message, 'error');
    }
  });
  importWrapper.appendChild(importInput);

  const importBtn = createButtonItem('استيراد البيانات', 'upload', () => importInput.click());
  importWrapper.appendChild(importBtn);
  sections.appendChild(importWrapper);

  // Danger zone
  sections.appendChild(createSectionTitle('منطقة الخطر'));
  sections.appendChild(createDangerButton('حذف جميع البيانات', 'trash-2', async () => {
    if (confirm('هل أنت متأكد من حذف جميع البيانات؟ لا يمكن التراجع عن هذا الإجراء.')) {
      clearAllData();
      showToast('تم حذف جميع البيانات', 'success');
      setTimeout(() => window.location.reload(), 500);
    }
  }));

  // About section
  sections.appendChild(createSectionTitle('عن التطبيق'));
  const aboutCard = document.createElement('div');
  aboutCard.style.cssText = `
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 20px;
    text-align: center;
  `;
  aboutCard.innerHTML = `
    <img src="src/assets/icons/icon-128x128.png" width="64" height="64" style="border-radius:16px;margin-bottom:12px">
    <h3 style="font-size:16px;font-weight:700;margin-bottom:4px">ToDo 0x58</h3>
    <p style="font-size:13px;color:var(--text-secondary);margin-bottom:16px">تطبيق مهام بسيط وسريع وأنيق</p>
    <div style="display:flex;justify-content:center;gap:16px;font-size:12px;color:var(--text-secondary)">
      <span>v1.0.0</span>
      <span>•</span>
      <span>PWA</span>
      <span>•</span>
      <span>بدون إنترنت</span>
    </div>
  `;
  sections.appendChild(aboutCard);

  // Keyboard shortcuts
  if (!/Android|webOS|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
    sections.appendChild(createSectionTitle('اختصارات لوحة المفاتيح'));
    const shortcutsCard = document.createElement('div');
    shortcutsCard.style.cssText = `
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 16px;
    `;
    shortcutsCard.innerHTML = `
      <div style="display:grid;grid-template-columns:1fr auto;gap:12px;font-size:13px">
        <span style="color:var(--text-secondary)">مهمة جديدة</span>
        <span><span class="kbd">Ctrl</span> + <span class="kbd">N</span></span>
        <span style="color:var(--text-secondary)">البحث</span>
        <span><span class="kbd">Ctrl</span> + <span class="kbd">F</span></span>
        <span style="color:var(--text-secondary)">الرئيسية</span>
        <span><span class="kbd">1</span></span>
        <span style="color:var(--text-secondary)">المهام</span>
        <span><span class="kbd">2</span></span>
        <span style="color:var(--text-secondary)">التقويم</span>
        <span><span class="kbd">3</span></span>
        <span style="color:var(--text-secondary)">الإحصائيات</span>
        <span><span class="kbd">4</span></span>
        <span style="color:var(--text-secondary)">الإعدادات</span>
        <span><span class="kbd">5</span></span>
      </div>
    `;
    sections.appendChild(shortcutsCard);
  }

  container.appendChild(sections);

  return container;
}

/**
 * Create section title
 * @param {string} title
 * @returns {HTMLElement}
 */
function createSectionTitle(title) {
  const el = document.createElement('h2');
  el.textContent = title;
  el.style.cssText = `
    font-size: 14px;
    font-weight: 600;
    color: var(--text-secondary);
    margin: 24px 0 12px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  `;
  return el;
}

/**
 * Create toggle item
 * @param {string} label
 * @param {string} id
 * @param {boolean} checked
 * @param {Function} onChange
 * @returns {HTMLElement}
 */
function createToggleItem(label, id, checked, onChange) {
  const item = document.createElement('div');
  item.style.cssText = `
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 16px;
    margin-bottom: 12px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  `;

  const toggleId = `toggle-${id}`;

  item.innerHTML = `
    <span style="font-size:14px;font-weight:500">${label}</span>
    <label style="position:relative;display:inline-block;width:48px;height:28px;cursor:pointer">
      <input type="checkbox" id="${toggleId}" ${checked ? 'checked' : ''} style="opacity:0;width:0;height:0">
      <span style="
        position:absolute;
        cursor:pointer;
        inset:0;
        background:${checked ? 'var(--primary)' : 'rgba(255,255,255,0.1)'};
        border-radius:28px;
        transition:0.3s;
      ">
        <span style="
          position:absolute;
          content:'';
          height:22px;
          width:22px;
          left:3px;
          bottom:3px;
          background:white;
          border-radius:50%;
          transition:0.3s;
          transform:${checked ? 'translateX(20px)' : 'translateX(0)'};
        "></span>
      </span>
    </label>
  `;

  const checkbox = item.querySelector(`#${toggleId}`);
  checkbox.addEventListener('change', async (e) => {
    const span = item.querySelector('span > span');
    const track = item.querySelector('span');

    const result = await onChange(e.target.checked);
    if (result === false) {
      e.target.checked = !e.target.checked;
      return;
    }

    if (e.target.checked) {
      track.style.background = 'var(--primary)';
      span.style.transform = 'translateX(20px)';
    } else {
      track.style.background = 'rgba(255,255,255,0.1)';
      span.style.transform = 'translateX(0)';
    }
  });

  return item;
}

/**
 * Create button item
 * @param {string} label
 * @param {string} icon
 * @param {Function} onClick
 * @returns {HTMLElement}
 */
function createButtonItem(label, icon, onClick) {
  const btn = document.createElement('button');
  btn.style.cssText = `
    width: 100%;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 16px;
    margin-bottom: 12px;
    display: flex;
    align-items: center;
    gap: 12px;
    color: var(--text-primary);
    font-family: inherit;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s ease;
    text-align: right;
  `;
  btn.innerHTML = `
    <i data-lucide="${icon}" style="width:20px;height:20px;color:var(--primary)"></i>
    <span style="flex:1">${label}</span>
    <i data-lucide="chevron-left" style="width:16px;height:16px;color:var(--text-secondary)"></i>
  `;
  btn.addEventListener('click', onClick);
  btn.addEventListener('mouseenter', () => btn.style.background = 'rgba(255,255,255,0.03)');
  btn.addEventListener('mouseleave', () => btn.style.background = 'var(--bg-card)');
  return btn;
}

/**
 * Create danger button
 * @param {string} label
 * @param {string} icon
 * @param {Function} onClick
 * @returns {HTMLElement}
 */
function createDangerButton(label, icon, onClick) {
  const btn = document.createElement('button');
  btn.style.cssText = `
    width: 100%;
    background: rgba(255, 61, 113, 0.05);
    border: 1px solid rgba(255, 61, 113, 0.2);
    border-radius: var(--radius);
    padding: 16px;
    margin-bottom: 12px;
    display: flex;
    align-items: center;
    gap: 12px;
    color: var(--danger);
    font-family: inherit;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s ease;
    text-align: right;
    font-weight: 600;
  `;
  btn.innerHTML = `
    <i data-lucide="${icon}" style="width:20px;height:20px"></i>
    <span style="flex:1">${label}</span>
  `;
  btn.addEventListener('click', onClick);
  return btn;
}
