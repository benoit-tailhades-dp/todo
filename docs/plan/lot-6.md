# Plan · Lot 6 · Changer la date d'un TODO

Issue : #18 · Branche : `dev` · PR : `dev` → `main`

Sur un TODO en cours, j'ouvre son sélecteur de date et je choisis un autre jour, passé ou futur. Ou bien je le glisse sur un autre jour de la liste. Le TODO passe sous ce jour, et la date est enregistrée en base. Un jour futur s'affiche après « Aujourd'hui », sous « Demain » ou sous sa date. Dans un jour, l'ordre reste celui de l'ajout. Au clavier, le sélecteur fait le même travail que le glisser-déposer.

Deux validations ont eu lieu avant le code :
1. Le plan et les six points à trancher : « go ».
2. La maquette complétée, sur captures : « tu peux y aller ».

## 1. Points tranchés

1. **Sélecteur de date** : `Popover` et `Calendar` de shadcn, alignés sur Cartouche. Dépendances ajoutées : `react-day-picker` 10.0.2 et `date-fns` 4.4.0, toutes deux sous licence MIT. Le calendrier compte les jours à l'heure de Paris (`timeZone="Europe/Paris"`, locale `fr`).
2. **Glisser-déposer** : API HTML5 native, sans dépendance. La poignée ne s'affiche qu'avec une souris (`pointer-fine`). Au doigt, on passe par le sélecteur.
3. **Critère 7** : « à 23 h 30 » est l'heure du choix (22 h 30 UTC). Le jour voyage et se stocke en date de calendrier, `AAAA-MM-JJ`, jamais en instant. Aucun fuseau ne peut donc le décaler d'un jour.
4. **Place après un déplacement** : le TODO se range selon son heure d'ajout. Un TODO venu d'« Hier » passe donc en tête d'« Aujourd'hui ».
5. **« Le plus ancien »** : il donne l'âge du premier jour affiché, et « — » s'il ne reste que des jours à venir.
6. **Commit** : il inclut le lot 6 de `lots.md`, la maquette, ce plan et les captures.

## 2. Tâches réalisées

### Données (`src/data/todo-repository.ts`)

- **Colonne `jour TEXT`**, nullable : `null` veut dire « le jour d'ajout ».
- **Migration des bases existantes** :
  - Au premier appel, `PRAGMA table_info(todos)` vérifie si la colonne existe. Si elle manque, `ALTER TABLE todos ADD COLUMN jour TEXT` l'ajoute.
  - Une base du lot 5, Turso compris, est donc migrée sans perdre de lignes.
  - En cas d'échec, l'appel suivant réessaie, comme pour la création de la table.
- **Lecture** : `listerTous` et `trouver` lisent `jour`.
- **Écriture** : nouvelle méthode `changerJour(id, jour)`.

### Service

- **`jours.ts`** :
  - Les calculs portent sur une clé de jour : `instantDuJour`, `ageDuJour`, `titreDuJour` et `precisionDuJour`.
  - Nouveau titre « Demain ». La précision s'affiche pour Hier, Aujourd'hui et Demain.
  - `validerJour(saisie)` est une fonction pure. Elle refuse une date vide, d'un autre format, ou qui n'existe pas (30 février, mois 13).
- **`registre.ts`** :
  - `jourDuTodo` donne `jour`, sinon le jour de `creeLe`.
  - Les jours sont triés par clé ; dans un jour, les TODO restent dans l'ordre d'ajout.
  - `plusAncien` suit le premier jour affiché.
- **`todo-service.ts`** : `changerDate(id, jour)` renvoie `ok`, ou l'une des erreurs `date-invalide`, `introuvable` ou `deja-termine`. Rien n'est écrit si le jour ne change pas.

### Présentation

- **`actions.ts`** : nouvelle action `changerDateTodo`, qui appelle `refresh()`. **`page.tsx`** la passe à l'écran.
- **`registre.tsx`** reprend le balisage et les classes de la maquette :
  - le bouton calendrier et la poignée ;
  - la ligne glissée et le jour survolé, avec « Déposer ici » ;
  - la cellule « Dans N j ».
- **`selecteur-date.tsx`** est la copie de celui de la maquette, branchée sur `@/service/jours`.
- **`ecran-todo.tsx`** :
  - un changement optimiste « date » ;
  - l'état du glisser et le sélecteur ouvert ;
  - l'annonce « « … » déplacé sous … » ;
  - le focus rendu au bouton de date de la ligne déplacée ;
  - les alertes « Cette date n'est pas valide » et « Ce TODO n'existe plus ».
- **`etats.tsx`** : nouvelle `AlerteDateInvalide`, reprise de la maquette.
- **`ui/popover.tsx` et `ui/calendar.tsx`** : ajoutés par shadcn et alignés sur Cartouche. Correction du `calendar.tsx` généré : la `ref` du bouton de jour n'était pas branchée, et les flèches ne déplaçaient donc pas le focus.

## 3. Critères d'acceptation et tests

| # | Critère | Test(s) | Couche |
|---|---------|---------|--------|
| 1 | Aujourd'hui (vendredi 20) → lundi 16 dans le sélecteur : le TODO passe sous « Lundi 16 novembre », les compteurs des deux jours changent | `registre.test.ts` « TODO d'aujourd'hui passé au lundi 16 : rangé sous « Lundi 16 novembre », les deux compteurs changent » | Service |
| | | `todo-service.test.ts` « TODO d'aujourd'hui, lundi 16 choisi : enregistré sous « Lundi 16 novembre », les deux compteurs changent » | Service |
| | | `ecran-todo.test.tsx` « TODO d'aujourd'hui, lundi 16 choisi : il passe sous « Lundi 16 novembre » et les compteurs des deux jours changent » | Présentation |
| 2 | Samedi 21 pour l'un, mardi 24 pour l'autre : après « Aujourd'hui », sous « Demain » puis « Mardi 24 novembre » | `jours.test.ts` « titre le jour : « Aujourd'hui », « Hier », « Demain », sinon la date » | Service |
| | | `registre.test.ts`, `todo-service.test.ts` et `ecran-todo.test.tsx` « samedi 21 pour l'un, mardi 24 pour l'autre : … » | Service, Présentation |
| | | `registre.test.ts` « jour à venir : sa clé, la date en clair à côté de « Demain », un âge négatif » | Service |
| 3 | Glisser de « Hier », déposer sur « Aujourd'hui » : il prend la date du jour | `ecran-todo.test.tsx` « TODO glissé de « Hier » et déposé sur « Aujourd'hui » : il passe sous « Aujourd'hui » avec la date du jour » | Présentation |
| | | `todo-service.test.ts` « TODO d'« Hier » déposé sur « Aujourd'hui » : il prend la date du jour, et l'en-tête « Hier » disparaît » | Service |
| | | `registre.test.ts` « dans un jour, l'ordre reste celui de l'ajout : un TODO venu d'« Hier » passe avant ceux ajoutés aujourd'hui » | Service |
| | | Vérifié dans Chrome, à la souris, depuis la poignée et depuis le titre | Manuel |
| 4 | Seul TODO d'un jour déplacé : l'en-tête du jour quitté disparaît | `registre.test.ts` « le seul TODO en cours d'un jour déplacé : l'en-tête de ce jour disparaît » | Service |
| | | `ecran-todo.test.tsx` « le seul TODO d'un jour déplacé : l'en-tête du jour qu'il quitte disparaît » | Présentation |
| 5 | Relâché sur son propre jour ou hors de la liste : rien ne bouge, rien n'est enregistré | `todo-service.test.ts` « son propre jour : rien n'est enregistré » | Service |
| | | `ecran-todo.test.tsx` « relâché sur son propre jour : le jour le refuse… », « relâché hors de la liste… », « son propre jour choisi… » | Présentation |
| 6 | Après redémarrage, toujours sous son nouveau jour | `todo-repository.test.ts` « changerJour : ne change que le TODO visé, relu par listerTous et trouver, et survit à la réouverture » | Données |
| | | `todo-repository.test.ts` « base du lot 5, sans colonne jour : la colonne est ajoutée, les TODO restent, la date peut changer » | Données |
| | | `instances.test.ts` « TODO dont la date a changé : toujours sous son nouveau jour après un redémarrage » | Service |
| | | Vérifié : serveur de production arrêté puis relancé, les jours choisis sont restés | Manuel |
| 7 | Serveur en UTC, mardi 24 choisi à 23 h 30 à Paris : sous « Mardi 24 novembre » | `todo-service.test.ts` « serveur en UTC, mardi 24 choisi le vendredi 20 à 23 h 30 à Paris : rangé sous « Mardi 24 novembre », ni la veille ni le lendemain » | Service |
| | | `ecran-todo.test.tsx` « serveur et navigateur en UTC, mardi 24 choisi le vendredi 20 à 23 h 30 à Paris : envoyé « 2026-11-24 », rangé sous « Mardi 24 novembre » » | Présentation |
| | | `jours.test.ts` « un jour donne un instant qui tombe ce jour-là à Paris » | Service |
| 8 | Date vide ou invalide, ou identifiant inconnu : rien ne change, un message dit pourquoi | `jours.test.ts` « date vide, absente, d'un autre format ou qui n'existe pas : refusée » | Service |
| | | `todo-service.test.ts` « date vide ou invalide… », « identifiant inconnu… » | Service |
| | | `ecran-todo.test.tsx` « date refusée par le serveur : le TODO revient sous son jour et un message dit pourquoi », « TODO introuvable en base : rien n'est modifié et un message le dit » | Présentation |
| | | Vérifié dans Chrome : TODO retiré de la base pendant que la page est ouverte, puis déplacé → « Ce TODO n'existe plus » | Manuel |
| — | Au clavier, le sélecteur fait le travail du glisser-déposer | `ecran-todo.test.tsx` « le calendrier s'ouvre sur le jour du TODO, sélectionné et qui a le focus », « au clavier : après le choix, le focus revient au bouton de date du TODO, sous son nouveau jour » | Présentation |
| | | Vérifié dans Chrome : bouton calendrier, flèche droite, Entrée → sous « Demain », focus rendu, annonce lue | Manuel |

**Sortie rouge** : 35 tests en échec sur 113, avant le code. Ils échouaient pour les raisons attendues : fonctions absentes, bouton de date introuvable, jour choisi ignoré.

Quatre tests nouveaux passaient déjà au rouge, parce qu'ils vérifient que rien ne se passe :
- « relâché sur son propre jour » ;
- « relâché hors de la liste » ;
- « son propre jour choisi » ;
- « pas de sélecteur sur un TODO terminé ou en attente ».

Leurs pendants positifs, eux, échouaient.

**Tests corrigés** : trois tests de l'ajout (lot 2) dataient la ligne en attente avec l'heure réelle alors que l'écran est figé au vendredi 20. Ils ne passaient donc que le 20 novembre. L'horloge est maintenant figée dans ce `describe`.

## 4. Maquette : ce que le lot reprend

Référence : `/maquette?etat=a-venir`, `selecteur-date`, `glisser` et `date-invalide`.

| Élément | Source | Lot 6 |
|---------|--------|-------|
| Bouton calendrier, popover « Changer la date », calendrier français | `maquette/selecteur-date.tsx` | Repris tel quel |
| Ligne glissée, poignée, jour survolé « Déposer ici » | `maquette/registre.tsx` | Repris |
| « Demain », précision, cellule « Dans N j » | `maquette/registre.tsx`, `dates.ts` | Repris, calculs dans le service |
| Alerte « Cette date n'est pas valide » | `maquette/etats.tsx` | Reprise |
| Focus rendu, annonce du déplacement | `maquette/maquette-todo.tsx` | Repris ; l'annonce part après la réponse du serveur |

### Écarts

1. **Erreur `deja-termine`** : la maquette n'en a pas. Elle n'arrive que si le TODO a été terminé ailleurs entre-temps. Aucun message n'est affiché : la page se recharge et le TODO apparaît dans « Terminés ».
2. **Capture « date refusée » sur l'écran réel** : impossible depuis l'interface, puisque le calendrier n'envoie que des dates valides. L'alerte est testée (critère 8). La capture réelle montre à la place le cas de l'identifiant inconnu.

## 5. Captures (`docs/plan/captures/lot-6/`)

L'écran réel tourne en build de production, sur une base de démo avec les données de la maquette. Les déplacements ont été faits dans l'interface.

| État | Maquette | Réel |
|------|----------|------|
| Jours à venir | `maquette-a-venir-{clair,sombre,mobile}.jpg` | `reel-a-venir-{clair,sombre,mobile}.jpg` |
| Sélecteur ouvert | `maquette-selecteur-{clair,sombre,mobile}.jpg` | `reel-selecteur-{clair,sombre,mobile}.jpg` |
| TODO glissé | `maquette-glisser-{clair,sombre}.jpg` | `reel-glisser-{clair,sombre}.jpg` |
| Date refusée / introuvable | `maquette-date-invalide-{clair,sombre}.jpg` | `reel-introuvable-{clair,sombre}.jpg` |

Les captures mobiles de la maquette font 500 px de large, la largeur minimale de la fenêtre Chrome. Celles de l'écran réel font 390 px : la page est chargée dans une iframe, parce que la fenêtre ne se redimensionnait plus.

## 6. À savoir

- **Migration sur Turso** : elle est testée sur un fichier SQLite. Je pense que Turso accepte `PRAGMA table_info` et `ALTER TABLE ADD COLUMN`, mais je ne l'ai pas vérifié. À contrôler au premier chargement après le déploiement.
- **Taille du bundle** : l'effet de `react-day-picker` et `date-fns` n'a pas été mesuré.
- **Hors lot, non codé** : des raccourcis « Aujourd'hui » et « Demain » dans le sélecteur.
