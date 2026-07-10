# ecranbc — Affichage dynamique bureau BC NORD

Tableau de bord web pour l'écran du bureau, compatible avec [Pro Display](https://tv-pro-display.adyn.cloud/) (adyn.cloud).

Affiche en temps réel :

- l'heure et la date
- la météo locale (via [Open-Meteo](https://open-meteo.com/), sans clé API)
- les anniversaires du jour et les prochains anniversaires (données issues du fichier Excel)

## Aperçu

```
┌─────────────────────┬──────────────────────────────┐
│  BC NORD            │  🎂 Anniversaire du jour     │
│  Heure / Date       │  Guillaume                   │
│  Météo Lille        ├──────────────────────────────┤
│                     │  Prochains anniversaires     │
└─────────────────────┴──────────────────────────────┘
```

## Structure du projet

```
display/          Page d'affichage (HTML/CSS/JS)
data/
  birthdays.json  Liste des anniversaires
  source/         Fichier Excel source
scripts/
  import_birthdays.py
```

## 1. Héberger la page (GitHub Pages)

1. Sur GitHub, ouvrez **Settings → Pages**
2. Source : branche `main`, dossier `/ (root)`
3. La page sera accessible à :

   **https://nico99209.github.io/ecranbc/display/**

> Le player Pro Display doit avoir accès à Internet pour charger la page et la météo.

Documentation interne Pro Display : [sites.google.com/view/affichage-dynamique](https://sites.google.com/view/affichage-dynamique)

## 1 bis. Intégrer sur Google Sites (aperçu web)

Le site [affichage-dynamique](https://sites.google.com/view/affichage-dynamique) sert de portail d'aide. Pour y ajouter un aperçu du tableau de bord :

1. Ouvrez le site en mode **Édition**
2. **Insérer → Intégrer → Code d'intégration**
3. Collez ce code :

```html
<iframe
  src="https://nico99209.github.io/ecranbc/display/"
  width="100%"
  height="720"
  style="border:0; border-radius:12px;"
  allowfullscreen
></iframe>
```

4. Publiez la page

> **Important pour l'écran TV** : dans Pro Display, utilisez l'URL directe GitHub Pages (`…/display/`), pas l'URL Google Sites. Le player charge ainsi la page sans passer par un iframe intermédiaire.

## 2. Configurer Pro Display

Connectez-vous sur [tv-pro-display.adyn.cloud](https://tv-pro-display.adyn.cloud/) (voir aussi le [guide interne](https://sites.google.com/view/affichage-dynamique)) puis :

### Option A — Page complète (recommandée)

Une seule URL affiche météo + anniversaires + horloge.

1. **Médias → Nouveau média**
2. Choisir un modèle **Site web** / **URL** / **HTML5** (selon votre interface)
3. URL : `https://nico99209.github.io/ecranbc/display/`
4. Durée : illimitée ou très longue (ex. 24 h)
5. **Planification** : glisser le média sur l'écran du bureau

### Option B — Multi-zones (météo native + anniversaires)

Pro Display inclut un widget **Météo locale** gratuit. Vous pouvez combiner :

| Zone | Contenu |
|------|---------|
| Zone 1 | Widget météo Pro Display (ville : Lille) |
| Zone 2 | URL `https://nico99209.github.io/ecranbc/display/` (masquer la météo si besoin) |
| Zone 3 | Flux RSS, actualités internes, etc. |

Pour masquer la météo sur la page custom, modifiez `display/config.js` (voir ci-dessous).

## 3. Personnalisation

Éditez `display/config.js` :

```js
window.DISPLAY_CONFIG = {
  companyName: "BC NORD",
  tagline: "Bienvenue au bureau",
  weather: {
    city: "Lille",        // Changer la ville ici
    latitude: 50.6292,
    longitude: 3.0573,
    timezone: "Europe/Paris",
  },
  birthdays: {
    upcomingDays: 14,     // Nombre de jours affichés
    dataUrl: "../data/birthdays.json",
  },
};
```

Après modification, committez et poussez sur `main` — la page se met à jour automatiquement.

## 4. Mettre à jour les anniversaires

Quand le fichier Excel change :

1. Remplacez `data/source/Anniversaires.xlsx`
2. Lancez l'import :

```bash
pip install -r requirements.txt
python scripts/import_birthdays.py
```

3. Committez `data/birthdays.json` et poussez sur `main`

## 5. Test en local

```bash
cd /chemin/vers/ecranbc
python3 -m http.server 8080
```

Ouvrez [http://localhost:8080/display/](http://localhost:8080/display/)

## Dépannage

| Problème | Solution |
|----------|----------|
| Page blanche sur le player | Vérifier que le player est connecté au réseau |
| Météo indisponible | Vérifier l'accès à `api.open-meteo.com` |
| Anniversaires vides | Vérifier que `data/birthdays.json` est accessible (même domaine) |
| iframe bloquée | Utiliser le type de média **Site web** (redirection) plutôt qu'iframe |

## Licence

Usage interne BC NORD.
