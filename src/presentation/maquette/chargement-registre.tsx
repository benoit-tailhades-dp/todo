import { Skeleton } from "@/presentation/ui/skeleton";
import { Bandeau } from "./bandeau";
import { CellulesCartouche } from "./cellules-cartouche";
import { MenuTheme } from "@/presentation/theme/menu-theme";

const CELLULES = [
  { libelle: "En cours", valeur: "", enAvant: true },
  { libelle: "Terminés", valeur: "" },
  { libelle: "Le plus ancien", valeur: "" },
];

const LARGEURS = [["w-3/5", "w-4/5", "w-2/5"], ["w-1/2", "w-3/4"]];

/** Squelette du registre : la forme de la page arrive avant les données. */
export function ChargementRegistre() {
  return (
    <div aria-busy="true" className="flex flex-1 flex-col">
      <p className="sr-only" role="status">
        Chargement de ta liste…
      </p>
      <Bandeau
        date={<Skeleton className="mt-0.5 h-3.5 w-36 bg-shell-foreground/20" />}
        cellules={<CellulesCartouche cellules={CELLULES} chargement />}
        theme={<MenuTheme />}
      >
        <Skeleton className="h-11 w-full rounded-lg bg-shell-foreground/20" />
        <Skeleton className="mt-3.5 h-3 w-28 bg-shell-foreground/15" />
      </Bandeau>
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 pt-6 sm:px-6 sm:pt-8">
        {LARGEURS.map((lignes, i) => (
          <div key={i}>
            <div className="flex items-baseline gap-2.5 border-b border-input pb-2">
              <Skeleton className="h-4 w-40 bg-border" />
              <Skeleton className="h-3 w-20 bg-border/70" />
            </div>
            <div className="rounded-b-xl border border-t-0 border-border bg-card">
              {lignes.map((largeur) => (
                <div
                  key={largeur}
                  className="flex min-h-[46px] items-center gap-3.5 border-t border-border px-3.5 first:border-t-0"
                >
                  <Skeleton className="size-5 shrink-0" />
                  <Skeleton className={`h-3.5 ${largeur}`} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
