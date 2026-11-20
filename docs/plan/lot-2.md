# Plan · Lot 2 · Ajouter un TODO

Issue : #2 · Branche : `dev` · PR : `dev` → `main` (une seule PR pour les lots 2 à 5)

Je saisis un titre dans le champ au-dessus de la liste et je valide avec le bouton ou la touche Entrée. Le TODO est enregistré en base, il apparaît en dernier sous « Aujourd'hui » et le champ se vide.

Plan non soumis à validation : enchaînement autonome des lots 2 à 5 demandé. Les choix et écarts sont listés ici et repris dans la PR.

## 1. Tâches, couche par couche

### Données (`src/data/`)

- `TodoRepository.ajouter(todo: TodoEnregistre): Promise<void>` : `INSERT` après création de la table si besoin (même promesse mémorisée que `listerTous`). Aucune règle : enregistre ce qu'il reçoit.

### Service (`src/service/`)

- `registre.ts` (nouveau, fonctions pures, utilisables côté navigateur) : `composerRegistre(todos, maintenant): Registre`, déplacé de `todo-service.ts` (tri, groupement par jour de Paris, titres, âge, nombre). Type `Todo` exposé par le service pour que la présentation ne connaisse pas `@/data`.
- `titre.ts` (nouveau, pur) : `validerTitre(saisie: unknown)` → `{ ok: true, titre }` (espaces retirés) ou `{ ok: false, erreur: "titre-vide" }` (vide, espaces seuls, autre chose qu'un texte).
- `todo-service.ts` : `lister()` remplace `consulter(maintenant)` (le registre est composé à l'affichage par `composerRegistre`) ; `ajouter(saisie, maintenant)` valide le titre, crée `{ id: crypto.randomUUID(), titre, creeLe: maintenant, termine: false }`, l'enregistre et le renvoie.

Pourquoi des fonctions pures : l'ajout s'affiche tout de suite (`useOptimistic`), avant la réponse du serveur. Le navigateur recompose le registre avec le TODO en attente en appelant `composerRegistre` du service : le tri et le groupement restent écrits une seule fois, dans le service. Même chose pour `validerTitre` : le message « titre vide » s'affiche sans aller-retour, et le serveur revalide avec la même fonction.

### Présentation

- `src/app/actions.ts` (`"use server"`) : `ajouterTodo(saisie)` → `todoService().ajouter(saisie, Date.now())`, puis `refresh()` (`next/cache`) pour que la page se recharge avec la base.
- `src/app/page.tsx` : passe `todos`, `maintenant` et l'action à `EcranTodo`.
- `src/presentation/todo/ecran-todo.tsx` devient composant client : saisie, erreur, dernier ajout, annonce `aria-live`, liste optimiste.
- `formulaire-ajout.tsx` : repris de la maquette (champ, bouton « Ajouter » `signature`, aide « Entrée pour ajouter · Échap pour effacer », message d'erreur surligné).
- `bandeau.tsx` : reçoit le formulaire en `children` (marge sous le titre comme la maquette).
- `registre.tsx` : ligne « Enregistrement… » (spinner) pendant l'envoi, surligneur et mention « à l'instant » sur le dernier ajout (6 s).
- `chargement-liste.tsx` : squelette du champ, comme la maquette.

## 2. Critères d'acceptation et tests

| # | Critère | Test(s) | Couche |
|---|---------|---------|--------|
| 1 | « Relancer le devis » validé → en dernier sous « Aujourd'hui » (en-tête créé s'il manque), champ vidé | `todo-service.test.ts` : ajout puis `composerRegistre(lister())` → dernier TODO du jour « Aujourd'hui » ; sans TODO du jour, en-tête « Aujourd'hui » créé | Service |
| | | `registre.test.ts` : un TODO ajouté maintenant est le dernier de « Aujourd'hui » | Service |
| | | `ecran-todo.test.tsx` : saisie + clic sur « Ajouter » ou envoi du formulaire (Entrée) → action appelée, champ vidé, ligne « Enregistrement… » en dernier sous « Aujourd'hui », puis ligne enregistrée surlignée « à l'instant » ; en-tête « Aujourd'hui » créé s'il manquait | Présentation |
| 2 | Champ vide ou espaces → aucun TODO, message demandant un titre | `titre.test.ts` : `""`, `"   "`, valeur non texte → `titre-vide` | Service |
| | | `todo-service.test.ts` : `ajouter("   ")` → `titre-vide`, repository non appelé | Service |
| | | `ecran-todo.test.tsx` : validation à vide → action non appelée, message « Écris un titre avant d'ajouter. » | Présentation |
| 3 | « ␣␣Relancer le devis␣␣ » → enregistré « Relancer le devis » | `titre.test.ts`, `todo-service.test.ts` : le repository reçoit « Relancer le devis » | Service |
| | | `ecran-todo.test.tsx` : la ligne en attente affiche « Relancer le devis » | Présentation |
| 4 | TODO ajouté, redémarrage → toujours là | `todo-repository.test.ts` : `ajouter` puis nouvelle connexion → relu | Données |
| | | `instances.test.ts` : `todoService().ajouter()`, puis assemblage neuf → `lister()` le contient | Service + données |

Vérification manuelle : ajout dans `pnpm start`, arrêt, relance → TODO présent.

### Critères à préciser

- **Critère 1, touche Entrée** : jsdom ne simule pas l'envoi implicite d'un formulaire par Entrée. Le test envoie le formulaire (`submit`), ce que fait le navigateur sur Entrée ; la vérification manuelle passe par le vrai clavier.

## 3. Maquette : ce que le lot reprend

Référence : `/maquette`, `/maquette?etat=titre-vide`, `/maquette?etat=enregistrement`.

| Élément | Source | Lot 2 |
|---------|--------|-------|
| Formulaire sur le bandeau : champ, bouton « Ajouter », aide, erreur | `formulaire-ajout.tsx` | Repris |
| Échap vide le champ, sortie du champ efface l'erreur | `formulaire-ajout.tsx` | Repris |
| Ligne en attente « Enregistrement… » | `registre.tsx` (`enAttente`) | Repris |
| Surligneur et « à l'instant » sur le dernier ajout (6 s) | `registre.tsx`, `maquette-todo.tsx` | Repris |
| Annonce « « … » ajouté sous Aujourd'hui. » | `maquette-todo.tsx` | Repris |
| Squelette du champ | `chargement-registre.tsx` | Repris |

### Écarts

1. **Champ désactivé (base injoignable)** non repris : aucun lot ne porte l'état « base injoignable ».
2. **Cellules du cartouche** toujours absentes : lot 4.
3. **Case à cocher** toujours absente : lot 3.

## 4. Hors lot, signalé sans être codé

- Échec de l'enregistrement (base en panne) : l'erreur remonte à la frontière d'erreur par défaut de Next, comme au lot 1.
- Longueur maximale d'un titre : non demandée. La limite de taille d'une action serveur (1 Mo par défaut) s'applique.
