"use client";

import { useState } from "react";
import { cn } from "@/presentation/lib/utils";
import { Skeleton } from "@/presentation/ui/skeleton";

/** Chiffre qui roule sur place quand sa valeur change (pas au premier affichage). */
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

/**
 * Les compteurs de l'affiche : le nombre de TODO en cours en chiffre géant, puis une ligne
 * « 9 terminés · le plus ancien 4 j ». Chaque libellé précède sa valeur dans le code (lecteurs d'écran),
 * l'ordre visuel est inversé là où le chiffre se lit d'abord.
 */
export function Compteurs({
  enCours,
  termines,
  plusAncien,
  chargement = false,
}: {
  enCours: string;
  termines: string;
  plusAncien: string;
  chargement?: boolean;
}) {
  return (
    <dl className="flex flex-col">
      <div className="flex flex-col-reverse">
        <dt className="mt-1 text-[1.5rem] leading-none font-extrabold tracking-tight lowercase sm:text-[2rem] lg:mt-3 lg:text-[2.75rem]">
          En cours
        </dt>
        <dd className="-ml-[0.04em] text-[6.5rem] leading-[0.8] font-black tracking-[-0.04em] tabular-nums [font-stretch:115%] sm:text-[8rem] lg:text-[clamp(8rem,min(15vw,30dvh),15rem)]">
          {chargement ? (
            <Skeleton className="h-[0.8em] w-[1.2em] rounded-2xl bg-shell-foreground/20" />
          ) : (
            <ChiffreAnime valeur={enCours} />
          )}
        </dd>
      </div>
      <div className="mt-4 flex flex-wrap items-baseline gap-x-6 gap-y-1 text-[0.9375rem] font-medium lg:mt-7 lg:text-base">
        <div className="flex flex-row-reverse items-baseline gap-1.5">
          <dt className="lowercase">Terminés</dt>
          <dd className="text-[1.375rem] leading-none font-extrabold tabular-nums lg:text-[1.75rem]">
            {chargement ? <Skeleton className="h-5 w-6 bg-shell-foreground/20" /> : <ChiffreAnime valeur={termines} />}
          </dd>
        </div>
        <div className="flex items-baseline gap-1.5">
          <dt className="lowercase">Le plus ancien</dt>
          <dd className="text-[1.375rem] leading-none font-extrabold tabular-nums lg:text-[1.75rem]">
            {chargement ? <Skeleton className="h-5 w-8 bg-shell-foreground/20" /> : <ChiffreAnime valeur={plusAncien} />}
          </dd>
        </div>
      </div>
    </dl>
  );
}
