import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/presentation/lib/utils";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/presentation/ui/collapsible";
import type { TodoMaquette } from "./donnees-fictives";
import { ChiffreAnime } from "./cellules-cartouche";

/** Les TODO terminés, repliés sous un en-tête qui garde leur nombre en vue. */
export function SectionTerminees({
  termines,
  ouvert,
  onOuvertChange,
  className,
}: {
  termines: TodoMaquette[];
  ouvert: boolean;
  onOuvertChange: (ouvert: boolean) => void;
  className?: string;
}) {
  return (
    <Collapsible open={ouvert} onOpenChange={onOuvertChange} className={className}>
      <h2>
        <CollapsibleTrigger className="group/terminees flex h-11 w-full items-center gap-2.5 rounded-xl border border-border bg-muted px-3.5 text-left transition-colors duration-150 outline-none hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-ring focus-visible:ring-6 focus-visible:ring-signature data-panel-open:rounded-b-none">
          <span className="font-heading text-base font-semibold">Terminés</span>
          <span className="text-[0.8125rem] font-medium text-muted-foreground tabular-nums">
            <ChiffreAnime valeur={String(termines.length)} />
          </span>
          <ChevronDown
            className="ml-auto size-4 text-muted-foreground transition-transform duration-200 ease-trait group-data-panel-open/terminees:rotate-180"
            aria-hidden
          />
        </CollapsibleTrigger>
      </h2>
      <CollapsibleContent className="h-(--collapsible-panel-height) overflow-hidden transition-[height] duration-200 ease-trait data-ending-style:h-0 data-starting-style:h-0 motion-reduce:transition-none">
        <ul className="rounded-b-xl border border-t-0 border-border bg-card">
          {termines.map((todo) => (
            <li
              key={todo.id}
              className="flex min-h-11 items-center gap-3.5 border-t border-border px-3.5 py-2 text-muted-foreground first:border-t-0"
            >
              <span
                aria-hidden
                className={cn(
                  "flex size-5 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground opacity-70",
                )}
              >
                <Check className="size-3.5 stroke-3" />
              </span>
              <span className="min-w-0 flex-1 break-words line-through decoration-primary decoration-2">
                {todo.titre}
              </span>
              <span className="sr-only">, terminé</span>
            </li>
          ))}
        </ul>
      </CollapsibleContent>
    </Collapsible>
  );
}
