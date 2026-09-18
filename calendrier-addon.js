/* EuroBet Live — Calendriers addon loader (v5c cups+aliases, b64) */
(function () {
  async function boot() {
    const texts = await Promise.all([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(async (i) => {
      const r = await fetch("./calendrier-addon.b64.part" + i + "?v=5c", { cache: "no-cache" });
      if (!r.ok) throw new Error("b64 part" + i + " HTTP " + r.status);
      return (await r.text()).trim();
    }));
    const js = atob(texts.join(""));
    (0, eval)(js);
  }
  boot().catch((e) => {
    console.error("[calendriers]", e);
    const el = window.contentEl || document.getElementById("content");
    if (el) el.innerHTML = "<div class=\"empty\"><p>Erreur calendriers: " + String(e.message || e) + "</p></div>";
  });
})();
