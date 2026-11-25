# ADR 002 · Pilote de base `@libsql/client`

- Statut : acceptée
- Date : 2026-11-20
- Portée : cadrage

## Contexte
`INTENT.md` demande une base légère type SQLite, facilement migrable vers un service managé comme Turso, avec un déploiement sur Vercel. Le système de fichiers d'une fonction Vercel est en lecture seule et effacé à chaque déploiement : un fichier SQLite y perdrait les TODO.

## Décision
`@libsql/client` dès le lot 1, avec la même API partout :
- en local, un fichier SQLite (`file:local.db`, ignoré par git) ;
- en ligne, Turso (`TURSO_DATABASE_URL` et `TURSO_AUTH_TOKEN`), en HTTPS, adapté aux fonctions serverless ;
- sur Vercel sans variables Turso : erreur explicite, jamais de fichier éphémère.

La configuration est lue dans `src/data/connexion.ts` uniquement.

## Options considérées
- `@libsql/client`, même API pour le fichier local et Turso : retenue.
- `better-sqlite3` : listé parmi les candidats dans `DB_CLIENTS` avant le choix. Il ne parle qu'à un fichier local : passer à Turso aurait exigé un second pilote.
- `drizzle-orm` : listé parmi les candidats dans `DB_CLIENTS` avant le choix ; raison non documentée.
- Fichier SQLite en production sur Vercel : écarté, les données seraient perdues à chaque déploiement.

## Conséquences
- Le passage à Turso (lot 5) n'a modifié que `src/data/`.
- Pas d'ORM : les requêtes SQL et la conversion des lignes sont écrites à la main dans `src/data/`.
- La table est créée au premier accès, sans outil de migration pour l'instant.
