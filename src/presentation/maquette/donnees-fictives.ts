// Maquette : données fictives et scénarios de démonstration. Aucune donnée réelle.
import { cleJour, decalerJour } from "./dates";

export type TodoMaquette = {
  id: string;
  titre: string;
  /** Instant d'ajout, en millisecondes. */
  creeLe: number;
  termine: boolean;
  /** Jour choisi (AAAA-MM-JJ, à Paris) ; sans lui, le TODO est rangé sous son jour d'ajout. */
  jour?: string;
  /** Ajout affiché tout de suite, pendant que l'enregistrement se termine. */
  enAttente?: boolean;
};

export type Scenario =
  | "liste"
  | "vide"
  | "tout-termine"
  | "chargement"
  | "erreur-chargement"
  | "titre-vide"
  | "introuvable"
  | "enregistrement"
  | "a-venir"
  | "selecteur-date"
  | "glisser"
  | "date-invalide";

export const SCENARIOS: ReadonlyArray<{ value: Scenario; label: string }> = [
  { value: "liste", label: "Liste de travail" },
  { value: "vide", label: "Première ouverture (vide)" },
  { value: "tout-termine", label: "Tout est terminé" },
  { value: "chargement", label: "Chargement" },
  { value: "erreur-chargement", label: "Base injoignable" },
  { value: "titre-vide", label: "Titre vide refusé" },
  { value: "introuvable", label: "TODO introuvable" },
  { value: "enregistrement", label: "Enregistrement en cours" },
  { value: "a-venir", label: "Jours à venir" },
  { value: "selecteur-date", label: "Sélecteur de date ouvert" },
  { value: "glisser", label: "TODO glissé sur un jour" },
  { value: "date-invalide", label: "Date refusée" },
];

/** Revue : le TODO dont le sélecteur est ouvert (« Sauvegarder la base de recette », aujourd'hui). */
export const ID_SELECTEUR = "en-cours-14";
/** Revue : le TODO glissé (« Commander un écran pour le poste de test », hier), posé sur aujourd'hui. */
export const ID_GLISSE = "en-cours-10";

export function estScenario(valeur: unknown): valeur is Scenario {
  return SCENARIOS.some((s) => s.value === valeur);
}

const JOUR = 86_400_000;
const MINUTE = 60_000;

/** [il y a combien de jours, titre], du plus ancien au plus récent. */
const EN_COURS: ReadonlyArray<readonly [number, string]> = [
  [4, "Relancer Atelier Vercors sur le devis de reprise"],
  [
    4,
    "Préparer la démo de reprise des nomenclatures pour Atelier Vercors : jeux d'essai, script de démonstration et retour d'expérience du lot pilote",
  ],
  [4, "Renouveler le nom de domaine de la société"],
  [3, "Envoyer la facture de novembre à Alpes Composites"],
  [3, "Relire le contrat de maintenance"],
  [3, "Mettre à jour les feuilles de temps"],
  [2, "Appeler l'expert-comptable pour la TVA"],
  [2, "Tester l'import des articles depuis le PLM"],
  [2, "Planifier la migration des fichiers CAO"],
  [1, "Commander un écran pour le poste de test"],
  [1, "Répondre à l'appel d'offres Savoie Usinage"],
  [0, "Corriger le mapping des révisions d'articles"],
  [0, "Réserver la salle pour le comité du 3 décembre"],
  [0, "Sauvegarder la base de recette"],
];

const TERMINES: ReadonlyArray<readonly [number, string]> = [
  [9, "Signer le bon de commande Vercors"],
  [8, "Payer les cotisations de novembre"],
  [8, "Envoyer le compte rendu du comité de pilotage"],
  [7, "Installer la nouvelle version du connecteur PLM"],
  [6, "Archiver les jeux de données du projet Alpes"],
  [5, "Mettre à jour la page tarifs du site"],
  [5, "Valider les congés de décembre"],
  [2, "Commander les cartes de visite"],
  [1, "Corriger la faute dans le modèle de devis"],
];

function fabriquer(
  source: ReadonlyArray<readonly [number, string]>,
  maintenant: number,
  termine: boolean,
  prefixe: string,
): TodoMaquette[] {
  const aujourdhui = cleJour(maintenant);
  return source.map(([jours, titre], i) => ({
    id: `${prefixe}-${i + 1}`,
    titre,
    // Dans une même journée, l'ordre de la liste est l'ordre d'ajout.
    creeLe: maintenant - jours * JOUR - (source.length - i) * 17 * MINUTE,
    // Jour fixé : peu après minuit, les minutes retirées ci-dessus feraient basculer « aujourd'hui » sur la veille.
    jour: decalerJour(aujourdhui, -jours),
    termine,
  }));
}

export function todosDuScenario(scenario: Scenario, maintenant: number): TodoMaquette[] {
  const enCours = fabriquer(EN_COURS, maintenant, false, "en-cours");
  const termines = fabriquer(TERMINES, maintenant, true, "termine");

  switch (scenario) {
    case "vide":
    case "chargement":
    case "erreur-chargement":
      return [];
    case "tout-termine":
      return termines;
    case "enregistrement":
      return [
        ...enCours,
        ...termines,
        {
          id: "en-attente",
          titre: "Préparer l'ordre du jour du comité",
          creeLe: maintenant,
          termine: false,
          enAttente: true,
        },
      ];
    case "a-venir": {
      // Deux TODO repoussés : l'un à demain, l'autre à dans 4 jours.
      const aujourdhui = cleJour(maintenant);
      const repousses: Record<string, string> = {
        "en-cours-13": decalerJour(aujourdhui, 1),
        "en-cours-3": decalerJour(aujourdhui, 4),
      };
      return [
        ...enCours.map((todo) => (repousses[todo.id] ? { ...todo, jour: repousses[todo.id] } : todo)),
        ...termines,
      ];
    }
    default:
      return [...enCours, ...termines];
  }
}
