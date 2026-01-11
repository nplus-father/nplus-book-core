const root = document.documentElement;
const themeKey = 'theme';

function switchTheme() {
    const current = root.getAttribute('data-theme') || 'light';
    const next = current === 'dark' ? 'light' : 'dark';

    root.setAttribute('data-theme', next);
    localStorage.setItem(themeKey, next);

    const menus = document.querySelectorAll('.book-menu, .book-menu-content');

    menus.forEach(menu => {
        const _ = menu.offsetHeight;
    });
}

(function() {
    const saved = localStorage.getItem(themeKey);
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const defaultTheme = saved ? saved : (systemDark ? 'dark' : 'light');

    root.setAttribute('data-theme', defaultTheme);
})();