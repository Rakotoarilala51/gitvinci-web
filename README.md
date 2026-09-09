# Gitvinci

Gitvinci est un atelier web pour créer du **contribution art** dans le calendrier de contributions GitHub. Dessine un motif sur une année, transforme du texte ou une image en pixels, puis génère un plan de commits qui reproduit ce motif.

Le projet est une application Next.js côté navigateur. Les données de travail restent localement dans le navigateur et peuvent être partagées sous forme de lien.

## Démo en ligne

Utilise Gitvinci directement sur [gitvinci-web.vercel.app](https://gitvinci-web.vercel.app/).

## Fonctionnalités

- Édition d’un calendrier annuel daté en UTC : sept lignes, 53 ou 54 colonnes selon l’année, jours hors année masqués et dates futures éditables.
- Pinceau, gomme, remplissage, changement d'intensité et annulation/rétablissement.
- Conversion de texte en pixel art en direct dans l’éditeur avec une police bitmap `5x7`.
- Import d'une image et conversion en grille de pixels.
- 16 templates prêts à utiliser et galerie de motifs sauvegardés.
- Réglage des seuils d'intensité pour le plan de commits.
- Décalage horizontal d'un motif sans perdre les pixels valides.
- Prévisualisation et partage d'un motif par URL.
- Récapitulatif des commits par date (`JJ-MM-AAAA`), copie et téléchargement CSV.
- Thème clair et sombre.

## Templates

- **Langages** : C++, Python, JavaScript, TypeScript, Java et Rust.
- **Arcade et symboles** : Batman, Space Invader, Cœur, Sourire, Musique et Ghost.
- **Messages** : HIRE ME!, SAY HI et CODE.
- **No-life** : tous les jours de l’année au niveau maximal, même le 29 février.

Les logos sont des interprétations pixel adaptées aux sept lignes du calendrier et aux intensités de contributions. Chaque carte applique le motif à l’année sélectionnée ; le remplacement est annulable.

## Raccourcis de l’éditeur

| Action | Raccourci |
| --- | --- |
| Pinceau | B |
| Gomme | E |
| Remplissage | F |
| Cycle d’intensité | C |
| Annuler | Ctrl / ⌘ Z |
| Rétablir | Ctrl / ⌘ Maj Z |
| Naviguer dans la grille | Flèches |
| Peindre la case sélectionnée | Espace |

Les boutons Gauche et Droite déplacent le motif d’une colonne (sept jours). Une direction se désactive si le déplacement ferait sortir des pixels de l’année.

## Démarrage rapide

### Prérequis

- Node.js 20.9 minimum (Node.js 22 utilisé pour les vérifications du projet).
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
6. Consulte les quantités de commits par jour, puis copie le récapitulatif ou télécharge le CSV.

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

Gitvinci n'est pas affilié à GitHub. L’application prépare un plan de commits ; les paliers sont configurables et les nuances réelles de GitHub dépendent de l’activité du profil. Elle ne crée ni ne pousse automatiquement de commits sur un dépôt GitHub.
