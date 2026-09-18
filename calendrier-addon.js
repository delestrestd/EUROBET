/* EuroBet Live — Calendriers addon loader (gzip+b64 parts, v5 cups+aliases) */
(function () {
  async function boot() {
    const texts = await Promise.all([0, 1].map(async (i) => {
      const r = await fetch('./calendrier-addon.gz.b64.part' + i + '?v=5', { cache: 'no-cache' });
      if (!r.ok) throw new Error('addon part' + i + ' HTTP ' + r.status);
      return (await r.text()).trim();
    }));
    const b64 = texts.join('');
    const bin = atob(b64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    if (typeof DecompressionStream === 'undefined') throw new Error('DecompressionStream required');
    const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
    const code = await new Response(stream).text();
    (0, eval)(code);
  }
  boot().catch((e) => {
    console.error('[calendriers]', e);
    const el = window.contentEl || document.getElementById('content');
    if (el) el.innerHTML = '<div class="empty"><p>Erreur chargement calendriers: ' + String(e.message || e) + '</p></div>';
  });
})();
