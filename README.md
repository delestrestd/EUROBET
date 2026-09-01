# EuroBet Live

PWA scores, cotes, classements et indices de buts.

## Lien

https://delestrestd.github.io/EUROBET/

## Déploiement automatique

Chaque **push sur `main`** lance GitHub Actions → GitHub Pages.

1. Repo → **Settings** → **Pages**
2. Source : **GitHub Actions** (pas « Deploy from a branch »)
3. Envoie / commit `index.html` (et les icônes / manifest / sw.js)
4. Onglet **Actions** : workflow **Deploy GitHub Pages** doit passer au vert
5. Ouvre https://delestrestd.github.io/EUROBET/

Tu peux aussi lancer le déploiement à la main : Actions → Deploy GitHub Pages → **Run workflow**.

## Mise à jour de l’app

Remplace `index.html` (même contenu que `euro-football-live.html`) puis commit sur `main`.
