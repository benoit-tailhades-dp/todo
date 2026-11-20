// Composition du registre affiché : tri et groupement par jour de Paris. Fonctions pures, sans base :
// le navigateur les rappelle pour afficher un changement avant la réponse du serveur.
import { cleJour, dateLongue, ecartJours, precisionDuJour, titreDuJour } from "./jours";

/** Un TODO, tel que le service le donne à la présentation. */
export type Todo = {
  id: string;
  titre: string;
  /** Instant d'ajout, en millisecondes depuis l'époque Unix (UTC). */
  creeLe: number;
  termine: boolean;
};

export type TodoAffiche = { id: string; titre: string; termine: boolean };

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

function grouperParJour(todos: Todo[], maintenant: number): JourDeTodos[] {
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
    jour.todos.push({ id: todo.id, titre: todo.titre, termine: todo.termine });
    jour.nombre = jour.todos.length;
  }
  return jours;
}

/** Le registre du jour : les TODO rangés par jour d'ajout, du plus ancien au plus récent. */
export function composerRegistre(todos: Todo[], maintenant: number): Registre {
  return { dateDuJour: dateLongue(maintenant), jours: grouperParJour(todos, maintenant) };
}
