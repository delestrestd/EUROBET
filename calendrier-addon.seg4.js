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
