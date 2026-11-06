/* Settings page behavior: theme is handled by the shared PawLink script. */
(() => {
  const logout = document.querySelector('#logout-button');
  logout?.addEventListener('click', () => {
    try { localStorage.removeItem('pawlink-user'); } catch (_) {}
    window.location.href = 'index.html';
  });
})();
