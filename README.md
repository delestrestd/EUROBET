# EuroBet Live

PWA scores, cotes, classements, indices de buts et **calendriers** des championnats européens 2026/27.

## Lien

https://delestrestd.github.io/EUROBET/

## Calendriers

Onglet **Calendriers** : recherche d’équipe, filtre championnat / statut / dates, données dans `calendrier-data.json` / `calendrier-data.gz.b64` (issu du CSV fixtures) via `calendrier-addon.js`.

## Déploiement automatique

Chaque **push sur `main`** lance GitHub Actions → GitHub Pages.

1. Repo → **Settings** → **Pages**
2. Source : **GitHub Actions** (pas « Deploy from a branch »)
3. Envoie / commit `index.html` (et les icônes / manifest / sw.js / calendrier-data.json)
4. Onglet **Actions** : workflow **Deploy GitHub Pages** doit passer au vert
5. Ouvre https://delestrestd.github.io/EUROBET/

Tu peux aussi lancer le déploiement à la main : Actions → Deploy GitHub Pages → **Run workflow**.
