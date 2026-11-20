---
paths:
  - "src/service/**"
---

# Couche service

Périmètre : `src/service/`.

## Règles

- Porte toutes les règles métier (exemples : un TODO a un titre non vide ; on ne marque terminé qu'un TODO existant). Ni la présentation ni les données n'en contiennent.
- Ne parle jamais à la base. Elle passe par les interfaces de repository de `src/data`, reçues en paramètre : `createXService(repository)`.
- Aucune dépendance à l'interface : pas d'import de `react`, de `next/*` ni de `@/presentation`.
- Les tests sont écrits avant le code :
  1. écrire le test dans `<module>.test.ts`, à côté du module ;
  2. le lancer et le voir échouer pour la bonne raison ;
  3. écrire le code minimal qui le fait passer, puis refactorer.
- Les tests utilisent un faux repository écrit dans le test : pas de base, pas de librairie de mock.

## Comment vérifier

1. `pnpm lint` : la règle `no-restricted-imports` bloque `react`, `next`, `@/presentation` et les clients de base dans `src/service`.
2. Chaque module a son test (la commande ne doit rien renvoyer) :
   ```bash
   for f in src/service/*.ts; do case $f in *.test.ts) ;; *) [ -f "${f%.ts}.test.ts" ] || echo "test manquant : $f";; esac; done
   ```
3. `pnpm test src/service` passe.
4. Test d'abord : le compte rendu montre la sortie du test en échec avant l'implémentation, puis en succès.
