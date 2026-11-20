# Plan · Lot 1 · Consulter ma liste de TODO

Issue : #1 · Branche : `dev` · PR : `dev` → `main`

J'ouvre l'application et je vois la liste de mes TODO, lue depuis la base SQLite et rangée par jour d'ajout. S'il n'y en a aucun, un message me le dit.

## 1. Tâches, couche par couche

### Données (`src/data/`)

- `pnpm add @libsql/client` (0.18.0). `@libsql/*` est déjà dans `DB_CLIENTS` (`eslint.config.mjs`) et dans la liste `serverExternalPackages` de Next : aucune configuration à ajouter.
- `src/data/connexion.ts` : `import "server-only"`, `clientParDefaut()` mémorisé. URL lue dans `process.env.DATABASE_URL`, par défaut `file:local.db` (déjà ignoré par `.gitignore`, ligne `local.db*`). Aucun `.env.local` nécessaire au lot 1. Le lot 5 ne modifiera que ce fichier pour Turso.
- `src/data/todo-repository.ts` : `import "server-only"`.
  - Type `TodoEnregistre = { id: string; titre: string; creeLe: number; termine: boolean }` (`creeLe` en millisecondes UTC).
  - Interface `TodoRepository { listerTous(): Promise<TodoEnregistre[]> }`.
  - `createLibsqlTodoRepository(client)` : avant la première requête, crée la table si elle n'existe pas (promesse mémorisée), puis lit et convertit les lignes. Aucun tri ici : le tri est une règle du service.
  - Table : `todos (id TEXT PRIMARY KEY, titre TEXT NOT NULL, cree_le INTEGER NOT NULL, termine INTEGER NOT NULL DEFAULT 0)`. La colonne `termine` est créée dès maintenant : `CREATE TABLE IF NOT EXISTS` ne modifie pas une table existante, l'ajouter au lot 3 demanderait une migration.

### Service (`src/service/`)

- `src/service/jours.ts` : règles de calendrier à l'heure de Paris, reprises de `src/presentation/maquette/dates.ts` : `cleJour`, `ecartJours`, `dateLongue`, `titreDuJour` (« Aujourd'hui », « Hier », sinon « Lundi 16 novembre »), `precisionDuJour`.
- `src/service/todo-service.ts` : `createTodoService(repository)` → `consulter(maintenant): Promise<Registre>`.
  - Trie du plus ancien au plus récent, groupe par jour de Paris, calcule pour chaque jour son titre, sa précision, son âge en jours et son nombre de TODO.
  - `Registre = { dateDuJour: string; jours: JourDeTodos[] }`, `JourDeTodos = { cle, titre, precision, age, nombre, todos: { id, titre }[] }`.
- `src/service/instances.ts` : point d'assemblage, `todoService()` mémorisé = `createTodoService(createLibsqlTodoRepository(clientParDefaut()))`. C'est le seul module du service qui importe une implémentation de `src/data` : la présentation ne peut pas le faire, et le service reste testable avec un faux repository.

### Présentation (`src/app/`, `src/presentation/todo/`)

- `src/app/page.tsx` : remplace la page du gabarit Next. `metadata` « Mes TODO ». `<Suspense fallback={<ChargementListe />}>` autour d'un composant async qui fait `await io()`, lit `Date.now()` dans une fonction async à part (règle `react-hooks/purity`), appelle `todoService().consulter(maintenant)` et rend `<EcranTodo registre={…} />`. Même schéma que `src/app/maquette/page.tsx`.
- `src/presentation/todo/` : composants serveur, sans `"use client"` (rien d'interactif au lot 1), balisage et classes repris de la maquette :
  - `bandeau.tsx` : bandeau encre, « Mes TODO », date du jour.
  - `registre.tsx` : sections par jour, lignes de TODO. Ne groupe ni ne trie : il affiche ce que donne le service.
  - `etat-vide.tsx` : encart « Aucun TODO pour l'instant ».
  - `chargement-liste.tsx` : squelette.
  - `ecran-todo.tsx` : assemble le bandeau et, selon le registre, l'état vide ou le registre.
- La maquette (`src/presentation/maquette/`) n'est pas modifiée.

### Tests : configuration

- `vitest.config.mts` : `test.env.TZ = "UTC"`. Les tests tournent dans le fuseau de Vercel : un calcul de jour en heure locale, qui passerait sur un poste réglé sur Paris, échoue.

## 2. Critères d'acceptation et tests

| # | Critère | Test(s) | Couche |
|---|---------|---------|--------|
| 1 | Base sans TODO → « Aucun TODO pour l'instant » | `todo-service.test.ts` : repository vide → `jours` vide | Service |
| | | `ecran-todo.test.tsx` : registre sans jour → titre « Aucun TODO pour l'instant » | Présentation |
| 2 | Deux TODO le lundi 16 novembre et un aujourd'hui → « Lundi 16 novembre » puis « Aujourd'hui », chacun avec son nombre, du plus ancien au plus récent | `todo-service.test.ts` : TODO fournis dans le désordre, maintenant = vendredi 20 novembre 2026 → deux jours dans l'ordre, nombres 2 et 1, TODO triés dans chaque jour | Service |
| | | `jours.test.ts` : `titreDuJour` (« Aujourd'hui », « Hier », « Lundi 16 novembre ») | Service |
| | | `ecran-todo.test.tsx` : deux sections, titres dans l'ordre, nombre de chaque section, titres des TODO dans l'ordre reçu | Présentation |
| 3 | TODO ajouté le 19 novembre à 23 h 30 (Paris), ouvert le 20 → « Hier », même si le serveur tourne en UTC | `todo-service.test.ts` : maintenant = 20 novembre 00 h 15 Paris (19 novembre 23 h 15 UTC), tests en `TZ=UTC` → « Hier » | Service |
| | | `jours.test.ts` : 20 novembre 00 h 30 Paris (19 novembre 23 h 30 UTC) → jour `2026-11-20` | Service |
| 4 | Base inexistante → base et table créées, liste vide | `todo-repository.test.ts` : fichier temporaire absent → `listerTous()` renvoie `[]`, le fichier existe, la table `todos` est dans `sqlite_master` | Données |
| | | `instances.test.ts` : `DATABASE_URL` sur un fichier temporaire absent → `todoService().consulter()` renvoie un registre vide, le fichier est créé | Service + données |
| 5 | TODO en base, redémarrage → même liste | `todo-repository.test.ts` : lignes insérées en SQL par une première connexion, fermée ; une seconde connexion sur le même fichier relit les mêmes TODO (id, titre, date, état) | Données |

Vérification manuelle en plus (captures dans la PR) : `pnpm dev` sans `local.db` → liste vide et fichier créé ; jeu d'essai inséré par un script hors dépôt ; arrêt puis relance de `pnpm dev` → même liste.

### Critères à préciser

- **Critère 3** : 23 h 30 à Paris le 19 novembre, c'est 22 h 30 UTC le 19. Ouvert le 20 après 1 h du matin, un serveur qui calcule en UTC dirait aussi « Hier » : le critère ne piège le calcul UTC que si on ouvre l'application entre minuit et 1 h. Le test fixe donc « maintenant » à 0 h 15, et un second cas vérifie le passage de minuit.
- **Critère 4** : la table est créée à la première lecture (première ouverture de la page), pas au démarrage du serveur.
- **Critère 5** : en test, le redémarrage est simulé par la fermeture puis la réouverture de la connexion. Le vrai redémarrage de `pnpm dev` est vérifié à la main.

## 3. Maquette : ce que le lot reprend

Référence : `/maquette` (état « Liste de travail ») et `/maquette?etat=vide`.

| Élément | Source | Lot 1 |
|---------|--------|-------|
| Bandeau encre `bg-shell` : « Mes TODO », date du jour | `bandeau.tsx` | Repris |
| Section par jour, en-tête en bande de cartouche : titre (« Aujourd'hui », « Hier », date), précision de date, cellules « Âge » (teinte selon l'âge) et « TODO » (nombre) | `registre.tsx` | Repris |
| Lignes de TODO : titre, filets, carte `bg-card` | `registre.tsx` (`LigneTodo`) | Repris sans la case (voir écarts) |
| État vide : icône flèche, « Aucun TODO pour l'instant », texte | `etats.tsx` (`EtatVide`) | Repris |
| Squelette de chargement | `chargement-registre.tsx` | Repris, adapté (voir écarts) |
| Conteneur `main` : `max-w-4xl`, marges | `maquette-todo.tsx` | Repris |

Non repris, car portés par d'autres lots : champ d'ajout et surlignage « à l'instant » (lot 2), case à cocher, trait d'encre et alerte « introuvable » (lot 3), cellules du cartouche, section « Terminés » et état « tout terminé » (lot 4), barre de démo (maquette seule).

### Écarts à valider

1. **Cellules du cartouche** (« En cours », « Terminés », « Le plus ancien ») absentes : le compteur appartient au lot 4. Le bandeau ne montre que le titre et la date. *Recommandé.*
2. **Case à cocher** absente des lignes : la cocher est le lot 3. Une case qui ne fait rien tromperait. La ligne garde sa hauteur et ses marges, sans survol ni curseur main. *Recommandé.*
3. **Texte de l'état vide** gardé tel quel (« Écris ton premier TODO dans le champ ci-dessus, puis appuie sur Entrée… ») alors que le champ arrive au lot 2. Le lot 1 n'est pas déployé (déploiement au lot 5), le texte devient juste dès le lot 2 sans retouche. *Recommandé.* Autre choix : un texte provisoire, à me fournir.
4. **Squelette de chargement** sans les cellules du cartouche ni le champ : il doit annoncer l'écran du lot 1, pas des éléments qui n'arrivent pas. *Recommandé.*

## 4. Décisions techniques à valider

- `src/service/instances.ts` comme point d'assemblage (seul import d'implémentation de `src/data` dans le service).
- `DATABASE_URL` optionnelle, défaut `file:local.db`.
- Colonne `termine` créée dès le lot 1.
- Tests en `TZ=UTC`.
- Ce plan entre dans le commit du lot : `feat(lot-1): Consulter ma liste de TODO`.

## 5. Hors lot, signalé sans être codé

- **Base injoignable** : la maquette a un état « erreur de chargement » (`EtatErreurChargement`), aucun lot ne le porte. Au lot 1, une base en panne afficherait l'erreur par défaut de Next. À ajouter au backlog si tu le veux.
- **Doublon des règles de date** : la maquette garde sa propre `dates.ts`, copiée dans `src/service/jours.ts`. On pourra la faire pointer vers le service.
- **Restes du gabarit** : `example-*` dans les trois couches, `public/*.svg`, `metadata` « Create Next App » du layout (surchargée par la page). Nettoyage possible en `chore`.
