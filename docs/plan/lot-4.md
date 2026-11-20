# Plan · Lot 4 · Séparer mes TODO en cours de mes TODO terminés

Issue : #4 · Branche : `dev` · PR : `dev` → `main` (une seule PR pour les lots 2 à 5)

J'ouvre la liste et je vois d'abord mes TODO en cours, puis mes TODO terminés dans une section à part. Un compteur m'indique combien il m'en reste.

Plan non soumis à validation : enchaînement autonome des lots 2 à 5 demandé.

## 1. Tâches, couche par couche

### Données

Rien : `termine` est lu depuis le lot 1.

### Service (`src/service/registre.ts`)

`composerRegistre` sépare les deux listes :

- `jours` : les TODO **en cours** seulement, rangés par jour comme avant. Un jour sans TODO en cours n'a plus d'en-tête.
- `termines` : les TODO terminés, du plus ancien au plus récent (décision « ordre d'affichage » de `lots.md`).
- `compteurs` : `enCours`, `termines`, `plusAncien` (âge en jours du plus ancien TODO en cours, `null` s'il n'y en a pas).
- `etat` : `"vide"` (aucun TODO), `"tout-termine"` (que des terminés) ou `"liste"`. L'écran choisit son encart d'après cet état, sans compter lui-même.

### Présentation (`src/presentation/todo/`)

Repris de la maquette :

- `cellules-cartouche.tsx` : « En cours » (chiffre surligné), « Terminés », « Le plus ancien », chiffre qui glisse quand il change (`animate-chiffre`).
- `bandeau.tsx` : reçoit les cellules à droite du titre.
- `section-terminees.tsx` : en-tête repliable « Terminés » + nombre, liste barrée. Fermée par défaut, ouverte quand tout est terminé (comme la maquette). La case cochée utilise `Checkbox` (`@/presentation/ui`) en lecture seule, retirée de l'ordre de tabulation, au lieu du `span` recopié de la maquette (constat de l'issue #10).
- `etats.tsx` : `EtatVide`, `EtatToutTermine` (« Rien à faire pour l'instant »), `AlerteIntrouvable` regroupés comme dans la maquette.
- `registre.tsx` : chorégraphie de la maquette quand on coche : trait d'encre (380 ms), repli de la ligne (220 ms), puis passage dans « Terminés ». En mouvement réduit, passage immédiat.
- `ecran-todo.tsx` : l'enregistrement part à la fin de la chorégraphie, avec l'affichage optimiste du lot 3 ; le focus passe à la case suivante (ou précédente, ou au champ), comme la maquette.
- `chargement-liste.tsx` : cellules et cases en squelette, comme la maquette.

## 2. Critères d'acceptation et tests

| # | Critère | Test(s) | Couche |
|---|---------|---------|--------|
| 1 | 2 en cours + 1 terminé → les 2 en cours en haut, le terminé dans « Terminés », compteur « 2 en cours » | `registre.test.ts` : `jours` ne contient que les 2 en cours, `termines` le terminé, `compteurs.enCours` = 2 | Service |
| | | `ecran-todo.test.tsx` : lignes en cours dans les jours, section « Terminés » (1) après eux, cellule « En cours » = 2 | Présentation |
| 2 | Je coche un TODO en cours → il passe dans « Terminés », le compteur baisse de 1 | `registre.test.ts` : le même registre avec ce TODO terminé → `enCours` − 1, `termines` + 1 | Service |
| | | `ecran-todo.test.tsx` : clic, fin de la chorégraphie → ligne dans « Terminés », « En cours » passe de 2 à 1, action appelée | Présentation |
| 3 | Seul TODO en cours d'un jour coché → l'en-tête du jour disparaît | `registre.test.ts` | Service |
| | | `ecran-todo.test.tsx` | Présentation |
| 4 | Tous terminés → message « rien à faire » | `registre.test.ts` : `etat` = `tout-termine` | Service |
| | | `ecran-todo.test.tsx` : « Rien à faire pour l'instant », section ouverte | Présentation |
| 5 | Aucun terminé → pas de section « Terminés » | `registre.test.ts` : `termines` vide | Service |
| | | `ecran-todo.test.tsx` : aucun bouton « Terminés » | Présentation |

Les tests du lot 3 sont adaptés : un TODO terminé s'affiche désormais dans « Terminés » (case cochée en lecture seule, titre barré), et l'enregistrement part après la chorégraphie.

### Critères à préciser

- **Critère 1, « 2 en cours »** : la maquette affiche une cellule libellée « En cours » avec le chiffre « 2 » (lu « En cours, 2 » par un lecteur d'écran). Je garde la maquette plutôt que le texte littéral « 2 en cours ».

## 3. Maquette : ce que le lot reprend

Référence : `/maquette`, `/maquette?etat=tout-termine`.

| Élément | Source | Lot 4 |
|---------|--------|-------|
| Cellules du cartouche dans le bandeau | `cellules-cartouche.tsx`, `bandeau.tsx` | Repris |
| Section « Terminés » repliable | `section-terminees.tsx` | Repris, `Checkbox` au lieu du `span` |
| Encart « Rien à faire pour l'instant » | `etats.tsx` | Repris |
| Chorégraphie trait d'encre → repli → « Terminés » | `registre.tsx`, `maquette-todo.tsx` | Repris |
| Focus déplacé après avoir coché | `maquette-todo.tsx` | Repris |
| Squelette complet | `chargement-registre.tsx` | Repris |

### Écarts

1. **Cellules à « — » (base injoignable)** non reprises : aucun lot ne porte cet état.
2. **Enregistrement après la chorégraphie (600 ms)** : la maquette n'enregistre rien. Envoyer la requête tout de suite ferait arriver la liste rechargée en plein trait d'encre et couperait l'animation. En mouvement réduit, l'envoi est immédiat.

## 4. Hors lot, signalé sans être codé

- `animate-chiffre` et `animate-apparait` restent animés en mouvement réduit (issue #9, `globals.css`).
