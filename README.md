# Battle Grid: Physarum

Battle Grid: Physarum est un jeu de stratégie au tour par tour dans lequel vous incarnez un organisme intelligent de type *Physarum*.
Déployez-vous sur une carte, construisez des bases, gérez votre énergie et affrontez des bots adaptatifs pour dominer la grille.

## 🎮 Fonctionnalités

- Carte 10x10 avec types de terrains aléatoires
- Propagation contrôlée avec énergie et biomasse
- Construction et destruction de bases (avec bonus)
- Tour par tour avec bots jouant automatiquement
- Historique complet avec filtres par joueur
- Interface visuelle réactive et responsive (Dark/Light Mode)
- Détection de fin de partie (victoire/défaite)
- Double-clic sur vos cases pour construire une base

## 🛠️ Technologies utilisées

- React + Zustand (store)
- Tailwind CSS (design)
- Vite (pour le dev server et le build)
- JavaScript ES6

## 🚀 Lancer le projet en local

```bash
# 1. Clonez le repo
git clone https://github.com/Erwan1202/Physarum.git
cd battle-grid

# 2. Installez les dépendances
npm install

# 3. Lancez le projet
npm run dev
```

## 🧾 Déploiement

### Avec Vercel (recommandé)
- Connectez votre repo GitHub sur [vercel.com](https://vercel.com)
- Cliquez sur "New Project", choisissez le repo et déployez.
- Aucun réglage spécial requis.

### Build manuel

```bash
npm run build
```
Les fichiers statiques seront dans `dist/`.

## 📁 Arborescence simplifiée

```
.
├── public/           # favicon, index.html
├── src/
│   ├── components/
│   ├── store/        # Zustand: useGameStore.js
│   ├── Grid.jsx      # Affichage de la grille
│   ├── GameBoard.jsx # Interface principale
├── index.css
├── main.jsx
├── vite.config.js
└── README.md
```

## ✨ Idées futures

- Multijoueur local ou en ligne
- Types de bots différents (agressif, défensif, expansif...)
- Effets de terrain
- Visibilité limitée
- Pouvoirs spéciaux

---

Le lien : https://physarum-five.vercel.app/

> Pleurez sur notre poulet 
Signé Erwan et Rayane.