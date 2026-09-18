/* EuroBet Live — Calendriers addon loader (v5 cups+aliases, text segments) */
(function () {
  async function boot() {
    const texts = await Promise.all([0, 1, 2, 3, 4].map(async (i) => {
      const r = await fetch('./calendrier-addon.seg' + i + '.js?v=5', { cache: 'no-cache' });
      if (!r.ok) throw new Error('seg' + i + ' HTTP ' + r.status);
      return await r.text();
    }));
    (0, eval)(texts.join(''));
  }
  boot().catch((e) => {
    console.error('[calendriers]', e);
    const el = window.contentEl || document.getElementById('content');
    if (el) el.innerHTML = '<div class="empty"><p>Erreur calendriers: ' + String(e.message || e) + '</p></div>';
  });
})();
