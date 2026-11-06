/* Runs after the shop script, which has its own theme bootstrap. */
(() => {
  const apply = value => {
    const theme = value === 'dark' ? 'dark' : 'light';
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    const toggle = document.querySelector('#theme-toggle');
    if (toggle) toggle.checked = theme === 'dark';
  };
  try { apply(localStorage.getItem('pawlink-theme')); } catch (_) { apply('light'); }
  window.addEventListener('storage', event => { if (event.key === 'pawlink-theme') apply(event.newValue); });
})();
