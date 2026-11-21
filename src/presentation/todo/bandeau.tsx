import type { ReactNode } from "react";
import { SelecteurTheme } from "@/presentation/theme/selecteur-theme";

/**
 * Le champ vermillon de l'affiche : titre et sélecteur de thème, la date, puis les compteurs et les arcs du jour.
 * Téléphone : bande en tête de page, les arcs à droite du chiffre. Large : colonne collée à gauche sur
 * toute la hauteur, les arcs occupent la place qui reste sous les compteurs, recadrés par le bord.
 */
export function Bandeau({
  date,
  compteurs,
  arcs,
  legende,
}: {
  date: ReactNode;
  compteurs: ReactNode;
  arcs: ReactNode;
  /** Ce que montrent les arcs, en une ligne. */
  legende?: ReactNode;
}) {
  return (
    <header className="relative isolate overflow-hidden bg-shell text-shell-foreground lg:sticky lg:top-0 lg:flex lg:h-dvh lg:flex-col">
      {/* Le titre et le sélecteur de thème sur une ligne ; la date dessous, sur toute la largeur. */}
      <div className="px-4 pt-4 sm:px-8 lg:px-12 lg:pt-9">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-[1.0625rem] leading-tight font-extrabold lg:text-[1.25rem]">Mes TODO</h1>
          <SelecteurTheme />
        </div>
        <div className="mt-1 min-h-7 text-[1.375rem] leading-tight font-extrabold tracking-tight [font-stretch:105%] sm:text-[1.625rem] lg:mt-1.5 lg:min-h-9 lg:text-[2rem]">
          {date}
        </div>
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-2 px-4 pt-5 pb-6 sm:px-8 lg:block lg:px-12 lg:pt-[clamp(1.5rem,7dvh,5rem)] lg:pb-0">
        <div className="relative z-10">{compteurs}</div>
        {/* Téléphone : les arcs recadrés dans une fenêtre du champ, jamais contre la page. */}
        <div aria-hidden className="relative -mr-4 size-36 overflow-hidden sm:-mr-8 sm:size-48 lg:hidden">
          <div className="absolute -right-8 -bottom-8 size-44 sm:-right-10 sm:-bottom-10 sm:size-58">{arcs}</div>
        </div>
      </div>
      {legende ? (
        <p className="px-4 pb-5 text-[0.8125rem] font-semibold sm:px-8 lg:px-12 lg:pt-4 lg:pb-0 lg:text-[0.875rem]">
          {legende}
        </p>
      ) : null}

      {/* Large : les arcs prennent la place restante et débordent par le bas de l'écran ; à droite, une marge
          vermillon les tient loin de la page (l'arc noir s'y perdrait en sombre). */}
      <div className="relative mt-8 mr-6 hidden min-h-48 flex-1 overflow-hidden [container-type:size] lg:block">
        <div className="absolute -right-[10%] -bottom-[18%] w-[min(114cqh,118cqw)]">{arcs}</div>
      </div>
    </header>
  );
}
