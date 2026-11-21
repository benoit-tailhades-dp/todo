"use client";

import { ArrowDownToLine, GripVertical, LoaderCircle } from "lucide-react";
import type { DragEvent } from "react";
import { cn } from "@/presentation/lib/utils";
import { Checkbox } from "@/presentation/ui/checkbox";
import type { TodoMaquette } from "./donnees-fictives";
import { ageDuJour, cleJour, precisionDuJour, titreDuJour } from "./dates";
import { SelecteurDate } from "./selecteur-date";

/** « barre » : le trait d'encre passe sur le titre ; « sortie » : la ligne se replie. */
export type Phase = "barre" | "sortie";

/** Le glisser-déposer en cours : le TODO saisi et le jour qu'il survole. */
export type Glisser = { id: string | null; survole: string | null };

type Groupe = { cle: string; todos: TodoMaquette[] };

/** Jour d'un TODO : celui qu'on lui a choisi, sinon son jour d'ajout. */
export function jourDuTodo(todo: TodoMaquette): string {
  return todo.jour ?? cleJour(todo.creeLe);
}

/** Jours du plus ancien au plus futur ; dans un jour, l'ordre d'ajout. */
function grouperParJour(todos: TodoMaquette[]): Groupe[] {
  const groupes = new Map<string, TodoMaquette[]>();
  for (const todo of todos.toSorted((a, b) => a.creeLe - b.creeLe)) {
    const cle = jourDuTodo(todo);
    groupes.set(cle, [...(groupes.get(cle) ?? []), todo]);
  }
  return [...groupes].map(([cle, liste]) => ({ cle, todos: liste })).sort((a, b) => a.cle.localeCompare(b.cle));
}

/** L'encre monte avec l'âge : un jour qui traîne se repère d'un coup d'œil. Un jour à venir reste neutre. */
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

function CelluleAge({ age }: { age: number }) {
  if (age < 0) {
    const dans = -age;
    return (
      <CelluleEnTete libelle="Dans" className="text-muted-foreground">
        <span aria-hidden>{dans} j</span>
        <span className="sr-only">{dans === 1 ? "1 jour" : `${dans} jours`}</span>
      </CelluleEnTete>
    );
  }
  return (
    <CelluleEnTete libelle="Âge" className={teinteAge(age)}>
      <span aria-hidden>{age} j</span>
      <span className="sr-only">{age <= 1 ? (age === 0 ? "ajoutés aujourd'hui" : "1 jour") : `${age} jours`}</span>
    </CelluleEnTete>
  );
}

/** Le registre : les TODO en cours, rangés par jour, du plus ancien au plus futur. */
export function Registre({
  enCours,
  maintenant,
  phases,
  dernierAjoutId,
  dateOuverte,
  glisser,
  onTerminer,
  onDateOuverteChange,
  onChangerJour,
  onGlisserChange,
}: {
  enCours: TodoMaquette[];
  maintenant: number;
  phases: Record<string, Phase>;
  dernierAjoutId: string | null;
  /** Le TODO dont le sélecteur de date est ouvert. */
  dateOuverte: string | null;
  glisser: Glisser;
  onTerminer: (id: string) => void;
  onDateOuverteChange: (id: string | null) => void;
  onChangerJour: (id: string, jour: string) => void;
  onGlisserChange: (glisser: Glisser) => void;
}) {
  const groupes = grouperParJour(enCours);
  const jourGlisse = glisser.id ? groupes.find((g) => g.todos.some((t) => t.id === glisser.id))?.cle : undefined;

  /** Un jour accepte le TODO glissé, sauf le sien : y relâcher ne change rien. */
  function accepte(cle: string): boolean {
    return glisser.id !== null && jourGlisse !== undefined && cle !== jourGlisse;
  }

  return (
    <div className="flex flex-col gap-6">
      {groupes.map((groupe) => {
        const age = ageDuJour(groupe.cle, maintenant);
        const precision = precisionDuJour(groupe.cle, maintenant);
        const idTitre = `jour-${groupe.cle}`;
        const survole = glisser.survole === groupe.cle && accepte(groupe.cle);
        return (
          <section
            key={groupe.cle}
            aria-labelledby={idTitre}
            data-jour={groupe.cle}
            data-survole={survole || undefined}
            className="rounded-xl outline-offset-4 data-survole:outline-2 data-survole:outline-primary data-survole:outline-dashed"
            onDragOver={(evenement: DragEvent) => {
              if (!accepte(groupe.cle)) return;
              evenement.preventDefault();
              evenement.dataTransfer.dropEffect = "move";
              if (glisser.survole !== groupe.cle) onGlisserChange({ ...glisser, survole: groupe.cle });
            }}
            onDragLeave={(evenement: DragEvent) => {
              if (evenement.currentTarget.contains(evenement.relatedTarget as Node | null)) return;
              if (glisser.survole === groupe.cle) onGlisserChange({ ...glisser, survole: null });
            }}
            onDrop={(evenement: DragEvent) => {
              evenement.preventDefault();
              const id = glisser.id;
              onGlisserChange({ id: null, survole: null });
              if (id && accepte(groupe.cle)) onChangerJour(id, groupe.cle);
            }}
          >
            {/* En-tête en bande de cartouche : date | âge | nombre. */}
            <div
              className={cn(
                "flex items-stretch overflow-hidden rounded-t-xl border border-input bg-muted transition-colors duration-150",
                survole && "border-primary bg-primary/15",
              )}
            >
              <div className="flex min-w-0 flex-1 flex-wrap items-baseline gap-x-2.5 px-3.5 py-2">
                <h2 id={idTitre} className="text-[1.0625rem] leading-tight">
                  {titreDuJour(groupe.cle, maintenant)}
                </h2>
                {precision ? (
                  <span className="text-[0.8125rem] font-medium text-muted-foreground">{precision}</span>
                ) : null}
                {survole ? (
                  <span className="inline-flex animate-apparait items-center gap-1 self-center text-[0.8125rem] font-medium text-primary motion-reduce:animate-none">
                    <ArrowDownToLine className="size-3.5" aria-hidden />
                    Déposer ici
                  </span>
                ) : null}
              </div>
              <dl className="flex">
                <CelluleAge age={age} />
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
                  jour={groupe.cle}
                  maintenant={maintenant}
                  phase={phases[todo.id]}
                  nouveau={todo.id === dernierAjoutId}
                  glisse={todo.id === glisser.id}
                  dateOuverte={todo.id === dateOuverte}
                  onTerminer={onTerminer}
                  onDateOuverteChange={(ouvert) => onDateOuverteChange(ouvert ? todo.id : null)}
                  onChangerJour={(jour) => onChangerJour(todo.id, jour)}
                  onGlisserDebut={() => onGlisserChange({ id: todo.id, survole: null })}
                  onGlisserFin={() => onGlisserChange({ id: null, survole: null })}
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
  jour,
  maintenant,
  phase,
  nouveau,
  glisse,
  dateOuverte,
  onTerminer,
  onDateOuverteChange,
  onChangerJour,
  onGlisserDebut,
  onGlisserFin,
}: {
  todo: TodoMaquette;
  jour: string;
  maintenant: number;
  phase: Phase | undefined;
  nouveau: boolean;
  glisse: boolean;
  dateOuverte: boolean;
  onTerminer: (id: string) => void;
  onDateOuverteChange: (ouvert: boolean) => void;
  onChangerJour: (jour: string) => void;
  onGlisserDebut: () => void;
  onGlisserFin: () => void;
}) {
  const mobile = !todo.enAttente && phase === undefined;
  return (
    <li
      data-todo-id={todo.id}
      data-glisse={glisse || undefined}
      draggable={mobile}
      onDragStart={(evenement) => {
        evenement.dataTransfer.effectAllowed = "move";
        evenement.dataTransfer.setData("text/plain", todo.titre);
        onGlisserDebut();
      }}
      onDragEnd={onGlisserFin}
      className={cn(
        "group/ligne grid border-t border-border transition-[grid-template-rows,opacity,background-color] duration-200 ease-trait first:border-t-0 motion-reduce:transition-none",
        phase === "sortie" ? "grid-rows-[0fr] opacity-0" : "grid-rows-[1fr]",
        glisse && "bg-muted",
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
          <div className="flex items-center transition-colors duration-150 hover:bg-accent/60 group-data-glisse/ligne:bg-transparent">
            <label className="flex min-h-[46px] min-w-0 flex-1 cursor-pointer items-center gap-3.5 py-2.5 pl-3.5">
              <Checkbox
                data-case-todo=""
                checked={phase !== undefined}
                onCheckedChange={(coche) => {
                  if (coche && phase === undefined) onTerminer(todo.id);
                }}
              />
              <span className="min-w-0 flex-1 break-words group-data-glisse/ligne:text-muted-foreground">
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
            {/* Masqués, pas retirés, pendant la chorégraphie du cochage : le titre ne se recompose pas. */}
            <div className={cn("flex shrink-0 items-center gap-0.5 pr-1.5 pl-2", !mobile && "invisible")}>
              <SelecteurDate
                titre={todo.titre}
                jour={jour}
                maintenant={maintenant}
                ouvert={dateOuverte}
                onOuvertChange={onDateOuverteChange}
                onChoisir={(choisi) => {
                  onDateOuverteChange(false);
                  if (choisi !== jour) onChangerJour(choisi);
                }}
              />
              {/* Poignée : seulement avec une souris, le glisser-déposer natif n'étant pas sûr au doigt. */}
              <span
                aria-hidden
                className="hidden h-7 w-5 cursor-grab items-center justify-center text-muted-foreground opacity-0 transition-opacity duration-150 group-hover/ligne:opacity-100 group-data-glisse/ligne:text-primary group-data-glisse/ligne:opacity-100 pointer-fine:flex"
              >
                <GripVertical className="size-4" />
              </span>
            </div>
          </div>
        )}
      </div>
    </li>
  );
}
