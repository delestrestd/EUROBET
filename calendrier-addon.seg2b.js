      if (calFilter.from && m.d < calFilter.from) return false;
      if (calFilter.to && m.d > calFilter.to) return false;
      if (q && !matchQuery(m, q)) return false;
      return true;
    });
    out.sort((a, b) => {
      const dd = String(a.d || '').localeCompare(String(b.d || ''));
      if (dd) return dd;
      const ca = cupCode(a) ? 0 : 1;
      const cb = cupCode(b) ? 0 : 1;
      if (ca !== cb) return ca - cb;
      const hh = String(a.h || '').localeCompare(String(b.h || ''));
      if (hh) return hh;
      return String(a.l || '').localeCompare(String(b.l || ''), 'fr');
    });
    return out;
  }

  function esc(s) {
    return String(s || '').replace(/&/g, '&').replace(/</g, '<').replace(/"/g, '"');
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
