# ADR 001 · Architecture en trois couches

- Statut : acceptée
- Date : 2026-11-20
- Portée : cadrage

## Contexte
`INTENT.md` impose une architecture en trois couches (présentation, service, données), une base légère facilement migrable vers un service managé, et des tests unitaires sur les règles métier. Critère d'acceptation : passer à une base managée ne modifie que la couche données.

## Décision
- **Présentation** (`src/app/`, `src/presentation/`) : n'appelle que `@/service/...`. Aucune règle métier, aucun accès à la base ni à `process.env`.
- **Service** (`src/service/`) : porte les règles métier. Reçoit le repository en paramètre (`createXService(repository)`). N'importe ni React, ni Next, ni la présentation. Tests écrits avant le code, avec un faux repository écrit dans le test.
- **Données** (`src/data/`) : seule couche qui parle à la base et lit les variables d'environnement. Chaque module commence par `import "server-only"`.
- `src/service/instances.ts` est le seul point d'assemblage qui importe une implémentation de `src/data`.
- Les frontières sont vérifiées par `no-restricted-imports` dans `eslint.config.mjs`, et décrites dans `.claude/rules/`.

## Options considérées
- Trois couches (présentation, service, données), frontières vérifiées par ESLint : retenue.
- Accès direct à la base depuis les Server Components (usage courant avec Next.js) : écarté par `INTENT.md`, seule la couche données parle à la base.
- Une librairie de mock pour les tests du service : écartée au profit d'un faux repository écrit dans le test ; raison non documentée.

## Conséquences
- Changer de base ne touche que `src/data/` et `package.json` (vérifié au lot 5).
- Les règles métier se testent sans base, en environnement `node`.
- Un peu plus de code d'assemblage (interfaces de repository, `instances.ts`) qu'un accès direct.
