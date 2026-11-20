"use client";

import { startTransition, useEffect, useOptimistic, useRef, useState } from "react";
import { composerRegistre, type Todo } from "@/service/registre";
import type { ResultatAjout, ResultatTerminer } from "@/service/todo-service";
import { validerTitre } from "@/service/titre";
import { AlerteIntrouvable } from "./alerte-introuvable";
import { Bandeau } from "./bandeau";
import { EtatVide } from "./etat-vide";
import { FormulaireAjout } from "./formulaire-ajout";
import { Registre } from "./registre";

const MESSAGES = { "titre-vide": "Écris un titre avant d'ajouter." } as const;
/** Durée pendant laquelle le dernier ajout reste surligné (ms). */
const DUREE_SURLIGNE = 6000;

/** Changement affiché avant la réponse du serveur. */
type Changement = { type: "ajout"; todo: Todo } | { type: "termine"; id: string };

function appliquer(liste: Todo[], changement: Changement): Todo[] {
  if (changement.type === "ajout") return [...liste, changement.todo];
  return liste.map((todo) => (todo.id === changement.id ? { ...todo, termine: true } : todo));
}

/**
 * L'écran de l'application : le bandeau et sa saisie, puis la liste rangée par jour, ou l'état vide.
 * Un ajout ou un TODO coché s'affiche tout de suite, puis la page se recharge avec la base.
 */
export function EcranTodo({
  todos,
  maintenant,
  ajouterAction,
  terminerAction,
}: {
  todos: Todo[];
  /** Instant de la requête : les jours sont calculés par rapport à lui. */
  maintenant: number;
  ajouterAction: (saisie: string) => Promise<ResultatAjout>;
  terminerAction: (id: string) => Promise<ResultatTerminer>;
}) {
  const [saisie, setSaisie] = useState("");
  const [erreur, setErreur] = useState<string | null>(null);
  const [dernierAjoutId, setDernierAjoutId] = useState<string | null>(null);
  const [annonce, setAnnonce] = useState("");
  const [alerteIntrouvable, setAlerteIntrouvable] = useState(false);
  const [affiches, afficherChangement] = useOptimistic(todos, appliquer);
  const champRef = useRef<HTMLInputElement>(null);
  const compteurAttente = useRef(0);

  useEffect(() => {
    if (!dernierAjoutId) return;
    const minuteur = window.setTimeout(() => setDernierAjoutId(null), DUREE_SURLIGNE);
    return () => window.clearTimeout(minuteur);
  }, [dernierAjoutId]);

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

  function terminer(id: string) {
    const todo = affiches.find((t) => t.id === id);
    if (!todo || todo.termine) return;
    setErreur(null);
    startTransition(async () => {
      afficherChangement({ type: "termine", id });
      const resultat = await terminerAction(id);
      startTransition(() => {
        if (resultat.ok) setAnnonce(`« ${todo.titre} » terminé.`);
        else setAlerteIntrouvable(true);
      });
    });
  }

  const registre = composerRegistre(affiches, maintenant);
  const idsEnregistres = new Set(todos.map((todo) => todo.id));
  const enAttente = new Set(affiches.filter((todo) => !idsEnregistres.has(todo.id)).map((todo) => todo.id));

  return (
    <div className="flex flex-1 flex-col">
      <Bandeau date={registre.dateDuJour}>
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
      </Bandeau>
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 pt-6 pb-32 sm:px-6 sm:pt-8">
        <p aria-live="polite" className="sr-only">
          {annonce}
        </p>
        {alerteIntrouvable ? <AlerteIntrouvable onFermer={() => setAlerteIntrouvable(false)} /> : null}
        {registre.jours.length === 0 ? (
          <EtatVide />
        ) : (
          <Registre
            jours={registre.jours}
            enAttente={enAttente}
            dernierAjoutId={dernierAjoutId}
            onTerminer={terminer}
          />
        )}
      </main>
    </div>
  );
}
