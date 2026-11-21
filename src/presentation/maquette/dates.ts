// Mise en forme des dates. Fuseau fixé sur Paris : le serveur (UTC sur Vercel)
// et le navigateur rangent ainsi chaque TODO sous le même jour.

const FUSEAU = "Europe/Paris";
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

/** Nombre de jours calendaires entre deux instants. */
export function ecartJours(depuis: number, jusqua: number): number {
  return Math.round((Date.parse(cleJour(jusqua)) - Date.parse(cleJour(depuis))) / JOUR);
}

/** « Vendredi 20 novembre ». */
export function dateLongue(instant: number): string {
  return majuscule(formatJour.format(instant));
}

/** Midi UTC d'un jour AAAA-MM-JJ : à Paris (UTC + 1 ou + 2), c'est toujours le même jour. */
export function instantDuJour(cle: string): number {
  return Date.parse(`${cle}T12:00:00Z`);
}

/** Le jour qui suit ou précède `cle` de `decalage` jours. */
export function decalerJour(cle: string, decalage: number): string {
  return cleJour(instantDuJour(cle) + decalage * JOUR);
}

/** Âge d'un jour, en jours calendaires à Paris : 0 aujourd'hui, 1 hier, −1 demain. */
export function ageDuJour(cle: string, maintenant: number): number {
  return Math.round((Date.parse(cleJour(maintenant)) - Date.parse(cle)) / JOUR);
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
