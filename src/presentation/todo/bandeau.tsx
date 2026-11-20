import type { ReactNode } from "react";

/** Bandeau encre de l'application : titre et date du jour. */
export function Bandeau({ date }: { date: ReactNode }) {
  return (
    <header className="bg-shell text-shell-foreground">
      <div className="mx-auto w-full max-w-4xl px-4 pt-6 pb-6 sm:px-6 sm:pt-8 sm:pb-7">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-[1.875rem] leading-[1.1]">Mes TODO</h1>
            <div className="mt-1 h-[1.125rem] text-[0.8125rem] leading-[1.125rem] font-medium text-shell-foreground/80">
              {date}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
