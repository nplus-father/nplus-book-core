// static/js/theme-toggle.js
const root = document.documentElement;
const themeKey = 'theme'; // 統一 Key 名稱

function switchTheme() {
    const current = root.getAttribute('data-theme') || 'light'; // 使用 getAttribute 較穩健
    const next = current === 'dark' ? 'light' : 'dark';

    root.setAttribute('data-theme', next); // 同步更新 HTML tag
    localStorage.setItem(themeKey, next);
}

// 初始化
(function() {
    const saved = localStorage.getItem(themeKey);
    // 如果沒有存過，預設使用系統偏好，或者預設 light
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const defaultTheme = saved ? saved : (systemDark ? 'dark' : 'light');

    root.setAttribute('data-theme', defaultTheme);
})();