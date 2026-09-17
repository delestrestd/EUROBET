#!/usr/bin/env python3
"""Patch calendrier-addon.js to load gzipped fixtures from part0-3."""
from pathlib import Path

p = Path("calendrier-addon.js")
t = p.read_text(encoding="utf-8")
if "async function loadParts()" in t and "await loadParts()" in t:
    print("already patched")
    raise SystemExit(0)

needle = (
    "async function ensureData() {\n"
    "    if (calendrierData) return calendrierData;\n"
    "    try {\n"
    "      calendrierData = await loadGzipB64('./calendrier-data.gz.b64');\n"
    "    } catch (e) {\n"
    "      const j = await fetch('./calendrier-data.json', { cache: 'no-cache' });\n"
    "      if (!j.ok) throw e;\n"
    "      calendrierData = await j.json();\n"
    "    }\n"
    "    return calendrierData;\n"
    "  }"
)
insert = (
    "async function loadParts() {\n"
    "    const texts = await Promise.all([0, 1, 2, 3].map(async (i) => {\n"
    "      const r = await fetch('./calendrier-data.gz.b64.part' + i, { cache: 'no-cache' });\n"
    "      if (!r.ok) throw new Error('part' + i + ' HTTP ' + r.status);\n"
    "      return (await r.text()).trim();\n"
    "    }));\n"
    "    const b64 = texts.join('');\n"
    "    const bin = atob(b64);\n"
    "    const bytes = new Uint8Array(bin.length);\n"
    "    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);\n"
    "    if (typeof DecompressionStream === 'undefined') throw new Error('DecompressionStream indisponible');\n"
    "    const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));\n"
    "    return JSON.parse(await new Response(stream).text());\n"
    "  }\n"
    "\n"
    "  async function ensureData() {\n"
    "    if (calendrierData) return calendrierData;\n"
    "    try {\n"
    "      calendrierData = await loadParts();\n"
    "    } catch (e1) {\n"
    "      try {\n"
    "        calendrierData = await loadGzipB64('./calendrier-data.gz.b64');\n"
    "      } catch (e) {\n"
    "        const j = await fetch('./calendrier-data.json', { cache: 'no-cache' });\n"
    "        if (!j.ok) throw e1;\n"
    "        calendrierData = await j.json();\n"
    "      }\n"
    "    }\n"
    "    return calendrierData;\n"
    "  }"
)
if needle not in t:
    raise SystemExit("needle not found in calendrier-addon.js")
p.write_text(t.replace(needle, insert, 1), encoding="utf-8")
assert "await loadParts()" in p.read_text(encoding="utf-8")
print("patched ok", p.stat().st_size)
