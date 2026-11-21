"use client";

import { useEffect, useRef, useState } from "react";
import { BarreDemo } from "./barre-demo";
import { Bandeau } from "./bandeau";
import { CellulesCartouche, type Cellule } from "./cellules-cartouche";
import { ChargementRegistre } from "./chargement-registre";
import { ageDuJour, cleJour, dateLongue, titreDuJour } from "./dates";
import { ID_GLISSE, ID_SELECTEUR, todosDuScenario, type Scenario, type TodoMaquette } from "./donnees-fictives";
import { AlerteDateInvalide, AlerteIntrouvable, EtatErreurChargement, EtatToutTermine, EtatVide } from "./etats";
import { FormulaireAjout } from "./formulaire-ajout";
import { jourDuTodo, ListeDesJours, type Glisser, type Phase } from "./liste-des-jours";
import { SelecteurTheme } from "@/presentation/theme/selecteur-theme";
import { SectionTerminees } from "./section-terminees";

const MESSAGE_TITRE_VIDE = "Écris un titre avant d'ajouter.";
/** Durée du trait d'encre, puis du repli de la ligne (ms). */
const DUREE_TRAIT = 380;
const DUREE_REPLI = 220;
/** Durée pendant laquelle le dernier ajout reste surligné (ms). */
const DUREE_SURLIGNE = 6000;

function glisserDuScenario(scenario: Scenario, maintenant: number): Glisser {
  return scenario === "glisser" ? { id: ID_GLISSE, survole: cleJour(maintenant) } : { id: null, survole: null };
}

/** Revue : la ligne de l'état affiché, amenée au centre de l'écran. */
const LIGNE_DU_SCENARIO: Partial<Record<Scenario, string>> = {
  enregistrement: "en-attente",
  "selecteur-date": ID_SELECTEUR,
  glisser: ID_GLISSE,
};

function sans<T>(table: Record<string, T>, cle: string): Record<string, T> {
  const copie = { ...table };
  delete copie[cle];
  return copie;
}

/**
 * Maquette dynamique de l'écran TODO : état local et données fictives, sans base.
 * Les règles simulées ici (titre obligatoire, espaces retirés, rangement par jour choisi) appartiendront au service.
 */
export function MaquetteTodo({
  maintenant,
  scenarioInitial = "liste",
}: {
  maintenant: number;
  scenarioInitial?: Scenario;
}) {
  const [scenario, setScenario] = useState<Scenario>(scenarioInitial);
  const [todos, setTodos] = useState<TodoMaquette[]>(() =>
    todosDuScenario(scenarioInitial, maintenant),
  );
  const [saisie, setSaisie] = useState("");
  const [erreur, setErreur] = useState<string | null>(
    scenarioInitial === "titre-vide" ? MESSAGE_TITRE_VIDE : null,
  );
  const [phases, setPhases] = useState<Record<string, Phase>>({});
  const [dernierAjoutId, setDernierAjoutId] = useState<string | null>(null);
  const [alerteIntrouvable, setAlerteIntrouvable] = useState(scenarioInitial === "introuvable");
  const [terminesOuvert, setTerminesOuvert] = useState(scenarioInitial === "tout-termine");
  const [annonce, setAnnonce] = useState("");
  const [dateOuverte, setDateOuverte] = useState<string | null>(
    scenarioInitial === "selecteur-date" ? ID_SELECTEUR : null,
  );
  const [glisser, setGlisser] = useState<Glisser>(() => glisserDuScenario(scenarioInitial, maintenant));
  const [alerteDateInvalide, setAlerteDateInvalide] = useState(scenarioInitial === "date-invalide");
  const champRef = useRef<HTMLInputElement>(null);
  const listeRef = useRef<HTMLDivElement>(null);
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

  // Revue : les états qui se jouent sur une ligne précise l'amènent à l'écran.
  useEffect(() => {
    const id = LIGNE_DU_SCENARIO[scenario];
    if (!id) return;
    listeRef.current?.querySelector(`[data-todo-id="${id}"]`)?.scrollIntoView({ block: "center", behavior: "instant" });
  }, [scenario]);

  function planifier(action: () => void, delai: number) {
    minuteurs.current.push(window.setTimeout(action, delai));
  }

  function changerScenario(suivant: Scenario) {
    minuteurs.current.forEach((m) => window.clearTimeout(m));
    minuteurs.current = [];
    // L'état choisi passe dans l'adresse : le lien partagé rouvre le même état.
    window.history.replaceState(null, "", suivant === "liste" ? "?" : `?etat=${suivant}`);
    setScenario(suivant);
    setTodos(todosDuScenario(suivant, maintenant));
    setPhases({});
    setDernierAjoutId(null);
    setSaisie("");
    setErreur(suivant === "titre-vide" ? MESSAGE_TITRE_VIDE : null);
    setAlerteIntrouvable(suivant === "introuvable");
    setTerminesOuvert(suivant === "tout-termine");
    setAnnonce("");
    setDateOuverte(suivant === "selecteur-date" ? ID_SELECTEUR : null);
    setGlisser(glisserDuScenario(suivant, maintenant));
    setAlerteDateInvalide(suivant === "date-invalide");
  }

  /**
   * Range le TODO sous le jour choisi ; sur son propre jour, rien ne change.
   * Choisi au clavier, le focus revient au bouton calendrier du TODO, sous son nouveau jour.
   */
  function changerJour(id: string, jour: string, rendreFocus: boolean) {
    const todo = todos.find((t) => t.id === id);
    if (!todo || todo.termine || jourDuTodo(todo) === jour) return;
    setTodos((liste) => liste.map((t) => (t.id === id ? { ...t, jour } : t)));
    setAlerteDateInvalide(false);
    setAnnonce(`« ${todo.titre} » déplacé sous ${titreDuJour(jour, maintenant)}.`);
    if (rendreFocus) {
      window.requestAnimationFrame(() =>
        listeRef.current?.querySelector<HTMLElement>(`[data-todo-id="${id}"] [data-bouton-date]`)?.focus(),
      );
    }
  }

  function ajouter() {
    const titre = saisie.trim();
    if (titre === "") {
      setErreur(MESSAGE_TITRE_VIDE);
      champRef.current?.focus();
      return;
    }
    const instant = Date.now();
    const todo: TodoMaquette = { id: `ajout-${instant}`, titre, creeLe: instant, termine: false };
    setTodos((liste) => [...liste, todo]);
    setSaisie("");
    setErreur(null);
    setAlerteIntrouvable(false);
    setDernierAjoutId(todo.id);
    setAnnonce(`« ${titre} » ajouté sous Aujourd'hui.`);
  }

  function terminer(id: string) {
    const todo = todos.find((t) => t.id === id);
    if (!todo || phases[id]) return;

    const reduit = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
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
        setTodos((liste) => liste.map((t) => (t.id === id ? { ...t, termine: true } : t)));
        setPhases((p) => sans(p, id));
        setAnnonce(`« ${todo.titre} » terminé.`);
        if (avaitLeFocus) window.requestAnimationFrame(() => (suivante ?? champRef.current)?.focus());
      },
      reduit ? 0 : DUREE_TRAIT + DUREE_REPLI,
    );
  }

  if (scenario === "chargement") {
    return (
      <>
        <ChargementRegistre />
        <BarreDemo scenario={scenario} onScenarioChange={changerScenario} />
      </>
    );
  }

  const enCours = todos.filter((t) => !t.termine).sort((a, b) => a.creeLe - b.creeLe);
  const termines = todos.filter((t) => t.termine).sort((a, b) => a.creeLe - b.creeLe);
  // « Le plus ancien » suit le jour affiché : un TODO repoussé à demain n'est plus en retard.
  const ages = enCours.map((t) => ageDuJour(jourDuTodo(t), maintenant));
  const plusAncien = ages.length > 0 ? Math.max(...ages) : null;
  const injoignable = scenario === "erreur-chargement";

  const cellules: Cellule[] = injoignable
    ? [
        { libelle: "En cours", valeur: "—", enAvant: true },
        { libelle: "Terminés", valeur: "—" },
        { libelle: "Le plus ancien", valeur: "—" },
      ]
    : [
        { libelle: "En cours", valeur: String(enCours.length), enAvant: true },
        { libelle: "Terminés", valeur: String(termines.length) },
        {
          libelle: "Le plus ancien",
          valeur: plusAncien !== null && plusAncien >= 0 ? `${plusAncien} j` : "—",
        },
      ];

  return (
    <div className="flex flex-1 flex-col">
      <Bandeau
        date={dateLongue(maintenant)}
        cellules={<CellulesCartouche cellules={cellules} />}
        theme={<SelecteurTheme />}
      >
        <FormulaireAjout
          refChamp={champRef}
          valeur={saisie}
          erreur={erreur}
          desactive={injoignable}
          onValeurChange={(valeur) => {
            setSaisie(valeur);
            if (erreur && valeur.trim() !== "") setErreur(null);
          }}
          onAjouter={ajouter}
          onAbandon={() => setErreur(null)}
        />
      </Bandeau>

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 pt-6 pb-32 sm:px-6 sm:pt-8">
        <p aria-live="polite" className="sr-only">
          {annonce}
        </p>
        {alerteIntrouvable ? <AlerteIntrouvable onFermer={() => setAlerteIntrouvable(false)} /> : null}
        {alerteDateInvalide ? <AlerteDateInvalide onFermer={() => setAlerteDateInvalide(false)} /> : null}

        {injoignable ? (
          <EtatErreurChargement onReessayer={() => changerScenario("liste")} />
        ) : enCours.length === 0 ? (
          termines.length === 0 ? (
            <EtatVide />
          ) : (
            <EtatToutTermine nombre={termines.length} />
          )
        ) : (
          <div ref={listeRef}>
            <ListeDesJours
              enCours={enCours}
              maintenant={maintenant}
              phases={phases}
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

        {!injoignable && termines.length > 0 ? (
          <SectionTerminees
            className="mt-6"
            termines={termines}
            ouvert={terminesOuvert}
            onOuvertChange={setTerminesOuvert}
          />
        ) : null}
      </main>

      <BarreDemo scenario={scenario} onScenarioChange={changerScenario} />
    </div>
  );
}
