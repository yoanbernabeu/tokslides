<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-5.6-3178C6?style=flat-square&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-6-646CFF?style=flat-square&logo=vite" alt="Vite" />
  <img src="https://img.shields.io/badge/TailwindCSS-4-06B6D4?style=flat-square&logo=tailwindcss" alt="TailwindCSS" />
  <img src="https://img.shields.io/github/license/yoanbernabeu/tokslides?style=flat-square" alt="License" />
</p>

<h1 align="center">TokSlides</h1>

<p align="center">
  <strong>Creez des slides verticales pour TikTok, Reels & Shorts en quelques secondes.</strong>
</p>

<p align="center">
  <a href="https://yoanbernabeu.github.io/tokslides">Essayer maintenant</a> •
  <a href="#fonctionnalites">Fonctionnalites</a> •
  <a href="#installation">Installation</a> •
  <a href="#utilisation">Utilisation</a> •
  <a href="#contribution">Contribution</a>
</p>

---

## Pourquoi TokSlides ?

Creer du contenu pedagogique pour les reseaux sociaux ne devrait pas necessiter des heures de montage video. **TokSlides** vous permet de :

1. **Ecrire** vos slides en Markdown
2. **Activer** votre webcam (optionnel)
3. **Enregistrer** directement depuis votre navigateur

C'est tout. Pas de logiciel a installer, pas de montage complexe, pas d'abonnement.

## Fonctionnalites

- **Editeur Markdown** - Ecrivez vos slides avec une syntaxe simple et intuitive
- **Themes** - 10+ themes professionnels avec degrades et typographies variees
- **Webcam integree** - Ajoutez votre visage en rond, carre ou portrait directement sur les slides
- **Enregistrement natif** - Enregistrez votre presentation en WebM sans quitter le navigateur
- **Images** - Collez des images (Ctrl+V), recadrez-les et redimensionnez-les directement
- **Layouts flexibles** - Positionnez votre contenu (centre, haut, bas, gauche, droite...)
- **100% local** - Vos donnees restent sur votre machine (IndexedDB + LocalStorage)
- **Open Source** - Gratuit et transparent

## Demo

```markdown
# Ma Super Presentation

Bienvenue sur TokSlides !

---

## Slide 2

- Point important 1
- Point important 2
- Point important 3

---

## Conclusion

**Merci d'avoir regarde !**
```

Chaque `---` cree une nouvelle slide.

## Installation

### Prerequis

- Node.js 18+
- npm ou yarn

### Developpement local

```bash
# Cloner le repo
git clone https://github.com/yoanbernabeu/tokslides.git
cd tokslides

# Installer les dependances
npm install

# Lancer le serveur de dev
npm run dev
```

L'application sera disponible sur `http://localhost:3000`

### Build de production

```bash
npm run build
npm run preview
```

## Utilisation

### Syntaxe Markdown supportee

| Syntaxe | Rendu |
|---------|-------|
| `# Titre` | Titre principal |
| `## Sous-titre` | Sous-titre |
| `**gras**` | **gras** |
| `*italique*` | *italique* |
| `- item` | Liste a puces |
| `1. item` | Liste numerotee |
| `` `code` `` | Code inline |
| `> citation` | Citation |
| `---` | Nouvelle slide |

### Layouts

Ajoutez un commentaire HTML en debut de slide pour changer le positionnement :

```markdown
<!-- layout: top-left -->

# Mon titre aligne en haut a gauche
```

Layouts disponibles : `center`, `top`, `bottom`, `left`, `right`, `top-left`, `top-right`, `bottom-left`, `bottom-right`

### Images

- **Coller une image** : `Ctrl+V` pour coller une image depuis le presse-papier
- **Recadrer** : Une fenetre de crop apparait automatiquement
- **Redimensionner** : Cliquez sur l'image dans la preview et tirez les coins

### Webcam

1. Cliquez sur l'icone camera pour activer votre webcam
2. Glissez la webcam pour la repositionner
3. Scrollez sur la webcam pour zoomer/dezoomer
4. Dans les parametres, changez la forme (rond, carre, arrondi, portrait)

### Enregistrement

1. Cliquez sur **REC** pour demarrer l'enregistrement
2. Un compte a rebours de 3 secondes demarre
3. Naviguez entre vos slides avec les fleches
4. Cliquez sur **STOP** pour terminer
5. Le fichier WebM est automatiquement telecharge

## Stack technique

- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite 6** - Build tool
- **TailwindCSS 4** - Styling
- **react-markdown** - Markdown parsing
- **html-to-image** - Rasterization pour l'enregistrement
- **Lucide React** - Icones

## Structure du projet

```
tokslides/
├── components/        # Composants React
│   ├── Editor.tsx     # Editeur Markdown avec crop d'images
│   ├── Preview.tsx    # Preview des slides avec webcam
│   ├── Sidebar.tsx    # Barre laterale (themes, structure)
│   └── ...
├── utils/             # Utilitaires
│   ├── storage.ts     # IndexedDB pour les images
│   └── rasterizer.ts  # Capture des slides pour video
├── types.ts           # Types TypeScript
├── constants.ts       # Themes et contenu initial
└── App.tsx            # Composant principal
```

## Contribution

Les contributions sont les bienvenues ! Consultez [CONTRIBUTING.md](CONTRIBUTING.md) pour les guidelines.

## Licence

[MIT](LICENSE) © 2026 Yoan Bernabeu

---

<p align="center">
  Fait avec ❤️ pour les createurs de contenu
</p>
