import { Skeleton } from "@/presentation/ui/skeleton";
import { Bandeau } from "./bandeau";
import { Compteurs } from "./compteurs";

const LARGEURS = [["w-3/5", "w-4/5", "w-2/5"], ["w-1/2", "w-3/4"]];

/** Squelette de l'écran : l'affiche et la forme de la liste arrivent avant les données. */
export function ChargementListe() {
  return (
    <div aria-busy="true" className="flex flex-1 flex-col lg:grid lg:grid-cols-[minmax(22rem,5fr)_7fr]">
      <p className="sr-only" role="status">
        Chargement de ta liste…
      </p>
      <Bandeau
        date={<Skeleton className="mt-1 h-6 w-52 bg-shell-foreground/20 lg:h-8 lg:w-72" />}
        compteurs={<Compteurs enCours="" termines="" plusAncien="" chargement />}
        arcs={null}
      />
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-10 px-4 pt-8 sm:px-8 lg:px-14 lg:pt-10">
        <Skeleton className="h-13 w-full rounded-full lg:h-16" />
        {LARGEURS.map((lignes, i) => (
          <div key={i}>
            <div className="flex items-center gap-3 border-b-2 border-border pb-3">
              <Skeleton className="h-7 w-48" />
              <Skeleton className="ml-auto size-10 rounded-full" />
            </div>
            {lignes.map((largeur) => (
              <div key={largeur} className="flex min-h-15 items-center gap-4 border-b border-border">
                <Skeleton className="size-6 shrink-0 rounded-full" />
                <Skeleton className={`h-4 ${largeur}`} />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
