import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/presentation/ui/select";
import { SCENARIOS, type Scenario } from "./donnees-fictives";

/**
 * Outil de revue de la maquette, volontairement à part de l'interface (bordure en tirets).
 * Dans la marge droite à partir de 1400 px ; barre pleine largeur en dessous.
 */
export function BarreDemo({
  scenario,
  onScenarioChange,
}: {
  scenario: Scenario;
  onScenarioChange: (scenario: Scenario) => void;
}) {
  return (
    <aside
      aria-label="Maquette : état affiché"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-dashed border-input bg-card shadow-md min-[1400px]:inset-x-auto min-[1400px]:right-4 min-[1400px]:bottom-4 min-[1400px]:w-64 min-[1400px]:rounded-xl min-[1400px]:border"
    >
      <div className="mx-auto flex w-full max-w-4xl items-center gap-3 px-4 py-2.5 sm:max-[1399px]:px-6 min-[1400px]:flex-col min-[1400px]:items-stretch min-[1400px]:gap-2 min-[1400px]:px-3 min-[1400px]:py-3">
        <p className="shrink-0 text-[0.8125rem] leading-tight font-medium text-muted-foreground">
          <span className="block font-heading text-[0.9375rem] font-semibold text-foreground">Maquette</span>
          données fictives
        </p>
        <Select
          items={SCENARIOS}
          value={scenario}
          onValueChange={(valeur) => {
            if (valeur) onScenarioChange(valeur);
          }}
        >
          <SelectTrigger aria-label="État affiché" className="w-full max-w-60 min-w-0 min-[1400px]:max-w-none">
            <SelectValue />
          </SelectTrigger>
          <SelectContent side="top" alignItemWithTrigger={false}>
            {SCENARIOS.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </aside>
  );
}
