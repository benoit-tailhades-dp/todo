// Calendrier de l'application. Les jours se calculent à l'heure de Paris : le serveur (UTC sur Vercel)
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

/** Nombre de jours calendaires, à Paris, entre deux instants. */
export function ecartJours(depuis: number, jusqua: number): number {
  return Math.round((Date.parse(cleJour(jusqua)) - Date.parse(cleJour(depuis))) / JOUR);
}

/** « Vendredi 20 novembre ». */
export function dateLongue(instant: number): string {
  return majuscule(formatJour.format(instant));
}

/** « Aujourd'hui », « Hier » ou « Lundi 16 novembre ». */
export function titreDuJour(instant: number, maintenant: number): string {
  const ecart = ecartJours(instant, maintenant);
  if (ecart === 0) return "Aujourd'hui";
  if (ecart === 1) return "Hier";
  return dateLongue(instant);
}

/** Date en clair à côté de « Aujourd'hui » et « Hier » ; rien pour les autres jours, déjà datés. */
export function precisionDuJour(instant: number, maintenant: number): string | null {
  return ecartJours(instant, maintenant) <= 1 ? formatJour.format(instant) : null;
}
