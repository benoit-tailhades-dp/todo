import type { TodoRepository } from "@/data/todo-repository";
import type { Todo } from "./registre";
import { validerTitre } from "./titre";

export type ResultatAjout = { ok: true; todo: Todo } | { ok: false; erreur: "titre-vide" };

export type ResultatTerminer = { ok: true } | { ok: false; erreur: "introuvable" };

export type TodoService = {
  /** Tous les TODO enregistrés. Le registre affiché se compose avec `composerRegistre`. */
  lister(): Promise<Todo[]>;
  /** Enregistre un TODO en cours, daté de `maintenant`, si son titre est valide. */
  ajouter(saisie: unknown, maintenant: number): Promise<ResultatAjout>;
  /** Marque terminé un TODO existant. Un TODO déjà terminé le reste, sans écriture. */
  terminer(id: unknown): Promise<ResultatTerminer>;
};

export function createTodoService(repository: TodoRepository): TodoService {
  return {
    async lister() {
      return repository.listerTous();
    },

    async ajouter(saisie, maintenant) {
      const verdict = validerTitre(saisie);
      if (!verdict.ok) return verdict;
      const todo: Todo = { id: crypto.randomUUID(), titre: verdict.titre, creeLe: maintenant, termine: false };
      await repository.ajouter(todo);
      return { ok: true, todo };
    },

    async terminer(id) {
      const todo = typeof id === "string" ? await repository.trouver(id) : null;
      if (!todo) return { ok: false, erreur: "introuvable" };
      if (!todo.termine) await repository.marquerTermine(todo.id);
      return { ok: true };
    },
  };
}
