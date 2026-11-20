// Règle du titre d'un TODO. Fonction pure : le navigateur l'appelle pour répondre tout de suite,
// le serveur la rappelle avant d'enregistrer.

export type VerdictTitre = { ok: true; titre: string } | { ok: false; erreur: "titre-vide" };

/** Un TODO a un titre non vide, sans les espaces qui l'entourent. */
export function validerTitre(saisie: unknown): VerdictTitre {
  const titre = typeof saisie === "string" ? saisie.trim() : "";
  return titre === "" ? { ok: false, erreur: "titre-vide" } : { ok: true, titre };
}
