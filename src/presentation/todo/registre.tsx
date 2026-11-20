import { LoaderCircle } from "lucide-react";
import { cn } from "@/presentation/lib/utils";
import type { JourDeTodos, TodoAffiche } from "@/service/registre";

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

/** Le registre : les TODO, un bloc par jour d'ajout, dans l'ordre donné par le service. */
export function Registre({
  jours,
  enAttente,
  dernierAjoutId,
}: {
  jours: JourDeTodos[];
  /** TODO affichés avant la réponse du serveur. */
  enAttente: ReadonlySet<string>;
  /** Le dernier TODO enregistré, surligné quelques secondes. */
  dernierAjoutId: string | null;
}) {
  return (
    <div className="flex flex-col gap-6">
      {jours.map((jour) => {
        const idTitre = `jour-${jour.cle}`;
        return (
          <section key={jour.cle} aria-labelledby={idTitre}>
            {/* En-tête en bande de cartouche : date | âge | nombre. */}
            <div className="flex items-stretch overflow-hidden rounded-t-xl border border-input bg-muted">
              <div className="flex min-w-0 flex-1 flex-wrap items-baseline gap-x-2.5 px-3.5 py-2">
                <h2 id={idTitre} className="text-[1.0625rem] leading-tight">
                  {jour.titre}
                </h2>
                {jour.precision ? (
                  <span className="text-[0.8125rem] font-medium text-muted-foreground">{jour.precision}</span>
                ) : null}
              </div>
              <dl className="flex">
                <CelluleEnTete libelle="Âge" className={teinteAge(jour.age)}>
                  <span aria-hidden>{jour.age} j</span>
                  <span className="sr-only">
                    {jour.age <= 1 ? (jour.age === 0 ? "ajoutés aujourd'hui" : "1 jour") : `${jour.age} jours`}
                  </span>
                </CelluleEnTete>
                <CelluleEnTete libelle="TODO" className="text-foreground">
                  {jour.nombre}
                </CelluleEnTete>
              </dl>
            </div>
            <ul className="overflow-hidden rounded-b-xl border border-t-0 border-border bg-card">
              {jour.todos.map((todo) => (
                <LigneTodo
                  key={todo.id}
                  todo={todo}
                  enAttente={enAttente.has(todo.id)}
                  nouveau={todo.id === dernierAjoutId}
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
  enAttente,
  nouveau,
}: {
  todo: TodoAffiche;
  enAttente: boolean;
  nouveau: boolean;
}) {
  return (
    <li data-todo-id={todo.id} className="border-t border-border first:border-t-0">
      {enAttente ? (
        <div className="flex min-h-[46px] items-center gap-3.5 px-3.5 py-2.5 text-muted-foreground">
          <LoaderCircle className="size-5 shrink-0 animate-spin motion-reduce:animate-none" aria-hidden />
          <span data-titre="" className="min-w-0 flex-1 break-words">
            {todo.titre}
          </span>
          <span className="shrink-0 text-xs font-medium">Enregistrement…</span>
        </div>
      ) : (
        <div className="flex min-h-[46px] items-center gap-3.5 px-3.5 py-2.5">
          <span className="min-w-0 flex-1 break-words">
            <span data-titre="" className={cn(nouveau && "surligne")}>
              {todo.titre}
            </span>
          </span>
          {nouveau ? (
            <span className="shrink-0 animate-apparait text-xs font-medium text-muted-foreground">
              à l&apos;instant
            </span>
          ) : null}
        </div>
      )}
    </li>
  );
}
