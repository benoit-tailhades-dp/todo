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

export type Compteurs = {
  enCours: number;
  termines: number;
  /** Âge en jours du plus ancien TODO en cours, `null` s'il n'y en a pas. */
  plusAncien: number | null;
};

/** « vide » : aucun TODO ; « tout-termine » : que des TODO terminés ; « liste » : au moins un en cours. */
export type EtatRegistre = "vide" | "tout-termine" | "liste";

export type Registre = {
  /** « Vendredi 20 novembre ». */
  dateDuJour: string;
  /** Les TODO en cours, par jour d'ajout, du plus ancien au plus récent. */
  jours: JourDeTodos[];
  /** Les TODO terminés, du plus ancien au plus récent. */
  termines: TodoAffiche[];
  compteurs: Compteurs;
  etat: EtatRegistre;
};

function affiche(todo: Todo): TodoAffiche {
  return { id: todo.id, titre: todo.titre, termine: todo.termine };
}

/** `todos` déjà triés du plus ancien au plus récent. */
function grouperParJour(todos: Todo[], maintenant: number): JourDeTodos[] {
  const jours: JourDeTodos[] = [];
  for (const todo of todos) {
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
    jour.todos.push(affiche(todo));
    jour.nombre = jour.todos.length;
  }
  return jours;
}

function etatDu(enCours: number, termines: number): EtatRegistre {
  if (enCours > 0) return "liste";
  return termines > 0 ? "tout-termine" : "vide";
}

/**
 * Le registre du jour : les TODO en cours rangés par jour d'ajout, puis les terminés à part,
 * tous du plus ancien au plus récent, avec les compteurs du cartouche.
 */
export function composerRegistre(todos: Todo[], maintenant: number): Registre {
  const tries = todos.toSorted((a, b) => a.creeLe - b.creeLe);
  const enCours = tries.filter((todo) => !todo.termine);
  const termines = tries.filter((todo) => todo.termine);
  const plusAncien = enCours.at(0);
  return {
    dateDuJour: dateLongue(maintenant),
    jours: grouperParJour(enCours, maintenant),
    termines: termines.map(affiche),
    compteurs: {
      enCours: enCours.length,
      termines: termines.length,
      plusAncien: plusAncien ? ecartJours(plusAncien.creeLe, maintenant) : null,
    },
    etat: etatDu(enCours.length, termines.length),
  };
}
