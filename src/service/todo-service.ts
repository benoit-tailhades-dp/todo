import type { TodoEnregistre, TodoRepository } from "@/data/todo-repository";
import { cleJour, dateLongue, ecartJours, precisionDuJour, titreDuJour } from "./jours";

export type TodoAffiche = { id: string; titre: string };

/** Les TODO ajoutés un même jour, à Paris. */
export type JourDeTodos = {
  /** Jour au format AAAA-MM-JJ. */
  cle: string;
  /** « Aujourd'hui », « Hier » ou « Lundi 16 novembre ». */
  titre: string;
  /** Date en clair à côté de « Aujourd'hui » et « Hier », sinon `null`. */
  precision: string | null;
  /** Âge du jour, en jours calendaires. */
  age: number;
  nombre: number;
  todos: TodoAffiche[];
};

export type Registre = {
  /** « Vendredi 20 novembre ». */
  dateDuJour: string;
  /** Du plus ancien au plus récent. */
  jours: JourDeTodos[];
};

export type TodoService = {
  consulter(maintenant: number): Promise<Registre>;
};

function grouperParJour(todos: TodoEnregistre[], maintenant: number): JourDeTodos[] {
  const tries = todos.toSorted((a, b) => a.creeLe - b.creeLe);
  const jours: JourDeTodos[] = [];
  for (const todo of tries) {
    const cle = cleJour(todo.creeLe);
    let jour = jours.at(-1);
    if (jour?.cle !== cle) {
      jour = {
        cle,
        titre: titreDuJour(todo.creeLe, maintenant),
        precision: precisionDuJour(todo.creeLe, maintenant),
        age: ecartJours(todo.creeLe, maintenant),
        nombre: 0,
        todos: [],
      };
      jours.push(jour);
    }
    jour.todos.push({ id: todo.id, titre: todo.titre });
    jour.nombre = jour.todos.length;
  }
  return jours;
}

export function createTodoService(repository: TodoRepository): TodoService {
  return {
    async consulter(maintenant) {
      const todos = await repository.listerTous();
      return { dateDuJour: dateLongue(maintenant), jours: grouperParJour(todos, maintenant) };
    },
  };
}
