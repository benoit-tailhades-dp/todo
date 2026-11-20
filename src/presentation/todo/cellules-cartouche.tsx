"use client";

import { useState } from "react";
import { cn } from "@/presentation/lib/utils";
import { Skeleton } from "@/presentation/ui/skeleton";

export type Cellule = {
  libelle: string;
  valeur: string;
  /** Chiffre surligné : la donnée qu'on lit en premier. */
  enAvant?: boolean;
};

/** Chiffre qui glisse en place quand sa valeur change (pas au premier affichage). */
export function ChiffreAnime({ valeur }: { valeur: string }) {
  const [precedente, setPrecedente] = useState(valeur);
  const [anime, setAnime] = useState(false);
  if (valeur !== precedente) {
    setPrecedente(valeur);
    setAnime(true);
  }
  return (
    <span key={valeur} className={cn("inline-block", anime && "animate-chiffre")}>
      {valeur}
    </span>
  );
}

/** Cellules du cartouche : des compartiments à filets, comme le cartouche d'un plan. */
export function CellulesCartouche({
  cellules,
  chargement = false,
}: {
  cellules: Cellule[];
  chargement?: boolean;
}) {
  return (
    <dl className="grid grid-cols-3 border border-shell-foreground/35 sm:flex">
      {cellules.map((cellule, i) => (
        <div
          key={cellule.libelle}
          className={cn(
            "min-w-0 px-3 py-2 sm:min-w-28 sm:px-4",
            i > 0 && "border-l border-shell-foreground/35",
          )}
        >
          <dt className="truncate text-xs font-medium text-shell-foreground/80">{cellule.libelle}</dt>
          <dd
            className={cn(
              "h-[1.875rem] font-heading text-2xl leading-tight font-semibold tabular-nums",
              cellule.enAvant && "text-signature",
            )}
          >
            {chargement ? (
              <Skeleton className="inline-block h-5 w-10 align-middle bg-shell-foreground/20" />
            ) : (
              <ChiffreAnime valeur={cellule.valeur} />
            )}
          </dd>
        </div>
      ))}
    </dl>
  );
}
