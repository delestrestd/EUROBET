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
