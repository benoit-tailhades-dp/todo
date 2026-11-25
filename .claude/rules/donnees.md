---
paths:
  - "src/data/**"
---

# Couche données

Périmètre : `src/data/`.

## Règles

- Seule couche qui parle à la base. Le client de base de données (SQLite, ou libSQL pour Turso) n'est importé que dans `src/data`.
- Chaque module commence par `import "server-only"`, pour qu'il ne puisse jamais se retrouver dans le code envoyé au navigateur.
- Expose des interfaces de repository (ex. : `TodoRepository`) et leurs implémentations. Les couches au-dessus ne connaissent que l'interface.
- Aucune règle métier : lire, écrire, convertir entre les lignes de la base et les objets du domaine.
- La connexion se configure par des variables d'environnement lues ici seulement. Les valeurs vont dans `.env.local`, jamais dans un fichier versionné.
- Passer à une base managée (Turso) ne modifie que `src/data`.

## Comment vérifier

1. `pnpm lint` : la règle `no-restricted-imports` bloque les clients de base (`DB_CLIENTS` dans `eslint.config.mjs`) partout hors de `src/data`. Tout nouveau client de base s'ajoute à cette liste.
2. La base et sa configuration ne sont utilisées que dans `src/data` (la commande ne doit rien renvoyer) :
   ```bash
   grep -rnE "@libsql/|better-sqlite3|drizzle-orm|process\.env\.(DATABASE|TURSO)" src --include='*.ts' --include='*.tsx' | grep -v "^src/data/"
   ```
3. `server-only` est présent dans chaque module (la commande ne doit rien renvoyer) :
   ```bash
   for f in src/data/*.ts; do case $f in *.test.ts) ;; *) grep -q 'import "server-only"' "$f" || echo "server-only manquant : $f";; esac; done
   ```
4. `pnpm test src/data` passe.
5. Après un changement de base, `git diff --stat` ne touche que `src/data/` et `package.json`.
