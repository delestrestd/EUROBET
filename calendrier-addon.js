/* EuroBet Live — Calendriers addon (fixtures 2026/27 + coupes UEFA) — TEMP PLACEHOLDER, next commit restores full file */
console.error('[calendriers] placeholder — full fix incoming');
window.__renderCalendriers = async function () {
  const el = window.contentEl || document.getElementById('content');
  if (el) el.innerHTML = '<div class="empty"><p>Mise à jour Calendriers en cours… rechargez dans quelques secondes.</p></div>';
};
