# Politique de Securite

## Versions supportees

| Version | Supporte           |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |

## Signaler une vulnerabilite

Si vous decouvrez une vulnerabilite de securite dans TokSlides, merci de la signaler de maniere responsable.

**Ne creez PAS d'issue publique pour les vulnerabilites de securite.**

### Comment signaler

1. Envoyez un email a l'auteur du projet via GitHub
2. Ou utilisez la fonctionnalite "Report a vulnerability" dans l'onglet Security du repository

### Ce qu'il faut inclure

- Description de la vulnerabilite
- Etapes pour reproduire le probleme
- Impact potentiel
- Suggestions de correction (si vous en avez)

### Delai de reponse

- Accuse de reception : 48 heures
- Evaluation initiale : 7 jours
- Correction : selon la severite

### Recompense

Ce projet etant open source et gratuit, nous ne proposons pas de bug bounty. Cependant, nous vous crediterons dans les notes de version si vous le souhaitez.

## Bonnes pratiques de securite

TokSlides est une application 100% client-side :

- **Pas de serveur** : Aucune donnee n'est envoyee a un serveur externe
- **Stockage local** : Les projets sont stockes dans LocalStorage
- **Images locales** : Les images sont stockees dans IndexedDB
- **Pas de tracking** : Aucun analytics ou tracking

### Permissions demandees

- **Camera** : Pour l'overlay webcam (optionnel)
- **Microphone** : Pour l'enregistrement audio (optionnel)

Ces permissions ne sont demandees que lorsque vous activez les fonctionnalites correspondantes.
