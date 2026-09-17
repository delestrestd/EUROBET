from pathlib import Path

def patch(html: str) -> str:
    if 'data-tab="calendriers"' not in html:
        needle = (
            '      <button class="tab" data-tab="standings"><span class="tab-full">Classement</span>'
            '<span class="tab-short">📊</span><span class="tab-cap">Class.</span></button>\n'
            '      <button class="tab" data-tab="stats"><span class="tab-full">Historique</span>'
            '<span class="tab-short">📜</span><span class="tab-cap">Histo</span></button>'
        )
        repl = (
            '      <button class="tab" data-tab="standings"><span class="tab-full">Classement</span>'
            '<span class="tab-short">📊</span><span class="tab-cap">Class.</span></button>\n'
            '      <button class="tab" data-tab="calendriers"><span class="tab-full">Calendriers</span>'
            '<span class="tab-short">📅</span><span class="tab-cap">Cal.</span></button>\n'
            '      <button class="tab" data-tab="stats"><span class="tab-full">Historique</span>'
            '<span class="tab-short">📜</span><span class="tab-cap">Histo</span></button>'
        )
        if needle not in html:
            raise SystemExit('tabs needle not found')
        html = html.replace(needle, repl, 1)

    if "window.currentTab = 'matches'" not in html:
        html = html.replace(
            "let currentTab = 'matches';",
            "window.currentTab = 'matches'; let currentTab = window.currentTab;",
            1,
        )

    old_tab = (
        "        currentTab = t.dataset.tab;\n"
        "        if (currentTab === 'odds') oddsFilter.league = currentLeague;\n"
        "        loadData();"
    )
    new_tab = (
        "        currentTab = t.dataset.tab; window.currentTab = currentTab;\n"
        "        if (currentTab === 'odds') oddsFilter.league = currentLeague;\n"
        "        if (currentTab === 'calendriers') { window.__renderCalendriers && window.__renderCalendriers(); return; }\n"
        "        loadData();"
    )
    if old_tab in html:
        html = html.replace(old_tab, new_tab, 1)

    html = html.replace(
        "        currentTab = 'odds';\n        oddsFilter.league = 'all';\n        loadData();",
        "        currentTab = 'odds'; window.currentTab = currentTab;\n        oddsFilter.league = 'all';\n        loadData();",
        1,
    )
    html = html.replace(
        "      currentTab = 'stats';",
        "      currentTab = 'stats'; window.currentTab = currentTab;",
    )

    old_load = "    async function loadData(silent = false) {\n      if (!silent) {"
    new_load = (
        "    async function loadData(silent = false) {\n"
        "      if (currentTab === 'calendriers') {\n"
        "        if (window.__renderCalendriers) { window.__renderCalendriers(); return; }\n"
        "      }\n"
        "      if (!silent) {"
    )
    if "if (currentTab === 'calendriers')" not in html.split("async function loadData")[1][:200]:
        if old_load in html:
            html = html.replace(old_load, new_load, 1)

    html = html.replace(
        "const TAB_ORDER = ['matches', 'odds', 'standings', 'stats'];",
        "const TAB_ORDER = ['matches', 'odds', 'standings', 'calendriers', 'stats'];",
        1,
    )

    if 'window.loadData = loadData' not in html:
        html = html.replace(
            "    // PWA : enregistrement service worker",
            "    window.loadData = loadData;\n    window.contentEl = contentEl;\n    // PWA : enregistrement service worker",
            1,
        )

    if 'calendrier-addon.js' not in html:
        html = html.replace(
            '</body>',
            '  <script src="./calendrier-addon.js" defer></script>\n</body>',
            1,
        )
    return html

def main():
    for name in ['index.html', 'euro-football-live.html']:
        p = Path(name)
        old = p.read_text(encoding='utf-8')
        new = patch(old)
        if new != old:
            p.write_text(new, encoding='utf-8')
            print('patched', name, len(old), '->', len(new))
        else:
            print('unchanged', name)

if __name__ == '__main__':
    main()
