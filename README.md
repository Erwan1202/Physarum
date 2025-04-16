Battle Grid: Physarum - Guide de Déploiement

🚀 Déploiement sur Vercel
--------------------------
1. Push du projet sur GitHub :
   - git init
   - git add .
   - git commit -m "Déploiement version prod"
   - git remote add origin https://github.com/<utilisateur>/<repo>.git
   - git push -u origin main

2. Aller sur https://vercel.com
   - Se connecter avec GitHub
   - Cliquer sur "New Project"
   - Sélectionner le repo
   - Laisser les paramètres par défaut (Vite)
   - Cliquer sur "Deploy"

🛠️ Commandes utiles
---------------------
- Lancer le dev local : `npm run dev`
- Build de production : `npm run build`
- Prévisualisation du build : `npm run preview`

🧠 Conseils supplémentaires
---------------------------
- Modifier `vite.config.js` si besoin d’un sous-répertoire
- Ajouter un `favicon.ico` dans `public/`
- Ajouter une page 404 personnalisée (fichier `404.html`)
- Ajouter un fichier `README.md` dans le repo GitHub

🌐 Résultat attendu : https://physarum-five.vercel.app/