# Contribuer a TokSlides

Merci de votre interet pour contribuer a TokSlides ! Ce document vous guidera dans le processus de contribution.

## Code de Conduite

En participant a ce projet, vous acceptez de respecter notre [Code de Conduite](CODE_OF_CONDUCT.md).

## Comment contribuer ?

### Signaler un bug

1. Verifiez que le bug n'a pas deja ete signale dans les [Issues](https://github.com/yoanbernabeu/tokslides/issues)
2. Si non, creez une nouvelle issue en utilisant le template "Bug Report"
3. Decrivez le bug de maniere claire et detaillee
4. Incluez des etapes pour reproduire le probleme
5. Ajoutez des captures d'ecran si pertinent

### Proposer une fonctionnalite

1. Verifiez que la fonctionnalite n'a pas deja ete proposee
2. Creez une issue en utilisant le template "Feature Request"
3. Expliquez le probleme que cette fonctionnalite resoudrait
4. Decrivez la solution que vous envisagez

### Soumettre du code

#### Prerequis

- Node.js 18+
- npm
- Git

#### Etapes

1. **Fork** le repository

2. **Clonez** votre fork :
   ```bash
   git clone https://github.com/VOTRE_USERNAME/tokslides.git
   cd tokslides
   ```

3. **Installez** les dependances :
   ```bash
   npm install
   ```

4. **Creez** une branche pour votre modification :
   ```bash
   git checkout -b feature/ma-nouvelle-fonctionnalite
   # ou
   git checkout -b fix/correction-du-bug
   ```

5. **Developpez** votre modification :
   ```bash
   npm run dev
   ```

6. **Verifiez** que le code compile :
   ```bash
   npm run build
   ```

7. **Commitez** vos changements :
   ```bash
   git add .
   git commit -m "feat: description de la fonctionnalite"
   ```

8. **Poussez** votre branche :
   ```bash
   git push origin feature/ma-nouvelle-fonctionnalite
   ```

9. **Creez** une Pull Request sur GitHub

## Conventions

### Commits

Nous utilisons [Conventional Commits](https://www.conventionalcommits.org/) :

- `feat:` - Nouvelle fonctionnalite
- `fix:` - Correction de bug
- `docs:` - Documentation
- `style:` - Formatage (pas de changement de code)
- `refactor:` - Refactoring
- `test:` - Ajout/modification de tests
- `chore:` - Maintenance

Exemples :
```
feat: ajout du support des GIFs
fix: correction du crop d'image sur Safari
docs: mise a jour du README
```

### Code Style

- **TypeScript** : Utilisez les types explicites
- **React** : Composants fonctionnels avec hooks
- **CSS** : TailwindCSS classes
- **Nommage** : camelCase pour les variables/fonctions, PascalCase pour les composants

### Structure des fichiers

```
components/     # Composants React (.tsx)
utils/          # Fonctions utilitaires (.ts)
types.ts        # Types TypeScript
constants.ts    # Constantes et configurations
```

## Pull Request

### Checklist

Avant de soumettre votre PR, verifiez :

- [ ] Le code compile sans erreur (`npm run build`)
- [ ] Les fonctionnalites existantes ne sont pas cassees
- [ ] Le code suit les conventions du projet
- [ ] La PR a une description claire

### Review

- Un mainteneur examinera votre PR
- Des modifications peuvent etre demandees
- Une fois approuvee, la PR sera mergee

## Questions ?

N'hesitez pas a ouvrir une issue pour toute question !

---

Merci de contribuer a TokSlides !
