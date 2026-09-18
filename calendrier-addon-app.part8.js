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
      el.innerHTML = `<div class="empty"><div 
class="empty-icon">⚠️</div><p>${esc(err.message)}</p></div>`;
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
