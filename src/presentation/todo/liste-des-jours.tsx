"use client";

import { ArrowDownToLine, CalendarDays, Check, GripVertical, LoaderCircle } from "lucide-react";
import { useRef, type DragEvent } from "react";
import { cn } from "@/presentation/lib/utils";
import { Checkbox } from "@/presentation/ui/checkbox";
import type { JourDeTodos, TodoAffiche } from "@/service/registre";
import { SEUIL_GESTE, useGesteLigne } from "./geste-ligne";
import { useGlissementFluide } from "./glissement-fluide";
import { SelecteurDate } from "./selecteur-date";

/** « barre » : le trait vermillon passe sur le titre ; « sortie » : la ligne s'efface avant de quitter la liste. */
export type Phase = "barre" | "sortie";

/** Le glisser-déposer en cours : le TODO saisi et le jour qu'il survole. */
export type Glisser = { id: string | null; survole: string | null };

/** Délai avant d'ouvrir le calendrier après un geste : la ligne a fini de revenir en place (ms). */
const RETOUR_LIGNE = 360;

/** La date en clair d'un jour, en gris : au corps du titre en large, sur sa propre ligne au téléphone. */
const DATE_DU_JOUR =
  "text-[1rem] leading-none font-bold text-muted-foreground sm:text-[2rem] sm:font-extrabold sm:tracking-tight [font-stretch:105%]";

/** Le jour se lit d'abord : « Mardi » en noir, « 17 novembre » en gris, dans un seul titre. */
function TitreDuJour({ titre }: { titre: string }) {
  const [premier, ...reste] = titre.split(" ");
  return (
    <>
      {premier}
      {reste.length > 0 ? (
        <>
          {" "}
          <span className={cn(DATE_DU_JOUR, "max-sm:mt-1.5 max-sm:block")}>{reste.join(" ")}</span>
        </>
      ) : null}
    </>
  );
}

/** Pastille d'âge : vide les premiers jours, cerclée de noir à 2 jours, pleine de vermillon à 3 jours et plus. */
function PastilleAge({ age }: { age: number }) {
  const avenir = age < 0;
  const jours = Math.abs(age);
  return (
    <div className="flex items-center">
      <dt className="sr-only">{avenir ? "Dans" : "Âge"}</dt>
      <dd
        className={cn(
          "flex h-10 min-w-10 items-center justify-center rounded-full border-2 px-2 text-[0.875rem] leading-none font-extrabold tabular-nums transition-colors duration-300",
          avenir && "border-dashed border-input text-muted-foreground",
          !avenir && age <= 1 && "border-border text-muted-foreground",
          age === 2 && "border-foreground text-foreground",
          age >= 3 && "border-signature bg-signature text-signature-foreground",
        )}
      >
        <span aria-hidden>{jours} j</span>
        <span className="sr-only">
          {avenir
            ? jours === 1
              ? "1 jour"
              : `${jours} jours`
            : age <= 1
              ? age === 0
                ? "ajoutés aujourd'hui"
                : "1 jour"
              : `${jours} jours`}
        </span>
      </dd>
    </div>
  );
}

/** Les TODO en cours, un bloc par jour, dans l'ordre du registre composé par le service. */
export function ListeDesJours({
  jours,
  maintenant,
  phases,
  enAttente,
  dernierAjoutId,
  dateOuverte,
  glisser,
  onTerminer,
  onDateOuverteChange,
  onChangerJour,
  onGlisserChange,
}: {
  jours: JourDeTodos[];
  /** Instant de la requête : le calendrier marque ce jour comme aujourd'hui. */
  maintenant: number;
  /** TODO cochés dont la chorégraphie est en cours. */
  phases: Readonly<Record<string, Phase>>;
  /** TODO affichés avant la réponse du serveur. */
  enAttente: ReadonlySet<string>;
  /** Le dernier TODO enregistré, tracé quelques secondes. */
  dernierAjoutId: string | null;
  /** Le TODO dont le sélecteur de date est ouvert. */
  dateOuverte: string | null;
  glisser: Glisser;
  onTerminer: (id: string) => void;
  onDateOuverteChange: (id: string | null) => void;
  /** Un autre jour, AAAA-MM-JJ, choisi pour le TODO. */
  onChangerJour: (id: string, jour: string) => void;
  onGlisserChange: (glisser: Glisser) => void;
}) {
  const racine = useRef<HTMLDivElement>(null);
  useGlissementFluide(racine);
  const jourGlisse = glisser.id ? jours.find((j) => j.todos.some((t) => t.id === glisser.id))?.cle : undefined;

  /** Un jour accepte le TODO glissé, sauf le sien : y relâcher ne change rien. */
  function accepte(cle: string): boolean {
    return glisser.id !== null && jourGlisse !== undefined && cle !== jourGlisse;
  }

  return (
    // Pendant un geste au doigt, la ligne tenue reste nette et le reste de la liste s'efface.
    <div
      ref={racine}
      className="flex flex-col gap-10 lg:gap-12 [&:has([data-geste])_li:not([data-geste])]:opacity-35 [&_li]:transition-opacity [&_li]:duration-200"
    >
      {jours.map((jour) => {
        const idTitre = `jour-${jour.cle}`;
        const survole = glisser.survole === jour.cle && accepte(jour.cle);
        return (
          <section
            key={jour.cle}
            aria-labelledby={idTitre}
            data-jour={jour.cle}
            data-survole={survole || undefined}
            className="rounded-3xl transition-[background-color,box-shadow] duration-200 data-survole:bg-signature-doux data-survole:shadow-[0_0_0_12px_var(--signature-doux)]"
            onDragOver={(evenement: DragEvent) => {
              if (!accepte(jour.cle)) return;
              evenement.preventDefault();
              evenement.dataTransfer.dropEffect = "move";
              if (glisser.survole !== jour.cle) onGlisserChange({ ...glisser, survole: jour.cle });
            }}
            onDragLeave={(evenement: DragEvent) => {
              if (evenement.currentTarget.contains(evenement.relatedTarget as Node | null)) return;
              if (glisser.survole === jour.cle) onGlisserChange({ ...glisser, survole: null });
            }}
            onDrop={(evenement: DragEvent) => {
              evenement.preventDefault();
              const id = glisser.id;
              onGlisserChange({ id: null, survole: null });
              if (id && accepte(jour.cle)) onChangerJour(id, jour.cle);
            }}
          >
            {/* En-tête du jour : titre très gras, date en clair, pastille d'âge et nombre. */}
            <div
              className={cn(
                "flex items-center gap-3 border-b-2 border-foreground pb-3 transition-colors duration-200",
                survole && "border-signature",
              )}
            >
              <div className="flex min-w-0 flex-1 flex-col items-start gap-1.5 sm:flex-row sm:flex-wrap sm:items-baseline sm:gap-x-3 sm:gap-y-1">
                <h2 id={idTitre} className="text-[1.625rem] leading-none sm:text-[2rem] [font-stretch:105%]">
                  <TitreDuJour titre={jour.titre} />
                </h2>
                {jour.precision ? <span className={DATE_DU_JOUR}>{jour.precision}</span> : null}
                {survole ? (
                  <span className="inline-flex animate-apparait items-center gap-1 self-center text-[0.875rem] font-bold text-signature motion-reduce:animate-none">
                    <ArrowDownToLine className="size-4" aria-hidden />
                    Déposer ici
                  </span>
                ) : null}
              </div>
              <dl className="flex shrink-0 items-center gap-3">
                <PastilleAge age={jour.age} />
                <div className="flex min-w-12 flex-row-reverse items-baseline justify-end gap-1">
                  <dt className="text-[0.8125rem] font-semibold text-muted-foreground">TODO</dt>
                  <dd className="text-[1.375rem] leading-none font-extrabold tabular-nums">{jour.nombre}</dd>
                </div>
              </dl>
            </div>
            <ul>
              {jour.todos.map((todo) => (
                <LigneTodo
                  key={todo.id}
                  todo={todo}
                  jour={jour.cle}
                  maintenant={maintenant}
                  phase={phases[todo.id]}
                  enAttente={enAttente.has(todo.id)}
                  nouveau={todo.id === dernierAjoutId}
                  glisse={todo.id === glisser.id}
                  dateOuverte={todo.id === dateOuverte}
                  onTerminer={onTerminer}
                  onDateOuverteChange={(ouvert) => onDateOuverteChange(ouvert ? todo.id : null)}
                  onChangerJour={(choisi) => onChangerJour(todo.id, choisi)}
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
  enAttente,
  nouveau,
  glisse,
  dateOuverte,
  onTerminer,
  onDateOuverteChange,
  onChangerJour,
  onGlisserDebut,
  onGlisserFin,
}: {
  todo: TodoAffiche;
  /** Jour sous lequel la ligne est rangée, AAAA-MM-JJ. */
  jour: string;
  maintenant: number;
  phase: Phase | undefined;
  enAttente: boolean;
  nouveau: boolean;
  glisse: boolean;
  dateOuverte: boolean;
  onTerminer: (id: string) => void;
  onDateOuverteChange: (ouvert: boolean) => void;
  onChangerJour: (jour: string) => void;
  onGlisserDebut: () => void;
  onGlisserFin: () => void;
}) {
  const coche = todo.termine || phase !== undefined;
  const mobile = !enAttente && !coche;
  const geste = useGesteLigne({
    actif: mobile,
    onDroite: () => onTerminer(todo.id),
    onGauche: () => window.setTimeout(() => onDateOuverteChange(true), RETOUR_LIGNE),
  });
  const vers = geste.dx > 0 ? "droite" : geste.dx < 0 ? "gauche" : null;
  const ouverture = Math.min(Math.abs(geste.dx) / SEUIL_GESTE, 1);

  return (
    <li
      data-todo-id={todo.id}
      data-glisse={glisse || undefined}
      data-geste={geste.enCours || undefined}
      draggable={mobile}
      onDragStart={(evenement) => {
        evenement.dataTransfer.effectAllowed = "move";
        evenement.dataTransfer.setData("text/plain", todo.titre);
        onGlisserDebut();
      }}
      onDragEnd={onGlisserFin}
      // contain-layout : la case de Base UI cache son <input> en position fixed, en haut de la page.
      // Sans ce bloc de référence, Chrome glisse une image qui va du haut de la page jusqu'à la ligne.
      className={cn(
        "group/ligne relative contain-layout border-b border-border motion-reduce:transition-none",
        phase === "sortie" && "pointer-events-none opacity-0",
        glisse && "opacity-40",
      )}
    >
      {enAttente ? (
        <div className="flex min-h-15 items-center gap-4 py-3.5 text-muted-foreground">
          <LoaderCircle className="size-6 shrink-0 animate-spin motion-reduce:animate-none" aria-hidden />
          <span data-titre="" className="min-w-0 flex-1 text-[1.0625rem] break-words">
            {todo.titre}
          </span>
          <span className="shrink-0 text-[0.8125rem] font-semibold">Enregistrement…</span>
        </div>
      ) : (
        <div className="relative overflow-hidden">
          {/* Sous la ligne, ce que le geste fera : terminer à droite, changer le jour à gauche. */}
          {vers ? (
            <div
              aria-hidden
              className={cn(
                "absolute inset-0 flex items-center px-5 text-[0.9375rem] font-bold",
                vers === "droite"
                  ? "justify-start bg-signature text-signature-foreground"
                  : "justify-end bg-primary text-primary-foreground",
              )}
              style={{ opacity: 0.35 + ouverture * 0.65 }}
            >
              <span
                className={cn(
                  "flex items-center gap-2 transition-transform duration-200 ease-ressort",
                  geste.franchi && "scale-110",
                )}
              >
                {vers === "droite" ? (
                  <>
                    <Check className="size-5 stroke-3" />
                    Terminé
                  </>
                ) : (
                  <>
                    Changer le jour
                    <CalendarDays className="size-5" />
                  </>
                )}
              </span>
            </div>
          ) : null}
          <div
            {...geste.gestionnaires}
            data-zone-geste=""
            className={cn(
              "relative flex touch-pan-y items-center bg-background transition-[transform,border-radius] duration-[420ms] ease-ressort group-data-geste/ligne:rounded-2xl group-data-geste/ligne:transition-none motion-reduce:transition-none",
              !geste.enCours && "lg:hover:bg-accent/70",
            )}
            style={geste.dx !== 0 ? { transform: `translateX(${geste.dx}px)` } : undefined}
          >
            <label className="flex min-h-15 min-w-0 flex-1 cursor-pointer items-center gap-4 py-3.5 select-none lg:select-auto">
              {/* Pas de « décocher » : une fois cochée, la case ne réagit plus. */}
              <Checkbox
                data-case-todo=""
                checked={coche}
                readOnly={coche}
                className="size-6 border-foreground"
                onCheckedChange={(valeur) => {
                  if (valeur && !coche) onTerminer(todo.id);
                }}
              />
              <span className="min-w-0 flex-1 text-[1.0625rem] leading-snug break-words">
                <span className={cn(nouveau && "surligne")}>
                  <span data-titre="" className="trait-encre" data-barre={coche}>
                    {todo.titre}
                  </span>
                </span>
              </span>
              {nouveau ? (
                <span className="shrink-0 animate-apparait text-[0.8125rem] font-semibold text-signature">
                  à l&apos;instant
                </span>
              ) : null}
            </label>
            {/* Masqués, pas retirés, pendant la chorégraphie du cochage : le titre ne se recompose pas. */}
            <div className={cn("flex shrink-0 items-center gap-0.5 pl-2", !mobile && "invisible")}>
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
                className="hidden h-9 w-5 cursor-grab items-center justify-center text-muted-foreground opacity-0 transition-opacity duration-150 group-hover/ligne:opacity-100 group-data-glisse/ligne:text-signature group-data-glisse/ligne:opacity-100 pointer-fine:flex"
              >
                <GripVertical className="size-4" />
              </span>
            </div>
          </div>
        </div>
      )}
    </li>
  );
}
