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
    .cal-row.cup{border-color:rgba(168,85,247,.55)!important;background:linear-gradient(135deg,rgba(168,85,247,.14),rgba(59,130,246,.08))!important;box-shadow:inset 3px 0 0 #a855f7!important}
    .cal-row.cup.c1{border-color:rgba(234,179,8,.75)!important;background:linear-gradient(135deg,rgba(234,179,8,.22),rgba(168,85,247,.08))!important;box-shadow:inset 4px 0 0 #eab308!important}
    .cal-row.cup.c3{border-color:rgba(59,130,246,.75)!important;background:linear-gradient(135deg,rgba(59,130,246,.22),rgba(14,165,233,.08))!important;box-shadow:inset 4px 0 0 #3b82f6!important}
    .cal-row.cup.c4{border-color:rgba(16,185,129,.75)!important;background:linear-gradient(135deg,rgba(16,185,129,.22),rgba(52,211,153,.08))!important;box-shadow:inset 4px 0 0 #10b981!important}
    .cal-row.cup:hover{border-color:#c084fc!important}
    .cal-row.cup.c1:hover{border-color:#facc15!important}
    .cal-row.cup.c3:hover{border-color:#60a5fa!important}
    .cal-row.cup.c4:hover{border-color:#34d399!important}
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
