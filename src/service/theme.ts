// Règles du thème de l'application. Fonctions pures et autonomes : le script du <head> les recopie
// par toString() pour poser le thème avant le premier rendu. Elles n'utilisent donc que leurs paramètres.

/** Ce que l'utilisateur choisit. */
export type ChoixTheme = "systeme" | "clair" | "sombre";
/** Ce que la page affiche. */
export type Theme = "clair" | "sombre";

export const CHOIX_THEME: ReadonlyArray<{ valeur: ChoixTheme; libelle: string }> = [
  { valeur: "systeme", libelle: "Système" },
  { valeur: "clair", libelle: "Clair" },
  { valeur: "sombre", libelle: "Sombre" },
];

/** Le choix enregistré ; rien, ou une valeur inconnue, vaut « Système », le réglage par défaut. */
export function lireChoixTheme(valeur: unknown): ChoixTheme {
  return valeur === "clair" || valeur === "sombre" ? valeur : "systeme";
}

/** « Système » suit le réglage du système ; « Clair » et « Sombre » l'ignorent. */
export function themeAffiche(choix: ChoixTheme, systemeSombre: boolean): Theme {
  if (choix === "systeme") return systemeSombre ? "sombre" : "clair";
  return choix;
}
