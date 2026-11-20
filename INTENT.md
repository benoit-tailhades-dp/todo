# Intention

## Produit
Un outil de TODO pour une seule personne.
Je peux ajouter mes TODO, consulter, marquer terminé.

## Architecture
Une architecture en 3 couches : présentation, service, données.
Seule la couche données parle à la base.
Une base légère type SQLite, facilement migrable vers un service managé comme Turso.
Les règles métier ont des tests unitaires.

## Contraintes
Next.js, composants shadcn, déploiement sur Vercel.
Un seul utilisateur.

## Hors périmètre
Pas d'authentification, pas de gestion de droits, pas de multi-utilisateur.

## Critères d'acceptation
- J'ajoute un TODO, il apparaît dans la liste.
- Après redémarrage de l'app, mes TODO sont toujours là.
- Passer à une base managée ne modifie que la couche données.