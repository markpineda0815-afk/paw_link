/* Shared cross-page theme bootstrap, loaded before the app scripts. */
(() => {
  try {
    const theme = localStorage.getItem('pawlink-theme') === 'dark' ? 'dark' : 'light';
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
  } catch (_) {}
})();
