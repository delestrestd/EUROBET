ry {
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
