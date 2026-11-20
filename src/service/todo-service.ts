import type { TodoRepository } from "@/data/todo-repository";
import type { Todo } from "./registre";
import { validerTitre } from "./titre";

export type ResultatAjout = { ok: true; todo: Todo } | { ok: false; erreur: "titre-vide" };

export type TodoService = {
  /** Tous les TODO enregistrés. Le registre affiché se compose avec `composerRegistre`. */
  lister(): Promise<Todo[]>;
  /** Enregistre un TODO en cours, daté de `maintenant`, si son titre est valide. */
  ajouter(saisie: unknown, maintenant: number): Promise<ResultatAjout>;
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
  };
}
