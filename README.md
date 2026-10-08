# 🌤️ Api-Meteo

![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES2022-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![ESLint](https://img.shields.io/badge/ESLint-10-4B32C3?style=for-the-badge&logo=eslint&logoColor=white)
![WeatherAPI](https://img.shields.io/badge/API-WeatherAPI.com-1E90FF?style=for-the-badge&logo=icloud&logoColor=white)
![License](https://img.shields.io/badge/License-All%20rights%20reserved-red?style=for-the-badge)

Application météo développée avec **React 19** et **Vite**, qui consomme l'API REST de [WeatherAPI.com](https://www.weatherapi.com/) pour afficher la météo actuelle, les prévisions sur 3 jours, la qualité de l'air et les alertes météorologiques d'une localisation.

🔗 **Lien de démo : https://api-meteo-eta.vercel.app**

---

## 📋 Sommaire

- [Fonctionnalités](#-fonctionnalités)
- [Stack technique](#-stack-technique)
- [Prérequis](#-prérequis)
- [Installation](#-installation)
- [Configuration de la clé API](#-configuration-de-la-clé-api)
- [Scripts disponibles](#-scripts-disponibles)
- [Structure du projet](#-structure-du-projet)
- [Architecture et choix techniques](#-architecture-et-choix-techniques)
- [Pistes d'amélioration](#-pistes-damélioration)
- [Licence](#-licence)
- [Auteur](#-auteur)

---

## ✨ Fonctionnalités

| Fonctionnalité | Détail |
| --- | --- |
| 🔍 **Recherche flexible** | Par nom de ville, code postal ou coordonnées GPS (`lat,lon`) |
| 🌡️ **Météo actuelle** | Température, ressenti, condition, heure locale |
| 📊 **Indicateurs détaillés** | Vent (vitesse + direction), rafales, humidité, visibilité, pression, indice UV |
| 🍃 **Qualité de l'air** | Badge coloré basé sur l'indice **US EPA** (de *Good* à *Hazardous*) |
| 📅 **Prévisions 3 jours** | Températures min / max, probabilité de pluie, lever et coucher du soleil |
| ⚠️ **Alertes météo** | Affichage des alertes officielles lorsqu'elles existent pour la zone |
| ⏳ **Gestion des états** | Indicateur de chargement et message d'erreur explicite (ville introuvable, clé invalide…) |

---

## 🛠️ Stack technique

| Catégorie | Technologie |
| --- | --- |
| Bibliothèque UI | React 19 (hooks : `useState`, `useCallback`) |
| Build / Dev server | Vite 8 + `@vitejs/plugin-react` |
| Langage | JavaScript (JSX) |
| Qualité de code | ESLint 10 (`react-hooks`, `react-refresh`) |
| Source de données | [WeatherAPI.com](https://www.weatherapi.com/docs/) — endpoint `forecast.json` |
| Requêtes HTTP | `fetch` natif + `URLSearchParams` |

---

## 📦 Prérequis

- **Node.js** 20.19+ ou 22.12+
- **npm** (installé avec Node.js)
- Une **clé API gratuite** WeatherAPI.com → [créer un compte](https://www.weatherapi.com/signup.aspx)

---

## 🚀 Installation

```bash
# 1. Cloner le dépôt
git clone https://github.com/HNGA91/Api_Meteo.git
cd Api_Meteo

# 2. Installer les dépendances
npm install

# 3. Configurer la clé API (voir section suivante)

# 4. Lancer le serveur de développement
npm run dev
```

L'application est ensuite accessible sur [http://localhost:5173](http://localhost:5173).

---

## 🔑 Configuration de la clé API

La clé API est lue depuis une variable d'environnement Vite. Créez un fichier `.env` à la racine du projet :

```env
VITE_WEATHER_API_KEY=votre_cle_api_ici
```

> Le fichier `.env` est ignoré par Git (règle `*.local` du `.gitignore`) : votre clé ne sera jamais publiée sur le dépôt.
> Un fichier `.env.example` est fourni comme modèle.

> ⚠️ **À savoir :** dans une application 100 % front-end, toute variable préfixée par `VITE_` est injectée dans le bundle final et reste lisible dans le navigateur. Pour une mise en production, la clé devrait être protégée derrière un petit back-end ou une fonction serverless faisant office de proxy.

---

## 📜 Scripts disponibles

| Commande | Description |
| --- | --- |
| `npm run dev` | Lance le serveur de développement avec Hot Module Replacement |
| `npm run build` | Génère la version de production dans `dist/` |
| `npm run preview` | Sert localement le build de production |
| `npm run lint` | Analyse le code avec ESLint |

---

## 🗂️ Structure du projet

```
Api-Meteo/
├── public/              # Fichiers statiques (favicon…)
├── src/
│   ├── assets/          # Ressources importées dans le code
│   ├── App.jsx          # Hook useWeather + composants de l'interface
│   ├── index.css        # Styles globaux et variables CSS (thème clair / sombre)
│   └── main.jsx         # Point d'entrée React (StrictMode)
├── .env.example         # Modèle de configuration de la clé API
├── eslint.config.js     # Configuration ESLint (flat config)
├── index.html           # Template HTML
├── package.json
└── vite.config.js       # Configuration Vite
```

---

## 🧠 Architecture et choix techniques

### Un hook personnalisé pour isoler la logique de données

Toute la logique d'appel réseau est encapsulée dans le hook **`useWeather`**, qui expose une interface simple :

```js
const { data, loading, error, fetchWeather } = useWeather();
```

**Pourquoi ?** Les composants d'affichage ne savent pas *comment* les données sont récupérées : ils se contentent de les afficher. Cette séparation rend la logique réutilisable, testable isolément, et permettrait de changer de fournisseur météo sans toucher à l'UI.

### `useCallback` sur `fetchWeather`

La fonction est mémoïsée pour conserver une référence stable entre les rendus. Elle peut ainsi être passée à des composants enfants ou placée dans le tableau de dépendances d'un `useEffect` sans provoquer de rendus ou d'appels réseau en boucle.

### Gestion des erreurs en trois temps

```
try    → appel API + vérification de response.ok
catch  → message d'erreur renvoyé par l'API (ou message générique)
finally→ fin du chargement, quel que soit le résultat
```

`fetch` ne rejette pas sa promesse sur une erreur HTTP (400, 401, 403…) : la vérification explicite de `response.ok` permet de remonter le message précis fourni par WeatherAPI (ex. *« No matching location found »*).

### Composants découpés par responsabilité

| Composant | Rôle |
| --- | --- |
| `App` | Formulaire de recherche et orchestration de l'affichage |
| `CurrentWeather` | Carte de la météo actuelle et badge de qualité de l'air |
| `DetailItem` | Tuile d'indicateur réutilisable (icône, libellé, valeur) |
| `ForecastDay` | Carte d'une journée de prévision |
| `WeatherIcon` | Affichage des icônes fournies par l'API |

### Un seul appel réseau

L'endpoint `forecast.json` renvoie en une requête la météo actuelle, les prévisions, la qualité de l'air (`aqi=yes`) et les alertes (`alerts=yes`), ce qui évite de multiplier les appels.

---

## 🔭 Pistes d'amélioration

- [ ] Déplacer les styles inline vers des fichiers CSS / CSS Modules
- [ ] Traduire l'interface en français (`lang=fr` est supporté par l'API)
- [ ] Géolocalisation automatique via l'API `navigator.geolocation`
- [ ] Mémoriser les dernières recherches
- [ ] Bascule °C / °F et km/h / mph
- [ ] Migration vers TypeScript
- [ ] Proxy back-end (Express ou serverless) pour masquer la clé API
- [ ] Tests unitaires du hook `useWeather` (Vitest + React Testing Library)

---

## 📄 Licence

© 2026 Louis-Hervé N'Goma — **Tous droits réservés.**

Ce code est publié à des fins de consultation et de démonstration. Aucune autorisation n'est accordée pour le copier, le modifier, le distribuer ou l'utiliser à des fins commerciales sans l'accord écrit préalable de l'auteur.

---

## 👤 Auteur

**Louis-Hervé N'Goma** — Développeur Full Stack

[![GitHub](https://img.shields.io/badge/GitHub-HNGA91-181717?style=for-the-badge&logo=github)](https://github.com/HNGA91)

---

<p align="center">Données météo fournies par <a href="https://www.weatherapi.com/">WeatherAPI.com</a></p>
