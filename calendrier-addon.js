/* EuroBet Live — Calendriers addon loader (v6c3 search-fix+history + b64 repair) */
(function () {
  // Exact repairs for bytes still mangled on GitHub for long b64 data parts.
  const DATA_PATCHES = {
    9: (s) => { const a = s.split(""); a[1898] = "R"; return a.join(""); },
    10: (s) => { const a = s.split(""); a[406] = "P"; a[542] = "8"; return a.join(""); },
    18: (s) => { const a = s.split(""); a[1521] = "N"; a[1522] = "a"; a[1523] = "m"; return a.join(""); },
    20: (s) => { const a = s.split(""); a[429] = "6"; return a.join(""); },
    27: (s) => { const a = s.split(""); a[770] = "3"; return a.join(""); }
  };
  const _fetch = window.fetch.bind(window);
  window.fetch = async function (input, init) {
    const res = await _fetch(input, init);
    try {
      const url = typeof input === "string" ? input : (input && input.url) || "";
      const m = /calendrier-data\.gz\.b64\.part(\d+)/.exec(url);
      if (!m) return res;
      const patch = DATA_PATCHES[+m[1]];
      if (!patch || !res.ok) return res;
      const text = (await res.text()).replace(/\s+/g, "");
      return new Response(patch(text), { status: 200, headers: { "Content-Type": "text/plain; charset=utf-8" } });
    } catch (e) {
      return res;
    }
  };

  async function boot() {
    const texts = await Promise.all([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17].map(async (i) => {
      const r = await fetch("./calendrier-addon.b64.part" + i + "?v=6c3", { cache: "no-cache" });
      if (!r.ok) throw new Error("b64 part" + i + " HTTP " + r.status);
      return (await r.text()).replace(/\s+/g, "");
    }));
    (0, eval)(atob(texts.join("")));
  }
  boot().catch((e) => {
    console.error("[calendriers]", e);
    const el = window.contentEl || document.getElementById("content");
    if (el) el.innerHTML = "<div class=\"empty\"><p>Erreur calendriers: " + String(e.message || e) + "</p></div>";
  });
})();
