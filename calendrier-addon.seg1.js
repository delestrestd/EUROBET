    if (l.indexOf('Ligue Europa') !== -1 || l.indexOf('C3') === 0) return 'C3';
    if (l.indexOf('Ligue Conf') !== -1 || l.indexOf('C4') === 0) return 'C4';
    return '';
  }

  /* Domestic full names <-> UEFA short names <-> nicknames (accent-folded). */
  const ALIAS_GROUPS = [
    ['lyon', 'olympique lyonnais', 'ol lyon', 'ol'],
    ['marseille', 'olympique de marseille', 'om'],
    ['paris saint-germain', 'paris saint-germain fc', 'paris saint germain', 'psg', 'paris sg'],
    ['monaco', 'as monaco', 'as monaco fc'],
    ['lille', 'lille osc'],
    ['lens', 'racing club de lens', 'rc lens'],
    ['rennes', 'stade rennais', 'stade rennais fc 1901'],
    ['nice', 'ogc nice'],
    ['strasbourg', 'rc strasbourg', 'rc strasbourg alsace'],
    ['bayern', 'bayern munich', 'fc bayern munchen', 'bayern munchen', 'fc bayern'],
    ['real madrid', 'real madrid cf'],
    ['barcelona', 'fc barcelona', 'barca'],
    ['atletico madrid', 'atletico de madrid', 'club atletico de madrid', 'atleti'],
    ['inter milan', 'internazionale', 'fc internazionale milano'],
    ['milan', 'ac milan'],
    ['juventus', 'juventus fc', 'juve'],
    ['napoli', 'ssc napoli'],
    ['roma', 'as roma'],
    ['borussia dortmund', 'dortmund', 'bvb'],
    ['bayer leverkusen', 'leverkusen', 'bayer 04 leverkusen'],
    ['rb leipzig', 'leipzig'],
    ['manchester city', 'man city'],
    ['manchester united', 'man united', 'man utd'],
    ['liverpool', 'liverpool fc'],
    ['chelsea', 'chelsea fc'],
    ['arsenal', 'arsenal fc'],
    ['tottenham', 'tottenham hotspur', 'spurs'],
    ['newcastle', 'newcastle united'],
    ['aston villa', 'villa'],
    ['ajax', 'ajax amsterdam', 'afc ajax'],
    ['psv', 'psv eindhoven'],
    ['feyenoord', 'feyenoord rotterdam'],
    ['benfica', 'sl benfica'],
    ['porto', 'fc porto'],
    ['sporting', 'sporting cp', 'sporting lisbon'],
    ['celtic', 'celtic fc', 'glasgow celtic'],
    ['rangers', 'rangers fc', 'glasgow rangers'],
    ['galatasaray', 'galatasaray sk'],
    ['fenerbahce', 'fenerbahce sk'],
    ['club brugge', 'club brugge kv'],
    ['salzburg', 'rb salzburg', 'red bull salzburg'],
    ['shakhtar', 'shakhtar donetsk'],
    ['villarreal', 'villarreal cf'],
    ['real sociedad', 'real sociedad de futbol'],
    ['sevilla', 'sevilla fc'],
    ['athletic bilbao', 'athletic club'],
    ['crystal palace', 'palace'],
    ['brighton', 'brighton hove albion', 'brighton & hove albion'],
    ['bournemouth', 'afc bournemouth'],
    ['west ham', 'west ham united']
  ];

  function teamMatches(teamName, q) {
    if (!q) return true;
    const t = foldAccents(teamName);
    if (q.length >= 4 && t.includes(q)) return true;
    if (q.length < 4 && t === q) return true;
    for (let gi = 0; gi < ALIAS_GROUPS.length; gi++) {
      const g = ALIAS_GROUPS[gi];
      let qHits = false;
      for (let i = 0; i < g.length; i++) {
        const a = g[i];
        if (a === q) { qHits = true; break; }
        if (q.length >= 4 && a.length >= 4 && (a.includes(q) || q.includes(a))) { qHits = true; break; }
      }
      if (!qHits) continue;
      for (let i = 0; i < g.length; i++) {
        const a = g[i];
        if (a.length <= 3) {
          if (t === a) return true;
        } else if (t === a || t.includes(a) || a.includes(t)) {
          return true;
        }
      }
    }
    return false;
  }

  function matchQuery(m, q) {
    if (!q) return true;
    return teamMatches(m.home || '', q) || teamMatches(m.away || '', q);
  }


  function ensureCss() {
    let style = document.getElementById('cal-addon-css');
    if (!style) {
      style = document.createElement('style');
      style.id = 'cal-addon-css';
      document.head.appendChild(style);
    }
    style.textContent = CSS;
  }

  async function loadGzipB64(url) {
    const res = await fetch(url, { cache: 'no-cache' });
    if (!res.ok) throw new Error('Impossible de charger ' + url);
    const b64 = (await res.text()).trim();
    const bin = atob(b64);
