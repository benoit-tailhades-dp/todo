// Point d'assemblage : le seul module du service qui choisit une implémentation de `src/data`.
// La présentation ne peut pas le faire, et les services restent testables avec un faux repository.
import { clientParDefaut } from "@/data/connexion";
import { createLibsqlTodoRepository } from "@/data/todo-repository";
import { createTodoService, type TodoService } from "./todo-service";

let service: TodoService | undefined;

/** Service des TODO de l'application, branché sur la base. */
export function todoService(): TodoService {
  service ??= createTodoService(createLibsqlTodoRepository(clientParDefaut()));
  return service;
}
