import { cn } from "@/presentation/lib/utils";
import type { EtatRegistre, JourDeTodos } from "@/service/registre";

const CENTRE = 200;
const RAYON_MAX = 196;
/** Épaisseur maximale d'un arc et espace entre deux arcs, dans le repère 400 × 400. */
const EPAISSEUR_MAX = 30;
const ESPACE = 10;
/** Au-delà, les jours les plus récents ne tiennent plus : le centre reste vide. */
const ARCS_MAX = 9;

type Arc = { cle: string; rayon: number; epaisseur: number; part: number; traine: boolean };

function arcsDe(jours: JourDeTodos[]): Arc[] {
  const affiches = jours.slice(0, ARCS_MAX);
  const n = Math.max(affiches.length, 1);
  const epaisseur = Math.min(EPAISSEUR_MAX, (RAYON_MAX - 40) / n - ESPACE);
  return affiches.map((jour, i) => ({
    cle: jour.cle,
    rayon: RAYON_MAX - epaisseur / 2 - i * (epaisseur + ESPACE),
    epaisseur,
    part: (jour.termines / (jour.termines + jour.nombre)) * 100,
    traine: jour.age >= 3,
  }));
}

function description(jours: JourDeTodos[], etat: EtatRegistre): string {
  if (etat === "tout-termine") return "Tout est terminé : le cercle est fermé.";
  if (etat === "vide") return "Aucun TODO pour l'instant.";
  return `Un arc par jour, la part terminée de chacun : ${jours
    .map((j) => `${j.titre}, ${j.termines} sur ${j.termines + j.nombre}`)
    .join(" ; ")}.`;
}

/**
 * Les arcs de l'affiche : un cercle par jour en cours, du plus ancien (dehors) au plus récent (dedans).
 * La longueur de l'arc suit la part terminée du jour ; un jour qui traîne (3 jours et plus) passe au noir.
 * Tout terminé : un seul cercle fermé. Les arcs se dessinent à l'arrivée et avancent quand on coche.
 */
export function ArcsDuJour({
  jours,
  etat,
  className,
}: {
  jours: JourDeTodos[];
  etat: EtatRegistre;
  className?: string;
}) {
  const arcs = etat === "liste" ? arcsDe(jours) : [];
  const ferme = etat === "tout-termine";
  return (
    <svg
      viewBox="0 0 400 400"
      role="img"
      aria-label={description(jours, etat)}
      className={cn("pointer-events-none", className)}
    >
      <g fill="none" transform={`rotate(180 ${CENTRE} ${CENTRE})`}>
        {arcs.length === 0 ? (
          <circle
            cx={CENTRE}
            cy={CENTRE}
            r={RAYON_MAX - EPAISSEUR_MAX}
            pathLength={100}
            strokeWidth={EPAISSEUR_MAX * 2}
            style={{ strokeDasharray: "100 100" }}
            className="stroke-shell-foreground/25 transition-[stroke-dasharray] duration-700 ease-trait motion-reduce:transition-none data-ferme:stroke-shell-foreground starting:[stroke-dasharray:0_100]"
            data-ferme={ferme || undefined}
          />
        ) : null}
        {arcs.map((arc) => (
          <g key={arc.cle}>
            <circle
              cx={CENTRE}
              cy={CENTRE}
              r={arc.rayon}
              strokeWidth={arc.epaisseur}
              className="stroke-shell-foreground/25 transition-[r,stroke-width] duration-500 ease-trait motion-reduce:transition-none"
            />
            <circle
              cx={CENTRE}
              cy={CENTRE}
              r={arc.rayon}
              strokeWidth={arc.epaisseur}
              pathLength={100}
              style={{ strokeDasharray: `${arc.part} 100` }}
              className={cn(
                "transition-[stroke-dasharray,r,stroke-width] duration-700 ease-trait motion-reduce:transition-none starting:[stroke-dasharray:0_100]",
                arc.traine ? "stroke-shell-accent" : "stroke-shell-foreground",
              )}
            />
          </g>
        ))}
      </g>
    </svg>
  );
}
