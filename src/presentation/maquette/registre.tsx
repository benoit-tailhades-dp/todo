import { LoaderCircle } from "lucide-react";
import { cn } from "@/presentation/lib/utils";
import { Checkbox } from "@/presentation/ui/checkbox";
import type { TodoMaquette } from "./donnees-fictives";
import { cleJour, ecartJours, precisionDuJour, titreDuJour } from "./dates";

/** « barre » : le trait d'encre passe sur le titre ; « sortie » : la ligne se replie. */
export type Phase = "barre" | "sortie";

type Groupe = { cle: string; premier: number; todos: TodoMaquette[] };

function grouperParJour(todos: TodoMaquette[]): Groupe[] {
  const groupes: Groupe[] = [];
  for (const todo of todos) {
    const cle = cleJour(todo.creeLe);
    const dernier = groupes.at(-1);
    if (dernier?.cle === cle) dernier.todos.push(todo);
    else groupes.push({ cle, premier: todo.creeLe, todos: [todo] });
  }
  return groupes;
}

/** L'encre monte avec l'âge : un jour qui traîne se repère d'un coup d'œil. */
function teinteAge(jours: number): string {
  if (jours >= 4) return "bg-primary text-primary-foreground";
  if (jours === 3) return "bg-primary/15 text-primary";
  if (jours === 2) return "bg-accent text-foreground";
  return "text-muted-foreground";
}

function CelluleEnTete({
  libelle,
  className,
  children,
}: {
  libelle: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex w-14 flex-col justify-center border-l border-input px-2.5 py-1.5 sm:w-18 sm:px-3",
        className,
      )}
    >
      <dt className="text-[0.6875rem] leading-tight font-medium opacity-85">{libelle}</dt>
      <dd className="font-heading text-lg leading-tight font-semibold tabular-nums">{children}</dd>
    </div>
  );
}

/** Le registre : les TODO en cours, rangés par jour d'ajout, du plus ancien au plus récent. */
export function Registre({
  enCours,
  maintenant,
  phases,
  dernierAjoutId,
  onTerminer,
}: {
  enCours: TodoMaquette[];
  maintenant: number;
  phases: Record<string, Phase>;
  dernierAjoutId: string | null;
  onTerminer: (id: string) => void;
}) {
  const groupes = grouperParJour(enCours);

  return (
    <div className="flex flex-col gap-6">
      {groupes.map((groupe) => {
        const age = ecartJours(groupe.premier, maintenant);
        const precision = precisionDuJour(groupe.premier, maintenant);
        const idTitre = `jour-${groupe.cle}`;
        return (
          <section key={groupe.cle} aria-labelledby={idTitre}>
            {/* En-tête en bande de cartouche : date | âge | nombre. */}
            <div className="flex items-stretch overflow-hidden rounded-t-xl border border-input bg-muted">
              <div className="flex min-w-0 flex-1 flex-wrap items-baseline gap-x-2.5 px-3.5 py-2">
                <h2 id={idTitre} className="text-[1.0625rem] leading-tight">
                  {titreDuJour(groupe.premier, maintenant)}
                </h2>
                {precision ? (
                  <span className="text-[0.8125rem] font-medium text-muted-foreground">{precision}</span>
                ) : null}
              </div>
              <dl className="flex">
                <CelluleEnTete libelle="Âge" className={teinteAge(age)}>
                  <span aria-hidden>{age} j</span>
                  <span className="sr-only">{age <= 1 ? (age === 0 ? "ajoutés aujourd'hui" : "1 jour") : `${age} jours`}</span>
                </CelluleEnTete>
                <CelluleEnTete libelle="TODO" className="text-foreground">
                  {groupe.todos.length}
                </CelluleEnTete>
              </dl>
            </div>
            <ul className="overflow-hidden rounded-b-xl border border-t-0 border-border bg-card">
              {groupe.todos.map((todo) => (
                <LigneTodo
                  key={todo.id}
                  todo={todo}
                  phase={phases[todo.id]}
                  nouveau={todo.id === dernierAjoutId}
                  onTerminer={onTerminer}
                />
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

function LigneTodo({
  todo,
  phase,
  nouveau,
  onTerminer,
}: {
  todo: TodoMaquette;
  phase: Phase | undefined;
  nouveau: boolean;
  onTerminer: (id: string) => void;
}) {
  return (
    <li
      data-todo-id={todo.id}
      className={cn(
        "grid border-t border-border transition-[grid-template-rows,opacity] duration-200 ease-trait first:border-t-0 motion-reduce:transition-none",
        phase === "sortie" ? "grid-rows-[0fr] opacity-0" : "grid-rows-[1fr]",
      )}
    >
      <div className="min-h-0 overflow-hidden">
        {todo.enAttente ? (
          <div className="flex min-h-[46px] items-center gap-3.5 px-3.5 py-2.5 text-muted-foreground">
            <LoaderCircle className="size-5 shrink-0 animate-spin motion-reduce:animate-none" aria-hidden />
            <span className="min-w-0 flex-1 break-words">{todo.titre}</span>
            <span className="shrink-0 text-xs font-medium">Enregistrement…</span>
          </div>
        ) : (
          <label className="flex min-h-[46px] cursor-pointer items-center gap-3.5 px-3.5 py-2.5 transition-colors duration-150 hover:bg-accent/60">
            <Checkbox
              data-case-todo=""
              checked={phase !== undefined}
              onCheckedChange={(coche) => {
                if (coche && phase === undefined) onTerminer(todo.id);
              }}
            />
            <span className="min-w-0 flex-1 break-words">
              <span className={cn(nouveau && "surligne")}>
                <span className="trait-encre" data-barre={phase !== undefined}>
                  {todo.titre}
                </span>
              </span>
            </span>
            {nouveau ? (
              <span className="shrink-0 animate-apparait text-xs font-medium text-muted-foreground">
                à l&apos;instant
              </span>
            ) : null}
          </label>
        )}
      </div>
    </li>
  );
}
