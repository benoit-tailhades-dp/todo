"use client";

import { startTransition, useEffect, useOptimistic, useRef, useState } from "react";
import { titreDuJour } from "@/service/jours";
import { composerRegistre, type Todo } from "@/service/registre";
import type { ResultatAjout, ResultatChangerDate, ResultatTerminer } from "@/service/todo-service";
import { validerTitre } from "@/service/titre";
import { ArcsDuJour } from "./arcs-du-jour";
import { Bandeau } from "./bandeau";
import { Compteurs } from "./compteurs";
import { AlerteDateInvalide, AlerteIntrouvable, EtatToutTermine, EtatVide } from "./etats";
import { FormulaireAjout } from "./formulaire-ajout";
import { ListeDesJours, type Glisser, type Phase } from "./liste-des-jours";
import { SectionTerminees } from "./section-terminees";

const MESSAGES = { "titre-vide": "Écris un titre avant d'ajouter." } as const;
/** Durée pendant laquelle le dernier ajout reste tracé (ms). */
const DUREE_SURLIGNE = 6000;
/** Durée du trait vermillon, puis de l'effacement de la ligne (ms). */
const DUREE_TRAIT = 380;
const DUREE_REPLI = 220;

const AUCUN_GLISSER: Glisser = { id: null, survole: null };

/** Changement affiché avant la réponse du serveur. */
type Changement =
  | { type: "ajout"; todo: Todo }
  | { type: "termine"; id: string }
  | { type: "date"; id: string; jour: string };

function appliquer(liste: Todo[], changement: Changement): Todo[] {
  switch (changement.type) {
    case "ajout":
      return [...liste, changement.todo];
    case "termine":
      return liste.map((todo) => (todo.id === changement.id ? { ...todo, termine: true } : todo));
    case "date":
      return liste.map((todo) => (todo.id === changement.id ? { ...todo, jour: changement.jour } : todo));
  }
}

function sans<T>(table: Record<string, T>, cle: string): Record<string, T> {
  const copie = { ...table };
  delete copie[cle];
  return copie;
}

function mouvementReduit(): boolean {
  return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
}

/**
 * L'écran de l'application, en affiche : le champ vermillon (compteurs et arcs du jour), la saisie, puis
 * les TODO en cours rangés par jour et les TODO terminés à part. Un ajout, un TODO coché ou déplacé
 * s'affiche tout de suite, puis la page se recharge avec la base.
 */
export function EcranTodo({
  todos,
  maintenant,
  ajouterAction,
  terminerAction,
  changerDateAction,
}: {
  todos: Todo[];
  /** Instant de la requête : les jours sont calculés par rapport à lui. */
  maintenant: number;
  ajouterAction: (saisie: string) => Promise<ResultatAjout>;
  terminerAction: (id: string) => Promise<ResultatTerminer>;
  changerDateAction: (id: string, jour: string) => Promise<ResultatChangerDate>;
}) {
  const [saisie, setSaisie] = useState("");
  const [erreur, setErreur] = useState<string | null>(null);
  const [dernierAjoutId, setDernierAjoutId] = useState<string | null>(null);
  const [annonce, setAnnonce] = useState("");
  const [alerteIntrouvable, setAlerteIntrouvable] = useState(false);
  const [alerteDateInvalide, setAlerteDateInvalide] = useState(false);
  const [dateOuverte, setDateOuverte] = useState<string | null>(null);
  const [glisser, setGlisser] = useState<Glisser>(AUCUN_GLISSER);
  const [phases, setPhases] = useState<Record<string, Phase>>({});
  const [affiches, afficherChangement] = useOptimistic(todos, appliquer);
  const registre = composerRegistre(affiches, maintenant);
  const [terminesOuvert, setTerminesOuvert] = useState(registre.etat === "tout-termine");
  const champRef = useRef<HTMLInputElement>(null);
  const listeRef = useRef<HTMLDivElement>(null);
  const compteurAttente = useRef(0);
  const minuteurs = useRef<number[]>([]);

  useEffect(() => {
    const enCours = minuteurs.current;
    return () => enCours.forEach((m) => window.clearTimeout(m));
  }, []);

  useEffect(() => {
    if (!dernierAjoutId) return;
    const minuteur = window.setTimeout(() => setDernierAjoutId(null), DUREE_SURLIGNE);
    return () => window.clearTimeout(minuteur);
  }, [dernierAjoutId]);

  function planifier(action: () => void, delai: number) {
    minuteurs.current.push(window.setTimeout(action, delai));
  }

  function ajouter() {
    const verdict = validerTitre(saisie);
    if (!verdict.ok) {
      setErreur(MESSAGES[verdict.erreur]);
      champRef.current?.focus();
      return;
    }
    const envoyee = saisie;
    setSaisie("");
    setErreur(null);
    setAlerteIntrouvable(false);
    setAlerteDateInvalide(false);
    compteurAttente.current += 1;
    const enAttente: Todo = {
      id: `en-attente-${compteurAttente.current}`,
      titre: verdict.titre,
      creeLe: Date.now(),
      termine: false,
    };
    startTransition(async () => {
      afficherChangement({ type: "ajout", todo: enAttente });
      const resultat = await ajouterAction(envoyee);
      startTransition(() => {
        if (resultat.ok) {
          setDernierAjoutId(resultat.todo.id);
          setAnnonce(`« ${resultat.todo.titre} » ajouté sous Aujourd'hui.`);
        } else {
          setErreur(MESSAGES[resultat.erreur]);
        }
      });
    });
  }

  /**
   * Trait vermillon, effacement de la ligne, puis passage dans « Terminés » et enregistrement.
   * L'enregistrement part à la fin : la liste rechargée couperait sinon la chorégraphie.
   */
  function terminer(id: string) {
    const todo = affiches.find((t) => t.id === id);
    if (!todo || todo.termine || phases[id]) return;

    const reduit = mouvementReduit();
    const ligne = listeRef.current?.querySelector(`[data-todo-id="${id}"]`);
    const avaitLeFocus = ligne?.contains(document.activeElement) ?? false;
    const cases = Array.from(listeRef.current?.querySelectorAll<HTMLElement>("[data-case-todo]") ?? []);
    const rang = cases.findIndex((c) => ligne?.contains(c));
    const suivante = cases[rang + 1] ?? cases[rang - 1] ?? null;

    setErreur(null);
    setPhases((p) => ({ ...p, [id]: "barre" }));
    planifier(() => setPhases((p) => ({ ...p, [id]: "sortie" })), reduit ? 0 : DUREE_TRAIT);
    planifier(
      () => {
        if (avaitLeFocus) window.requestAnimationFrame(() => (suivante ?? champRef.current)?.focus());
        startTransition(async () => {
          afficherChangement({ type: "termine", id });
          setPhases((p) => sans(p, id));
          const resultat = await terminerAction(id);
          startTransition(() => {
            if (resultat.ok) setAnnonce(`« ${todo.titre} » terminé.`);
            else setAlerteIntrouvable(true);
          });
        });
      },
      reduit ? 0 : DUREE_TRAIT + DUREE_REPLI,
    );
  }

  /**
   * Range le TODO sous le jour choisi, tout de suite, puis l'enregistre. Choisi au clavier, le focus revient
   * au bouton de date du TODO, sous son nouveau jour.
   */
  function changerJour(id: string, jour: string, rendreFocus: boolean) {
    const todo = affiches.find((t) => t.id === id);
    if (!todo || todo.termine) return;

    setAlerteIntrouvable(false);
    setAlerteDateInvalide(false);
    if (rendreFocus) {
      window.requestAnimationFrame(() =>
        listeRef.current?.querySelector<HTMLElement>(`[data-todo-id="${id}"] [data-bouton-date]`)?.focus(),
      );
    }
    startTransition(async () => {
      afficherChangement({ type: "date", id, jour });
      const resultat = await changerDateAction(id, jour);
      startTransition(() => {
        if (resultat.ok) setAnnonce(`« ${todo.titre} » déplacé sous ${titreDuJour(jour, maintenant)}.`);
        else if (resultat.erreur === "date-invalide") setAlerteDateInvalide(true);
        else if (resultat.erreur === "introuvable") setAlerteIntrouvable(true);
      });
    });
  }

  const { compteurs } = registre;
  const faits = registre.jours.reduce((somme, j) => somme + j.termines, 0);
  const total = registre.jours.reduce((somme, j) => somme + j.termines + j.nombre, 0);
  const legende =
    registre.etat === "liste"
      ? `Un arc par jour, le plus ancien dehors · ${faits} sur ${total} faits`
      : registre.etat === "tout-termine"
        ? "Le cercle est fermé : tout est fait"
        : null;
  const idsEnregistres = new Set(todos.map((todo) => todo.id));
  const enAttente = new Set(affiches.filter((todo) => !idsEnregistres.has(todo.id)).map((todo) => todo.id));

  return (
    <div className="flex flex-1 flex-col lg:grid lg:grid-cols-[minmax(22rem,5fr)_7fr]">
      <Bandeau
        date={registre.dateDuJour}
        compteurs={
          <Compteurs
            enCours={String(compteurs.enCours)}
            termines={String(compteurs.termines)}
            plusAncien={compteurs.plusAncien === null ? "—" : `${compteurs.plusAncien} j`}
          />
        }
        arcs={<ArcsDuJour jours={registre.jours} etat={registre.etat} className="size-full" />}
        legende={legende}
      />
      <main className="flex min-w-0 flex-1 flex-col">
        {/* Téléphone : la saisie reste en bas de l'écran, à portée du pouce. Large : en tête, collée en haut. */}
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-8 lg:sticky lg:top-0 lg:bottom-auto lg:border-t-0 lg:px-14 lg:pt-10 lg:pb-6">
          <div className="mx-auto w-full max-w-3xl">
            <FormulaireAjout
              refChamp={champRef}
              valeur={saisie}
              erreur={erreur}
              onValeurChange={(valeur) => {
                setSaisie(valeur);
                if (erreur && validerTitre(valeur).ok) setErreur(null);
              }}
              onAjouter={ajouter}
              onAbandon={() => setErreur(null)}
            />
          </div>
        </div>
        <div className="w-full flex-1 px-4 pt-8 pb-44 sm:px-8 lg:px-14 lg:pt-6 lg:pb-24">
          <div className="mx-auto w-full max-w-3xl">
          <p aria-live="polite" className="sr-only">
            {annonce}
          </p>
          {alerteIntrouvable ? <AlerteIntrouvable onFermer={() => setAlerteIntrouvable(false)} /> : null}
          {alerteDateInvalide ? <AlerteDateInvalide onFermer={() => setAlerteDateInvalide(false)} /> : null}

          {registre.etat === "vide" ? (
            <EtatVide />
          ) : registre.etat === "tout-termine" ? (
            <EtatToutTermine nombre={compteurs.termines} />
          ) : (
            <div ref={listeRef}>
              <ListeDesJours
                jours={registre.jours}
                maintenant={maintenant}
                phases={phases}
                enAttente={enAttente}
                dernierAjoutId={dernierAjoutId}
                dateOuverte={dateOuverte}
                glisser={glisser}
                onTerminer={terminer}
                onDateOuverteChange={setDateOuverte}
                onChangerJour={(id, jour) => changerJour(id, jour, glisser.id === null)}
                onGlisserChange={setGlisser}
              />
            </div>
          )}

          {registre.termines.length > 0 ? (
            <SectionTerminees
              className="mt-14"
              termines={registre.termines}
              ouvert={terminesOuvert}
              onOuvertChange={setTerminesOuvert}
            />
          ) : null}
          </div>
        </div>
      </main>
    </div>
  );
}
