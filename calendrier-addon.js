/* EuroBet Live — Calendriers addon (fixtures 2026/27 + coupes UEFA) */
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
    .cal-row.cup{border-color:rgba(168,85,247,.55);background:linear-gradient(135deg,rgba(168,85,247,.14),rgba(59,130,246,.08));box-shadow:inset 3px 0 0 #a855f7}
    .cal-row.cup.c1{border-color:rgba(234,179,8,.65);background:linear-gradient(135deg,rgba(234,179,8,.16),rgba(168,85,247,.08));box-shadow:inset 3px 0 0 #eab308}
    .cal-row.cup.c3{border-color:rgba(59,130,246,.65);background:linear-gradient(135deg,rgba(59,130,246,.16),rgba(14,165,233,.08));box-shadow:inset 3px 0 0 #3b82f6}
    .cal-row.cup.c4{border-color:rgba(16,185,129,.65);background:linear-gradient(135deg,rgba(16,185,129,.16),rgba(52,211,153,.08));box-shadow:inset 3px 0 0 #10b981}
    .cal-row.cup:hover{border-color:#c084fc}
    .cal-when{text-align:center;min-width:4.2rem}
    .cal-date{font-size:.78rem;font-weight:700;color:var(--text)}
    .cal-time{font-size:.85rem;color:#ffdd00;font-weight:700}
    .cal-teams{font-size:.95rem;font-weight:700;line-height:1.35}
    .cal-meta{font-size:.75rem;color:var(--text-muted);margin-top:.25rem;display:flex;flex-wrap:wrap;gap:.35rem;align-items:center}
    .cal-badge{font-size:.65rem;font-weight:800;letter-spacing:.04em;text-transform:uppercase;padding:.18rem .45rem;border-radius:999px;white-space:nowrap}
    .cal-badge.c1{background:rgba(234,179,8,.22);color:#facc15}
    .cal-badge.c3{background:rgba(59,130,246,.22);color:#60a5fa}
    .cal-badge.c4{background:rgba(16,185,129,.22);color:#34d399}
    .cal-st{font-size:.68rem;font-weight:800;text-transform:uppercase;letter-spacing:.04em;padding:.28rem .5rem;border-radius:6px;white-space:nowrap}
    .cal-st.prog{background:rgba(255,221,0,.15);color:#ffdd00}
    .cal-st.joue{background:rgba(80,200,120,.15);color:#50c878}
    @media (max-width:640px){.cal-filters{grid-template-columns:1fr}.cal-row{grid-template-columns:auto 1fr}.cal-st{grid-column:2;justify-self:start;margin-top:-.25rem}}
  `;

  const MAX = 250;
  const Q_DEBOUNCE_MS = 280;
  const CUP_CODES = { C1: 'c1', C3: 'c3', C4: 'c4' };
  const CUP_BADGE = { C1: 'C1', C3: 'C3', C4: 'C4' };

  let calendrierData = null;
  let calFilter = { q: '', league: '', statut: '', from: '', to: '' };
  let qDebounceTimer = null;

  function foldAccents(s) {
    return String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  }

  function cupCode(m) {
    if (m && m.c && CUP_CODES[m.c]) return m.c;
    const l = (m && m.l) || '';
    if (l.indexOf('Ligue des champions') !== -1 || l.indexOf('C1') === 0) return 'C1';
    if (l.indexOf('Ligue Europa') !== -1 || l.indexOf('C3') === 0) return 'C3';
    if (l.indexOf('Ligue Conf') !== -1 || l.indexOf('C4') === 0) return 'C4';
    return '';
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
    const out = (calendrierData || []).filter((m) => {
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
    out.sort((a, b) => {
      const dd = String(a.d || '').localeCompare(String(b.d || ''));
      if (dd) return dd;
      const hh = String(a.h || '').localeCompare(String(b.h || ''));
      if (hh) return hh;
      return String(a.l || '').localeCompare(String(b.l || ''), 'fr');
    });
    return out;
  }

  function esc(s) {
    return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
  }

  function shellExists(el) {
    return !!(el && el.querySelector('#calQ') && el.querySelector('.cal-count') && el.querySelector('.cal-list'));
  }

  function readFiltersFromDom() {
    const qEl = document.getElementById('calQ');
    const lEl = document.getElementById('calLeague');
    const sEl = document.getElementById('calStatut');
    const fEl = document.getElementById('calFrom');
    const tEl = document.getElementById('calTo');
    calFilter.q = qEl ? qEl.value : '';
    calFilter.league = lEl ? lEl.value : '';
    calFilter.statut = sEl ? sEl.value : '';
    calFilter.from = fEl ? fEl.value : '';
    calFilter.to = tEl ? tEl.value : '';
  }

  function rowsHtml(shown) {
    if (!shown.length) {
      return `<div class="empty"><div class="empty-icon">📭</div><p>Aucun match pour ces filtres.</p></div>`;
    }
    return shown.map((m) => {
      const stClass = m.st === 'joué' ? 'joue' : 'prog';
      const code = cupCode(m);
      const cupCls = code ? (' cup ' + CUP_CODES[code]) : '';
      const badge = code
        ? `<span class="cal-badge ${CUP_CODES[code]}">${CUP_BADGE[code]}</span>`
        : '';
      const md = m.md ? ` · J${esc(m.md)}` : '';
      return `<div class="cal-row${cupCls}">
            <div class="cal-when"><div class="cal-date">${esc(m.d) || '—'}</div><div class="cal-time">${esc(m.h)}</div></div>
            <div>
              <div class="cal-teams">${esc(m.home) || '?'} <span style="color:var(--text-muted);font-weight:600">vs</span> ${esc(m.away) || '?'}</div>
              <div class="cal-meta">${badge}<span>${esc(m.l)}${md}</span></div>
            </div>
            <span class="cal-st ${stClass}">${esc(m.st)}</span>
          </div>`;
    }).join('');
  }

  function countText(filtered) {
    const cups = filtered.filter((m) => !!cupCode(m)).length;
    const cupNote = cups ? ` · dont ${cups} coupe${cups > 1 ? 's' : ''} UEFA` : '';
    return `${filtered.length} match${filtered.length > 1 ? 's' : ''}${filtered.length > MAX ? ` (affichage des ${MAX} premiers)` : ''}${cupNote} · saison 2026/27`;
  }

  function updateResults() {
    const el = window.contentEl || document.getElementById('content');
    if (!shellExists(el)) return;
    const countEl = el.querySelector('.cal-count');
    const listEl = el.querySelector('.cal-list');
    const filtered = getFiltered();
    const shown = filtered.slice(0, MAX);
    countEl.textContent = countText(filtered);
    listEl.innerHTML = rowsHtml(shown);
    const last = document.getElementById('lastUpdate');
    if (last) last.textContent = `Calendriers · ${filtered.length} résultats`;
  }

  function applyImmediate() {
    clearTimeout(qDebounceTimer);
    qDebounceTimer = null;
    readFiltersFromDom();
    updateResults();
  }

  function applySearchDebounced() {
    clearTimeout(qDebounceTimer);
    qDebounceTimer = setTimeout(() => {
      qDebounceTimer = null;
      readFiltersFromDom();
      updateResults();
    }, Q_DEBOUNCE_MS);
  }

  function bindFilters(el) {
    const qEl = el.querySelector('#calQ');
    const lEl = el.querySelector('#calLeague');
    const sEl = el.querySelector('#calStatut');
    const fEl = el.querySelector('#calFrom');
    const tEl = el.querySelector('#calTo');
    if (qEl) qEl.oninput = applySearchDebounced;
    if (lEl) lEl.onchange = applyImmediate;
    if (sEl) sEl.onchange = applyImmediate;
    if (fEl) fEl.onchange = applyImmediate;
    if (tEl) tEl.onchange = applyImmediate;
  }

  function leagueSortKey(l) {
    if (l.indexOf('C1') === 0 || l.indexOf('Ligue des champions') !== -1) return '0-' + l;
    if (l.indexOf('C3') === 0 || l.indexOf('Ligue Europa') !== -1) return '1-' + l;
    if (l.indexOf('C4') === 0 || l.indexOf('Ligue Conf') !== -1) return '2-' + l;
    return '9-' + l;
  }

  function buildShell(el) {
    const leagues = [...new Set(calendrierData.map((m) => m.l).filter(Boolean))]
      .sort((a, b) => leagueSortKey(a).localeCompare(leagueSortKey(b), 'fr'));
    const filtered = getFiltered();
    const shown = filtered.slice(0, MAX);
    const leagueOpts = ['<option value="">Tous les championnats</option>']
      .concat(leagues.map((l) => `<option value="${esc(l)}" ${calFilter.league === l ? 'selected' : ''}>${esc(l)}</option>`))
      .join('');

    el.innerHTML = `
      <div class="cal-filters">
        <div class="cal-field full">
          <label for="calQ">Équipe (domicile ou extérieur)</label>
          <input id="calQ" type="search" placeholder="Ex. Paris, Bayern, Celtic…" value="${esc(calFilter.q)}">
        </div>
        <div class="cal-field">
          <label for="calLeague">Championnat / Coupe</label>
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
      <p class="cal-count">${countText(filtered)}</p>
      <div class="cal-list">${rowsHtml(shown)}</div>`;
    bindFilters(el);
    const last = document.getElementById('lastUpdate');
    if (last) last.textContent = `Calendriers · ${filtered.length} résultats`;
  }

  async function render() {
    ensureCss();
    const el = window.contentEl || document.getElementById('content');
    if (!el) return;

    const hadShell = shellExists(el);
    if (!calendrierData && !hadShell) {
      el.innerHTML = '<div class="loader"><div class="spinner"></div></div>';
    }

    try {
      await ensureData();
    } catch (err) {
      el.innerHTML = `<div class="empty"><div class="empty-icon">⚠️</div><p>${esc(err.message)}</p></div>`;
      return;
    }

    if (shellExists(el)) {
      readFiltersFromDom();
      updateResults();
      return;
    }

    buildShell(el);
  }

  window.__renderCalendriers = render;
})();
