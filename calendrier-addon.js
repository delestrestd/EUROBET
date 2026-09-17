/* EuroBet Live — Calendriers addon (fixtures 2026/27) */
(function () {
  const CSS = `
    .cal-filters{display:grid;grid-template-columns:1fr 1fr;gap:.65rem;margin-bottom:1rem;padding:.9rem;background:var(--bg-card);border:1px solid var(--border);border-radius:12px}
    .cal-filters .cal-field{display:flex;flex-direction:column;gap:.3rem}
    .cal-filters .cal-field.full{grid-column:1/-1}
    .cal-filters label{font-size:.7rem;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--text-muted)}
    .cal-filters input,.cal-filters select{background:var(--bg);border:1px solid var(--border);color:var(--text);border-radius:8px;padding:.55rem .7rem;font-size:.9rem;width:100%}
    .cal-filters input:focus,.cal-filters select:focus{outline:none;border-color:#ffdd00}
    .cal-count{font-size:.85rem;color:var(--text-muted);margin:0 0 .85rem;font-weight:600}
    .cal-list{display:flex;flex-direction:column;gap:.55rem}
    .cal-row{display:grid;grid-template-columns:auto 1fr auto;gap:.75rem;align-items:center;padding:.75rem .9rem;background:var(--bg-card);border:1px solid var(--border);border-radius:10px}
    .cal-row:hover{border-color:#2a3644}
    .cal-when{text-align:center;min-width:4.2rem}
    .cal-date{font-size:.78rem;font-weight:700;color:var(--text)}
    .cal-time{font-size:.85rem;color:#ffdd00;font-weight:700}
    .cal-teams{font-size:.95rem;font-weight:700;line-height:1.35}
    .cal-meta{font-size:.75rem;color:var(--text-muted);margin-top:.25rem}
    .cal-st{font-size:.68rem;font-weight:800;text-transform:uppercase;letter-spacing:.04em;padding:.28rem .5rem;border-radius:6px;white-space:nowrap}
    .cal-st.prog{background:rgba(255,221,0,.15);color:#ffdd00}
    .cal-st.joue{background:rgba(80,200,120,.15);color:#50c878}
    @media (max-width:640px){.cal-filters{grid-template-columns:1fr}.cal-row{grid-template-columns:auto 1fr}.cal-st{grid-column:2;justify-self:start;margin-top:-.25rem}}
  `;

  let calendrierData = null;
  let calFilter = { q: '', league: '', statut: '', from: '', to: '' };

  function foldAccents(s) {
    return String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  }

  function ensureCss() {
    if (document.getElementById('cal-addon-css')) return;
    const style = document.createElement('style');
    style.id = 'cal-addon-css';
    style.textContent = CSS;
    document.head.appendChild(style);
  }

  async function loadGzipB64(url) {
    const res = await fetch(url, { cache: 'no-cache' });
    if (!res.ok) throw new Error('Impossible de charger ' + url);
    const b64 = (await res.text()).trim();
    const bin = atob(b64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    if (typeof DecompressionStream === 'undefined') {
      const j = await fetch('./calendrier-data.json', { cache: 'no-cache' });
      if (!j.ok) throw new Error('DecompressionStream indisponible et pas de JSON');
      return j.json();
    }
    const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
    const text = await new Response(stream).text();
    return JSON.parse(text);
  }

  async function loadParts() {
    const texts = await Promise.all([0, 1, 2, 3].map(async (i) => {
      const r = await fetch('./calendrier-data.gz.b64.part' + i, { cache: 'no-cache' });
      if (!r.ok) throw new Error('part' + i + ' HTTP ' + r.status);
      return (await r.text()).trim();
    }));
    const b64 = texts.join('');
    const bin = atob(b64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    if (typeof DecompressionStream === 'undefined') throw new Error('DecompressionStream indisponible');
    const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
    return JSON.parse(await new Response(stream).text());
  }

  async function ensureData() {
    if (calendrierData) return calendrierData;
    try {
      calendrierData = await loadParts();
    } catch (e1) {
      try {
        calendrierData = await loadGzipB64('./calendrier-data.gz.b64');
      } catch (e) {
        const j = await fetch('./calendrier-data.json', { cache: 'no-cache' });
        if (!j.ok) throw e1;
        calendrierData = await j.json();
      }
    }
    return calendrierData;
  }

  function getFiltered() {
    const q = foldAccents(calFilter.q.trim());
    return (calendrierData || []).filter((m) => {
      if (calFilter.league && m.l !== calFilter.league) return false;
      if (calFilter.statut && m.st !== calFilter.statut) return false;
      if (calFilter.from && m.d < calFilter.from) return false;
      if (calFilter.to && m.d > calFilter.to) return false;
      if (q) {
        const hay = foldAccents((m.home || '') + ' ' + (m.away || ''));
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }

  function esc(s) {
    return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
  }

  function bindFilters() {
    const qEl = document.getElementById('calQ');
    const lEl = document.getElementById('calLeague');
    const sEl = document.getElementById('calStatut');
    const fEl = document.getElementById('calFrom');
    const tEl = document.getElementById('calTo');
    const apply = () => {
      calFilter.q = qEl ? qEl.value : '';
      calFilter.league = lEl ? lEl.value : '';
      calFilter.statut = sEl ? sEl.value : '';
      calFilter.from = fEl ? fEl.value : '';
      calFilter.to = tEl ? tEl.value : '';
      render();
    };
    if (qEl) qEl.oninput = apply;
    if (lEl) lEl.onchange = apply;
    if (sEl) sEl.onchange = apply;
    if (fEl) fEl.onchange = apply;
    if (tEl) tEl.onchange = apply;
  }

  async function render() {
    ensureCss();
    const el = window.contentEl || document.getElementById('content');
    if (!el) return;
    el.innerHTML = '<div class="loader"><div class="spinner"></div></div>';
    try {
      await ensureData();
    } catch (err) {
      el.innerHTML = `<div class="empty"><div class="empty-icon">⚠️</div><p>${esc(err.message)}</p></div>`;
      return;
    }
    const leagues = [...new Set(calendrierData.map((m) => m.l).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'fr'));
    const filtered = getFiltered();
    const MAX = 250;
    const shown = filtered.slice(0, MAX);
    const leagueOpts = ['<option value="">Tous les championnats</option>']
      .concat(leagues.map((l) => `<option value="${esc(l)}" ${calFilter.league === l ? 'selected' : ''}>${esc(l)}</option>`))
      .join('');
    const rowsHtml = shown.length
      ? shown.map((m) => {
          const stClass = m.st === 'joué' ? 'joue' : 'prog';
          const md = m.md ? ` · J${esc(m.md)}` : '';
          return `<div class="cal-row">
            <div class="cal-when"><div class="cal-date">${esc(m.d) || '—'}</div><div class="cal-time">${esc(m.h)}</div></div>
            <div>
              <div class="cal-teams">${esc(m.home) || '?'} <span style="color:var(--text-muted);font-weight:600">vs</span> ${esc(m.away) || '?'}</div>
              <div class="cal-meta">${esc(m.l)}${md}</div>
            </div>
            <span class="cal-st ${stClass}">${esc(m.st)}</span>
          </div>`;
        }).join('')
      : `<div class="empty"><div class="empty-icon">📭</div><p>Aucun match pour ces filtres.</p></div>`;

    el.innerHTML = `
      <div class="cal-filters">
        <div class="cal-field full">
          <label for="calQ">Équipe (domicile ou extérieur)</label>
          <input id="calQ" type="search" placeholder="Ex. Paris, Bayern, Celtic…" value="${esc(calFilter.q)}">
        </div>
        <div class="cal-field">
          <label for="calLeague">Championnat</label>
          <select id="calLeague">${leagueOpts}</select>
        </div>
        <div class="cal-field">
          <label for="calStatut">Statut</label>
          <select id="calStatut">
            <option value="" ${!calFilter.statut ? 'selected' : ''}>Tous</option>
            <option value="programmé" ${calFilter.statut === 'programmé' ? 'selected' : ''}>Programmé</option>
            <option value="joué" ${calFilter.statut === 'joué' ? 'selected' : ''}>Joué</option>
          </select>
        </div>
        <div class="cal-field">
          <label for="calFrom">Du</label>
          <input id="calFrom" type="date" value="${esc(calFilter.from)}">
        </div>
        <div class="cal-field">
          <label for="calTo">Au</label>
          <input id="calTo" type="date" value="${esc(calFilter.to)}">
        </div>
      </div>
      <p class="cal-count">${filtered.length} match${filtered.length > 1 ? 's' : ''}${filtered.length > MAX ? ` (affichage des ${MAX} premiers)` : ''} · saison 2026/27</p>
      <div class="cal-list">${rowsHtml}</div>`;
    bindFilters();
    const last = document.getElementById('lastUpdate');
    if (last) last.textContent = `Calendriers · ${filtered.length} résultats`;
  }

  window.__renderCalendriers = render;
})();
