# Plan · Lot 5 · Retrouver mes TODO sur l'application en ligne

Issue : #5 · Branche : `dev` · PR : `dev` → `main` (une seule PR pour les lots 2 à 5)

J'ouvre l'application déployée sur Vercel, et j'y ajoute et coche mes TODO comme en local. En ligne, les données sont dans Turso ; en local, l'application garde le fichier SQLite.

Plan non soumis à validation : enchaînement autonome des lots 2 à 5 demandé. Ce plan est commité à part (`docs:`) : le critère 3 veut que le commit du lot ne touche que `src/data/` et `package.json`.

## 1. Tâches

### Données (`src/data/`) : seule couche modifiée

- `connexion.ts` : `configurationConnexion(env)`, fonction pure testée, choisit la base :
  - `TURSO_DATABASE_URL` définie → Turso, avec `TURSO_AUTH_TOKEN` (obligatoire : sans jeton, erreur explicite au lieu d'un 401 à la première requête) ;
  - sinon `DATABASE_URL` (tests, autre fichier) ;
  - sinon `file:local.db`.
  - Sur Vercel (`VERCEL` définie) sans Turso : erreur explicite. Le système de fichiers d'une fonction Vercel est en lecture seule et effacé à chaque déploiement : un fichier SQLite y perdrait les TODO (critère 2).
- `clientParDefaut()` passe cette configuration à `createClient`. Avec une URL `libsql://`, `@libsql/client` parle HTTPS (adapté aux fonctions serverless), sans fichier local.
- `todo-repository.ts` : la création de la table n'est plus mémorisée en cas d'échec. En ligne, une coupure réseau au premier appel bloquait sinon l'instance jusqu'à son redémarrage.
- `package.json` : rien à changer, `@libsql/client` gère `file:` et `libsql:`.

### Hors dépôt (à faire par toi)

1. Créer la base Turso : intégration Turso de la Marketplace Vercel (elle pose `TURSO_DATABASE_URL` et `TURSO_AUTH_TOKEN` dans le projet), ou `turso db create todo`, puis `turso db show --url todo` et `turso db tokens create todo`.
2. Importer le dépôt GitHub dans Vercel (préréglage Next.js, pnpm détecté par `packageManager`).
3. Déclarer `TURSO_DATABASE_URL` et `TURSO_AUTH_TOKEN` pour Production et Preview.
4. Déployer : la table se crée à la première ouverture.

## 2. Critères d'acceptation et tests

| # | Critère | Test(s) | Couche |
|---|---------|---------|--------|
| 1 | Application déployée, j'ajoute un TODO → il apparaît | `connexion.test.ts` : variables Turso → client distant (`protocol` = `http`), sans fichier local | Données |
| | | À vérifier en ligne après configuration (section 1, « Hors dépôt ») | Manuel |
| 2 | TODO créés en ligne, nouveau déploiement → toujours là | `connexion.test.ts` : sur Vercel sans Turso → erreur explicite (jamais de fichier éphémère) | Données |
| | | `todo-repository.test.ts` : après un échec de création de table, l'appel suivant réessaie | Données |
| | | À vérifier en ligne : redéployer, la liste est la même | Manuel |
| 3 | Passage à Turso → seuls `src/data/` et `package.json` modifiés | `git show --stat` du commit `feat(lot-5)` | Revue |
| 4 | Aucune variable Turso, `pnpm dev` → fichier SQLite local | `connexion.test.ts` : sans variable → `file:local.db` ; client de protocole `file` | Données |
| | | À la main : serveur lancé sans variable → liste lue dans `local.db` | Manuel |

### Critères à préciser

- **Critères 1 et 2** : je n'ai ni compte Vercel ni base Turso sur ce poste. Le code est prêt et testé ; la vérification en ligne se fait après les étapes « Hors dépôt ». L'issue #5 reste ouverte jusque-là (la PR la référence sans la fermer).

## 3. Maquette

Aucun changement d'écran.

## 4. Hors lot, signalé sans être codé

- **URL publique sans authentification** (décision de `lots.md`) : en ligne, quiconque connaît l'URL lit et modifie les TODO, et la route `/maquette` est publique aussi.
- **Base injoignable** : aucun lot ne porte l'état d'erreur de la maquette ; une panne Turso affiche l'erreur par défaut de Next.
