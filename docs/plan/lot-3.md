# Plan · Lot 3 · Marquer un TODO terminé

Issue : #3 · Branche : `dev` · PR : `dev` → `main` (une seule PR pour les lots 2 à 5)

Dans la liste, je coche la case d'un TODO en cours. Il s'affiche tout de suite comme terminé et cet état est enregistré en base.

Plan non soumis à validation : enchaînement autonome des lots 2 à 5 demandé.

## 1. Tâches, couche par couche

### Données (`src/data/`)

- `TodoRepository.trouver(id)` : le TODO ou `null`.
- `TodoRepository.marquerTermine(id)` : `UPDATE todos SET termine = 1 WHERE id = ?`. La colonne `termine` existe depuis le lot 1 : pas de migration.

### Service (`src/service/`)

- `todo-service.ts` : `terminer(id)` → `{ ok: true }` ou `{ ok: false, erreur: "introuvable" }`.
  - Identifiant inconnu (ou autre chose qu'un texte) : `introuvable`, aucune écriture.
  - TODO déjà terminé : `ok`, aucune écriture.
  - Sinon : `marquerTermine(id)`.
- `registre.ts` : chaque TODO affiché porte `termine`. Les TODO terminés restent dans leur jour (la section « Terminés » est le lot 4).

### Présentation

- `src/app/actions.ts` : `terminerTodo(id)` → `todoService().terminer(id)`, puis `refresh()` dans tous les cas (un TODO introuvable a disparu de la base : la liste se remet à jour).
- `ecran-todo.tsx` : la liste optimiste accepte un second changement, « terminé ». Cocher passe le TODO à terminé tout de suite, puis appelle l'action. Réponse `introuvable` : alerte « Ce TODO n'existe plus », la case revient à l'état de la base.
- `registre.tsx` : chaque ligne devient un `label` avec la case `Checkbox` (`@/presentation/ui`), titre sous `trait-encre` (`data-barre` quand terminé). Une case cochée est en lecture seule (`readOnly`) : pas de « décocher » (décision de `lots.md`).
- `alerte-introuvable.tsx` : repris de `AlerteIntrouvable` de la maquette, avec le bouton de fermeture. Un nouvel ajout la ferme.
- Annonce `aria-live` : « « … » terminé. ».

## 2. Critères d'acceptation et tests

| # | Critère | Test(s) | Couche |
|---|---------|---------|--------|
| 1 | Je coche un TODO en cours → affiché terminé (case cochée, titre barré) | `todo-service.test.ts` : `terminer(id)` écrit `marquerTermine(id)`, `lister()` le donne terminé | Service |
| | | `registre.test.ts` : le TODO affiché porte `termine` | Service |
| | | `ecran-todo.test.tsx` : clic sur la case → `aria-checked="true"` et `data-barre="true"` avant la réponse du serveur, action appelée avec l'identifiant | Présentation |
| 2 | TODO terminé, redémarrage → toujours terminé | `todo-repository.test.ts` : `marquerTermine` puis nouvelle connexion → `termine: true` | Données |
| | | `instances.test.ts` : ajout, `terminer`, assemblage neuf → terminé | Service + données |
| 3 | Identifiant inconnu → rien n'est modifié, message « introuvable » | `todo-service.test.ts` : `terminer("inconnu")` → `introuvable`, aucune écriture | Service |
| | | `todo-repository.test.ts` : `trouver("inconnu")` → `null` ; `marquerTermine` ne touche que la ligne visée | Données |
| | | `ecran-todo.test.tsx` : action qui répond `introuvable` → alerte « Ce TODO n'existe plus », la case redevient décochée | Présentation |
| 4 | TODO déjà terminé, marqué à nouveau → reste terminé, aucun autre TODO ne change | `todo-service.test.ts` : `terminer` d'un TODO terminé → `ok`, aucune écriture, les autres TODO inchangés | Service |
| | | `ecran-todo.test.tsx` : la case d'un TODO terminé est cochée, en lecture seule ; un clic n'appelle pas l'action | Présentation |

### Critères à préciser

- **Critère 3** : depuis l'écran, un identifiant inconnu n'arrive que si le TODO a disparu de la base entre l'affichage et le clic (autre onglet, base modifiée à la main). Le test de présentation simule cette réponse du serveur.

## 3. Maquette : ce que le lot reprend

Référence : `/maquette`, `/maquette?etat=introuvable`.

| Élément | Source | Lot 3 |
|---------|--------|-------|
| Case à cocher, ligne cliquable (`label`), survol `bg-accent/60` | `registre.tsx` (`LigneTodo`) | Repris |
| Trait d'encre sur le titre coché | `registre.tsx`, `globals.css` (`trait-encre`) | Repris |
| Alerte « Ce TODO n'existe plus », bouton de fermeture | `etats.tsx` (`AlerteIntrouvable`) | Repris |
| Annonce « « … » terminé. » | `maquette-todo.tsx` | Repris |

### Écarts

1. **Le TODO coché reste à sa place, barré.** Dans la maquette, il se replie puis passe dans « Terminés » : c'est le lot 4. Le critère 1 du lot 3 décrit cet état intermédiaire (case cochée, titre barré).
2. **Case d'un TODO terminé en lecture seule** : la maquette n'affiche jamais de TODO terminé dans un jour (ils sont dans « Terminés »). Sans « décocher », la case reste cochée et ne réagit pas.
