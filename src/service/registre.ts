// Composition du registre affiché : tri et groupement par jour de Paris. Fonctions pures, sans base :
// le navigateur les rappelle pour afficher un changement avant la réponse du serveur.
import { ageDuJour, cleJour, dateLongue, precisionDuJour, titreDuJour } from "./jours";

/** Un TODO, tel que le service le donne à la présentation. */
export type Todo = {
  id: string;
  titre: string;
  /** Instant d'ajout, en millisecondes depuis l'époque Unix (UTC). */
  creeLe: number;
  termine: boolean;
  /** Jour choisi, AAAA-MM-JJ. Absent : le jour d'ajout. */
  jour?: string;
};

export type TodoAffiche = { id: string; titre: string; termine: boolean };

/** Les TODO d'un même jour, à Paris. */
export type JourDeTodos = {
  /** Jour au format AAAA-MM-JJ. */
  cle: string;
  /** « Aujourd'hui », « Hier », « Demain » ou « Lundi 16 novembre ». */
  titre: string;
  /** Date en clair à côté de « Aujourd'hui », « Hier » et « Demain », sinon `null`. */
  precision: string | null;
  /** Âge du jour, en jours calendaires : négatif pour un jour à venir. */
  age: number;
  nombre: number;
  /** Nombre de TODO terminés de ce jour : avec `nombre`, la part déjà faite du jour. */
  termines: number;
  todos: TodoAffiche[];
};

export type Compteurs = {
  enCours: number;
  termines: number;
  /** Âge en jours du plus ancien jour affiché, `null` sans TODO en cours ou s'ils sont tous à venir. */
  plusAncien: number | null;
};

/** « vide » : aucun TODO ; « tout-termine » : que des TODO terminés ; « liste » : au moins un en cours. */
export type EtatRegistre = "vide" | "tout-termine" | "liste";

export type Registre = {
  /** « Vendredi 20 novembre ». */
  dateDuJour: string;
  /** Les TODO en cours, par jour, du plus ancien au plus futur. */
  jours: JourDeTodos[];
  /** Les TODO terminés, du plus ancien au plus récent. */
  termines: TodoAffiche[];
  compteurs: Compteurs;
  etat: EtatRegistre;
};

function affiche(todo: Todo): TodoAffiche {
  return { id: todo.id, titre: todo.titre, termine: todo.termine };
}

/** Jour d'un TODO : celui qu'on lui a choisi, sinon son jour d'ajout. */
export function jourDuTodo(todo: Todo): string {
  return todo.jour ?? cleJour(todo.creeLe);
}

/** Nombre de TODO terminés par jour. */
function compterParJour(termines: Todo[]): Map<string, number> {
  const parJour = new Map<string, number>();
  for (const todo of termines) {
    const cle = jourDuTodo(todo);
    parJour.set(cle, (parJour.get(cle) ?? 0) + 1);
  }
  return parJour;
}

/** Jours du plus ancien au plus futur ; dans un jour, l'ordre de `todos`, déjà triés par ajout. */
function grouperParJour(todos: Todo[], termines: Todo[], maintenant: number): JourDeTodos[] {
  const terminesParJour = compterParJour(termines);
  const parJour = new Map<string, Todo[]>();
  for (const todo of todos) {
    const cle = jourDuTodo(todo);
    const liste = parJour.get(cle);
    if (liste) liste.push(todo);
    else parJour.set(cle, [todo]);
  }
  // Les clés AAAA-MM-JJ se trient comme des dates.
  return [...parJour]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([cle, liste]) => ({
      cle,
      titre: titreDuJour(cle, maintenant),
      precision: precisionDuJour(cle, maintenant),
      age: ageDuJour(cle, maintenant),
      nombre: liste.length,
      termines: terminesParJour.get(cle) ?? 0,
      todos: liste.map(affiche),
    }));
}

function etatDu(enCours: number, termines: number): EtatRegistre {
  if (enCours > 0) return "liste";
  return termines > 0 ? "tout-termine" : "vide";
}

/**
 * Le registre du jour : les TODO en cours rangés par jour, du plus ancien au plus futur, puis les terminés
 * à part, du plus ancien au plus récent, avec les compteurs du cartouche.
 */
export function composerRegistre(todos: Todo[], maintenant: number): Registre {
  const tries = todos.toSorted((a, b) => a.creeLe - b.creeLe);
  const enCours = tries.filter((todo) => !todo.termine);
  const termines = tries.filter((todo) => todo.termine);
  const jours = grouperParJour(enCours, termines, maintenant);
  // Le plus ancien suit le jour affiché : un TODO repoussé à demain n'est plus en retard.
  const age = jours.at(0)?.age;
  return {
    dateDuJour: dateLongue(maintenant),
    jours,
    termines: termines.map(affiche),
    compteurs: {
      enCours: enCours.length,
      termines: termines.length,
      plusAncien: age !== undefined && age >= 0 ? age : null,
    },
    etat: etatDu(enCours.length, termines.length),
  };
}
