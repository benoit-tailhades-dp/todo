# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Projet en français : code, commentaires, textes d'interface et commits. Gestionnaire de paquets : pnpm.

## Commandes

- `pnpm dev` : serveur de développement. `pnpm build` puis `pnpm start` : build et serveur de production.
- `pnpm lint` : ESLint, qui fait aussi respecter les frontières entre couches.
- `pnpm exec tsc --noEmit` : vérification des types (pas de script dédié).
- `pnpm test` : Vitest, une passe. `pnpm test:watch` : mode surveillance.
- Un seul fichier : `pnpm test src/service/todo-service.test.ts`. Un seul test : `pnpm test -t "retire les espaces"`. Une couche : `pnpm test src/service`.
- Ajouter un composant shadcn : `pnpm dlx shadcn@latest add <nom>`, puis l'aligner sur Affiche (modèle : `src/presentation/ui/button.tsx`).

## Next.js 16 : vérifier avant d'écrire

Cette version a des changements cassants (voir `AGENTS.md`). Lire le guide concerné dans `node_modules/next/dist/docs/` avant d'utiliser une API Next.

- `cacheComponents: true` dans `next.config.ts` : `Date.now()`, `new Date()` ou `Math.random()` dans un Server Component exigent `await io()` (de `next/cache`) sous une frontière `<Suspense>`. Voir `src/app/maquette/page.tsx`.
- La règle de lint `react-hooks/purity` refuse `Date.now()` pendant le rendu : on le lit dans une fonction async à part.
- Types globaux générés pour les routes : `PageProps<"/route">` et `LayoutProps<"/">`. `searchParams` est une promesse.

## Architecture : trois couches

`INTENT.md` fixe le produit (un TODO pour une seule personne, sans authentification) et l'architecture. Chaque couche a ses règles dans `.claude/rules/`, chargées selon le chemin du fichier modifié. `eslint.config.mjs` les fait respecter par `no-restricted-imports`, et le hook `.claude/hooks/lint-apres-modif.sh` lance ESLint après chaque modification d'un fichier `.ts`, `.tsx`, `.js`, `.jsx`, `.mjs` ou `.mts` : une erreur revient aussitôt à l'agent.

Les décisions d'architecture sont dans `docs/decisions/` (ADR, skill `decision-context`). Les lire avant de proposer un choix d'architecture, de librairie ou de structure.

- **Présentation** (`src/app/`, `src/presentation/`) : n'appelle que `@/service/...`, jamais `@/data`, jamais `process.env`. Aucune règle métier.
- **Service** (`src/service/`) : porte les règles métier. Il reçoit le repository en paramètre (`createXService(repository)`) et n'importe ni React, ni Next, ni la présentation. Tests écrits avant le code, avec un faux repository écrit dans le test (pas de librairie de mock).
- **Données** (`src/data/`) : seule couche qui parle à la base et lit les variables d'environnement (valeurs dans `.env.local`). Chaque module commence par `import "server-only"`, que `vitest.config.mts` neutralise en test. Pilote : `@libsql/client` (ADR 002), fichier SQLite en local (`file:local.db`) et Turso en ligne, configuré dans `src/data/connexion.ts`. Un changement de base ne modifie que `src/data/` et `package.json`. Tout nouveau client de base va dans `DB_CLIENTS` (`eslint.config.mjs`).

Tests : environnement `node` par défaut. Un test de composant commence par `// @vitest-environment jsdom` (voir `src/presentation/todo/ecran-todo.test.tsx`).

## Design system Affiche

Affiche suisse (style typographique international) : champ vermillon en aplat (`bg-shell`), noir et blanc, Archivo très grasse et étendue pour les chiffres et titres, cercles et pilules, filets fins, aucune carte.


- Couleurs uniquement en jetons, définies dans `src/app/globals.css` (sombre sous `:root[data-theme="sombre"]`, attribut posé avant le premier rendu par `src/presentation/theme/script-theme.tsx`). Aucune couleur en dur, ni palette Tailwind, ni valeur arbitraire. S'il manque une couleur, ajouter un jeton clair et sombre.
- Composants : uniquement ceux de `src/presentation/ui/` (shadcn style base-nova sur Base UI, fusion de classes avec le paquet `cn`). Le bouton principal est noir (`default`) ; `signature` est vermillon. Cases et pastilles rondes, champ et boutons de l'écran en pilule (`rounded-full`).
- Mouvements définis dans `globals.css` : `surligne` (trace du dernier ajout), `trait-encre` (trait vermillon du TODO coché), `animate-chiffre` (le chiffre roule), `animate-apparait`, `animate-coche`, courbes `ease-trait` et `ease-ressort`. Dans `src/presentation/todo/` : `geste-ligne.ts` (glisser au doigt : droite = terminer, gauche = calendrier) et `glissement-fluide.ts` (les lignes glissent à leur nouvelle place). Tout est coupé en mouvement réduit.
- `DESIGN.md` et `.impeccable/design.json` décrivent le système livré. `PRODUCT.md` porte la vérité produit pour Impeccable. Un hook Impeccable analyse chaque modification de fichier d'interface.

## Maquette de référence

La route `/maquette` (`src/presentation/maquette/`) a servi de référence visuelle aux lots 1 à 7. Elle n'a pas été refaite dans le monde Affiche (elle en hérite seulement les jetons) : pour le visuel, l'écran réel `/` fait foi. Données fictives, état local, pas de base. `?etat=` ouvre un état directement (`vide`, `tout-termine`, `chargement`, `erreur-chargement`, `titre-vide`, `introuvable`, `enregistrement`). Les règles qu'elle simule (titre obligatoire, espaces retirés, tri, groupement par jour) doivent vivre dans le service quand un lot les livre. Les jours se calculent à l'heure de Paris (ADR 003) : règle et constante `FUSEAU` dans `src/service/jours.ts`, copie propre à la maquette dans `src/presentation/maquette/dates.ts`.

## Façon de travailler

- Le backlog est découpé en lots dans `lots.md`, avec une issue GitHub par lot. Un lot se traite avec le skill `/lot N` : plan validé, TDD, conformité à la maquette, PR de `dev` vers `main`.
- Commits : `feat(lot-N): …`, `fix(lot-N): …`, `chore: …`, `docs: …`.
- Captures de conformité (étape « Vérifier » du skill `lot`) : MCP Playwright (`.mcp.json`, sans fenêtre). Mobile : `browser_resize` à 390 px de large. Sombre : `browser_emulate_media` avec `colorScheme: "dark"`. Mouvement réduit : `reducedMotion: "reduce"`. Enregistrer avec `browser_take_screenshot` dans `docs/plan/captures/lot-N/`.
- Avant `gh pr create`, le hook `.claude/hooks/verifier-avant-pr.sh` lance `pnpm lint`, `pnpm exec tsc --noEmit` et `pnpm test`, et bloque la PR si l'un échoue.
- Skills du projet (`.claude/skills/`) : `lot` (traiter un lot), `backlog` (issues GitHub), `decision-context` (ADR).
- Agents du projet (`.claude/agents/`) : `revue` (relecture d'une PR), `securite` (contrôle avant mise en production), `backlog` (demande en vrac vers issues GitHub).
