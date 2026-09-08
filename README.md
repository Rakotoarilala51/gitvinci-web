# Gitvinci

Gitvinci est un atelier web pour créer du **contribution art** dans le calendrier de contributions GitHub. Dessine un motif sur une année, transforme du texte ou une image en pixels, puis génère un plan de commits qui reproduit ce motif.

Le projet est une application Next.js côté navigateur. Les données de travail restent localement dans le navigateur et peuvent être partagées sous forme de lien.

## Démo en ligne

Utilise Gitvinci directement sur [gitvinci-web.vercel.app](https://gitvinci-web.vercel.app/).

## Fonctionnalités

- Édition interactive d'un calendrier annuel de 53 colonnes sur 7 lignes.
- Pinceau, gomme, remplissage, changement d'intensité et annulation/rétablissement.
- Conversion de texte en pixel art avec des polices bitmap `5x7` et `7x9`.
- Import d'une image et conversion en grille de pixels.
- Templates prêts à utiliser et galerie de motifs sauvegardés.
- Réglage des seuils d'intensité pour le plan de commits.
- Décalage horizontal d'un motif sans perdre les pixels valides.
- Prévisualisation et partage d'un motif par URL.
- Export d'un plan de commits et d'un script Git.
- Thème clair et sombre.

## Démarrage rapide

### Prérequis

- Node.js 20 ou une version plus récente.
- npm.

### Installation

```bash
npm install
```

### Serveur de développement

```bash
npm run dev
```

Ouvre ensuite [http://localhost:3000](http://localhost:3000).

### Vérifications

```bash
npm run lint
npm test
npm run build
```

## Utilisation

1. Choisis l'année du calendrier.
2. Dessine directement dans la grille ou sélectionne un template.
3. Utilise le champ texte pour placer un message en pixel art.
4. Importe une image si nécessaire et ajuste son rendu.
5. Configure les seuils d'intensité dans le plan de commits.
6. Télécharge le plan ou le script Git généré.
7. Vérifie le script avant de l'exécuter dans le dépôt cible.

Les brouillons sont sauvegardés dans le `localStorage` du navigateur. Un motif partagé est encodé dans l'URL avec son année et ses paramètres d'intensité.

## Structure du projet

```text
app/          Page principale et styles globaux
components/   Éditeur, outils, galerie, partage et panneaux de configuration
data/         Templates de motifs
lib/          Grille, couleurs, polices, stockage et génération de scripts
public/       Ressources statiques
tests/        Tests automatisés
```

## Commandes disponibles

| Commande | Description |
| --- | --- |
| `npm run dev` | Lance le serveur de développement |
| `npm run lint` | Vérifie le code avec ESLint |
| `npm test` | Exécute les tests Node.js |
| `npm run build` | Compile l'application de production |
| `npm start` | Lance l'application compilée |

## Notes

Gitvinci n'est pas affilié à GitHub. L'application génère des données et des scripts que tu peux examiner avant toute utilisation. Elle ne crée ni ne pousse automatiquement de commits sur un dépôt GitHub.
