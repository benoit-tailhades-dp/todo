# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Une seule personne, qui est aussi l'auteur de l'outil. Elle l'utilise autant sur ordinateur (clavier, grande fenêtre) que sur téléphone (saisie au pouce, écran étroit). Elle a en général 10 à 30 TODO en cours à la fois.

## Product Purpose

Un outil de TODO personnel : ajouter un TODO, consulter la liste, marquer un TODO terminé. On a réussi quand un TODO ajouté apparaît tout de suite dans la liste et qu'il y est encore après un redémarrage ou un déploiement.

## Positioning

Outil personnel pour une seule personne : pas de compte, pas de partage, pas de réglages. On ouvre la page et on travaille sa liste.

## Operating Context

- Ordinateur et téléphone, utilisés à parts égales.
- Une liste de travail de 10 à 30 TODO en cours, qu'on parcourt du regard.
- Application en ligne sur Vercel, et en local avec `pnpm dev`.

## Capabilities and Constraints

- Fonctions : ajouter (titre obligatoire, espaces superflus retirés), consulter (en cours d'abord, puis une section « Terminés », avec un compteur des TODO en cours), marquer terminé. Le détail et les critères d'acceptation sont dans `lots.md`.
- On ne peut pas décocher un TODO terminé : INTENT.md ne le demande pas.
- Ordre d'affichage : du plus ancien au plus récent.
- Hors périmètre : authentification, droits, multi-utilisateur. L'URL en ligne est donc publique.
- Pile technique : Next.js 16, composants shadcn (style base-nova, Base UI), Tailwind 4, base libSQL (fichier SQLite en local, Turso en ligne), déploiement sur Vercel.
- Architecture en 3 couches (présentation, service, données), règles dans `.claude/rules/`.
- Interface en français.
- Non décidé : le nom de l'application.

## Brand Commitments

- Le design system Cartouche est imposé : jetons dans `src/app/globals.css`, composants dans `src/presentation/ui/`, référence dans `design-options.html`. Aucune couleur hors jetons.

## Evidence on Hand

Aucune donnée réelle. Les maquettes utilisent des TODO fictifs, présentés comme tels.

## Product Principles

1. Ajouter un TODO se fait sans détour, au clavier comme au pouce.
2. Avec 10 à 30 TODO, on voit d'un coup d'œil ce qui reste à faire.
3. Le périmètre est celui d'INTENT.md : rien de plus tant qu'il n'est pas décidé.
4. Une seule personne, donc aucune trace d'un compte ou d'un partage dans l'interface.
