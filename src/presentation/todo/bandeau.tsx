import type { ReactNode } from "react";
import { MenuTheme } from "@/presentation/theme/menu-theme";

/**
 * Bandeau encre de l'application : titre, date, cellules du cartouche et bouton de thème, puis la saisie.
 * Mobile : le bouton de thème à droite du titre, les cellules dessous. Large : titre, cellules, bouton.
 */
export function Bandeau({
  date,
  cellules,
  children,
}: {
  date: ReactNode;
  cellules: ReactNode;
  children: ReactNode;
}) {
  return (
    <header className="bg-shell text-shell-foreground">
      <div className="mx-auto w-full max-w-4xl px-4 pt-6 pb-6 sm:px-6 sm:pt-8 sm:pb-7">
        <div className="mb-5 grid grid-cols-[minmax(0,1fr)_auto] items-start gap-x-3 gap-y-4 sm:mb-6 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-end">
          <div className="min-w-0">
            <h1 className="text-[1.875rem] leading-[1.1]">Mes TODO</h1>
            <div className="mt-1 h-[1.125rem] text-[0.8125rem] leading-[1.125rem] font-medium text-shell-foreground/80">
              {date}
            </div>
          </div>
          <div className="col-span-2 sm:col-span-1">{cellules}</div>
          <div className="col-start-2 row-start-1 flex sm:col-start-3 sm:self-stretch">
            <MenuTheme />
          </div>
        </div>
        {children}
      </div>
    </header>
  );
}
