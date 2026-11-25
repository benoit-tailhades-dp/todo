# ADR 004 · Design system Affiche

- Statut : acceptée
- Date : 2026-11-21
- Portée : cadrage

## Contexte
`INTENT.md` impose les composants shadcn. Trois pistes de design system ont été comparées dans `design-options.html` : Cartouche, Carnet et Signal. Cartouche a été retenu d'abord (lots 1 à 7), puis jugé trop carré : l'utilisateur voulait une interface plus dynamique et amicale.

## Décision
Affiche, style typographique international suisse : champ vermillon en aplat, noir et blanc, Archivo très grasse et étendue pour les chiffres et titres, cercles et pilules, filets fins, aucune carte.
- Composants shadcn (style base-nova sur Base UI) dans `src/presentation/ui/`, alignés sur Affiche.
- Couleurs uniquement en jetons, clair et sombre, dans `src/app/globals.css`.
- Le système livré est décrit dans `DESIGN.md` et `.impeccable/design.json`.

## Options considérées
- Affiche : retenue.
- Cartouche : retenu pour les lots 1 à 7, puis remplacé, trop carré (voir `PRODUCT.md`).
- Carnet : piste de `design-options.html` non retenue ; raison non documentée.
- Signal : piste de `design-options.html` non retenue ; raison non documentée.

## Conséquences
- La maquette `/maquette` n'a pas été refaite : elle hérite seulement des jetons. Pour le visuel, l'écran réel `/` fait foi.
- Aucune couleur hors jetons : une couleur manquante se crée en jeton clair et sombre.
