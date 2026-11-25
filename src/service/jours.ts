// Calendrier de l'application. Les jours se calculent à l'heure de Paris : le serveur (UTC sur Vercel)
// et le navigateur rangent ainsi chaque TODO sous le même jour.

/** Fuseau de l'application (ADR 003) : le calendrier de la présentation le reprend pour compter les mêmes jours. */
export const FUSEAU = "Europe/Paris";
const JOUR = 86_400_000;

const formatCle = new Intl.DateTimeFormat("fr-FR", {
  timeZone: FUSEAU,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const formatJour = new Intl.DateTimeFormat("fr-FR", {
  timeZone: FUSEAU,
  weekday: "long",
  day: "numeric",
  month: "long",
});

function majuscule(texte: string): string {
  return texte.charAt(0).toUpperCase() + texte.slice(1);
}

/** Jour calendaire à Paris, au format AAAA-MM-JJ. */
export function cleJour(instant: number): string {
  const parties = Object.fromEntries(
    formatCle.formatToParts(instant).map((p) => [p.type, p.value]),
  );
  return `${parties.year}-${parties.month}-${parties.day}`;
}

/** Midi UTC d'un jour AAAA-MM-JJ : à Paris (UTC + 1 ou + 2), c'est toujours ce jour-là. */
export function instantDuJour(cle: string): number {
  return Date.parse(`${cle}T12:00:00Z`);
}

/** Âge d'un jour AAAA-MM-JJ, en jours calendaires à Paris : 0 aujourd'hui, 1 hier, −1 demain. */
export function ageDuJour(cle: string, maintenant: number): number {
  return Math.round((Date.parse(cleJour(maintenant)) - Date.parse(cle)) / JOUR);
}

/** « Vendredi 20 novembre ». */
export function dateLongue(instant: number): string {
  return majuscule(formatJour.format(instant));
}

/** « Aujourd'hui », « Hier », « Demain » ou « Lundi 16 novembre ». */
export function titreDuJour(cle: string, maintenant: number): string {
  const age = ageDuJour(cle, maintenant);
  if (age === 0) return "Aujourd'hui";
  if (age === 1) return "Hier";
  if (age === -1) return "Demain";
  return dateLongue(instantDuJour(cle));
}

/** Date en clair à côté de « Aujourd'hui », « Hier » et « Demain » ; rien pour les autres jours, déjà datés. */
export function precisionDuJour(cle: string, maintenant: number): string | null {
  return Math.abs(ageDuJour(cle, maintenant)) <= 1 ? formatJour.format(instantDuJour(cle)) : null;
}

export type VerdictJour = { ok: true; jour: string } | { ok: false; erreur: "date-invalide" };

/**
 * Un jour choisi est une date du calendrier, AAAA-MM-JJ, qui existe. Une date et non un instant :
 * aucun fuseau ne peut la faire glisser d'un jour.
 */
export function validerJour(saisie: unknown): VerdictJour {
  if (typeof saisie !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(saisie)) return { ok: false, erreur: "date-invalide" };
  const instant = instantDuJour(saisie);
  // Date.parse accepte le 30 février et le reporte au 2 mars : le jour relu doit être le jour saisi.
  if (Number.isNaN(instant) || cleJour(instant) !== saisie) return { ok: false, erreur: "date-invalide" };
  return { ok: true, jour: saisie };
}
