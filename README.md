# Book de Voyage - Serveur PDF

Petit serveur Node.js + Puppeteer qui transforme du HTML en PDF de haute qualité.

## Déploiement sur Render.com (gratuit)

1. Crée un repo GitHub et uploade tous ces fichiers (package.json, server.js, render.yaml)
2. Va sur https://render.com et crée un compte (gratuit, pas de carte bancaire)
3. Clique sur "New +" → "Web Service"
4. Connecte ton repo GitHub
5. Render détecte automatiquement la config (grâce à render.yaml) :
   - Build Command : `npm install`
   - Start Command : `npm start`
6. Choisis le plan **Free**
7. Clique sur "Create Web Service"

Le déploiement prend 2-5 minutes. Une fois terminé, Render te donne une URL du type :
`https://book-voyage-pdf-server.onrender.com`

## Utilisation depuis l'appli

Depuis ton appli, envoie une requête POST à `https://TON-URL.onrender.com/generate-pdf` :

```js
const response = await fetch('https://TON-URL.onrender.com/generate-pdf', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    html: '<html>...</html>', // le HTML complet du livre
    filename: 'mon-livre.pdf'
  })
});

const blob = await response.blob();
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'mon-livre.pdf';
a.click();
```

## Important : le serveur s'endort

Sur le plan gratuit, le serveur s'endort après 15 minutes sans activité.
Le premier appel après une pause prend ~30 secondes (réveil). Les appels suivants sont rapides.

Astuce : appeler `GET /` (l'URL de base) juste avant de générer le PDF permet de "réveiller" le serveur en avance.
