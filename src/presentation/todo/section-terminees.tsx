import { ChevronDown } from "lucide-react";
import { Checkbox } from "@/presentation/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/presentation/ui/collapsible";
import type { TodoAffiche } from "@/service/registre";
import { ChiffreAnime } from "./compteurs";

/** Les TODO terminés, repliés sous un en-tête qui garde leur nombre en vue. */
export function SectionTerminees({
  termines,
  ouvert,
  onOuvertChange,
  className,
}: {
  termines: TodoAffiche[];
  ouvert: boolean;
  onOuvertChange: (ouvert: boolean) => void;
  className?: string;
}) {
  return (
    <Collapsible open={ouvert} onOpenChange={onOuvertChange} className={className}>
      <h2>
        <CollapsibleTrigger className="group/terminees flex w-full items-center gap-3 border-b-2 border-foreground pb-3 text-left outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-solid focus-visible:outline-ring">
          <span className="font-heading text-[1.625rem] leading-none font-extrabold tracking-tight sm:text-[2rem]">
            Terminés
          </span>
          <span className="flex h-10 min-w-10 items-center justify-center rounded-full bg-signature px-2 text-[0.875rem] font-extrabold text-signature-foreground tabular-nums">
            <ChiffreAnime valeur={String(termines.length)} />
          </span>
          <span className="ml-auto flex size-10 items-center justify-center rounded-full border-2 border-border transition-colors duration-150 group-hover/terminees:border-foreground">
            <ChevronDown
              className="size-5 transition-transform duration-300 ease-trait group-data-panel-open/terminees:rotate-180"
              aria-hidden
            />
          </span>
        </CollapsibleTrigger>
      </h2>
      <CollapsibleContent className="h-(--collapsible-panel-height) overflow-hidden transition-[height] duration-200 ease-trait data-ending-style:h-0 data-starting-style:h-0 motion-reduce:transition-none">
        <ul aria-label="TODO terminés">
          {termines.map((todo) => (
            <li key={todo.id} data-todo-id={todo.id} className="border-b border-border">
              <label className="flex min-h-14 items-center gap-4 py-3 text-muted-foreground">
                {/* Pas de « décocher » : la case reste cochée, en lecture seule. */}
                <Checkbox
                  checked
                  readOnly
                  tabIndex={-1}
                  className="size-6 data-checked:border-muted-foreground data-checked:bg-muted-foreground data-checked:text-background *:data-[slot=checkbox-indicator]:animate-none"
                />
                <span
                  data-titre=""
                  data-barre="true"
                  className="min-w-0 flex-1 text-[1.0625rem] break-words line-through decoration-signature decoration-2"
                >
                  {todo.titre}
                </span>
              </label>
            </li>
          ))}
        </ul>
      </CollapsibleContent>
    </Collapsible>
  );
}
