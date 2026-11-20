"use client";

import { startTransition, useEffect, useOptimistic, useRef, useState } from "react";
import { composerRegistre, type Todo } from "@/service/registre";
import type { ResultatAjout } from "@/service/todo-service";
import { validerTitre } from "@/service/titre";
import { Bandeau } from "./bandeau";
import { EtatVide } from "./etat-vide";
import { FormulaireAjout } from "./formulaire-ajout";
import { Registre } from "./registre";

const MESSAGES = { "titre-vide": "Écris un titre avant d'ajouter." } as const;
/** Durée pendant laquelle le dernier ajout reste surligné (ms). */
const DUREE_SURLIGNE = 6000;

/**
 * L'écran de l'application : le bandeau et sa saisie, puis la liste rangée par jour, ou l'état vide.
 * Un ajout s'affiche tout de suite (« Enregistrement… »), puis la page se recharge avec la base.
 */
export function EcranTodo({
  todos,
  maintenant,
  ajouterAction,
}: {
  todos: Todo[];
  /** Instant de la requête : les jours sont calculés par rapport à lui. */
  maintenant: number;
  ajouterAction: (saisie: string) => Promise<ResultatAjout>;
}) {
  const [saisie, setSaisie] = useState("");
  const [erreur, setErreur] = useState<string | null>(null);
  const [dernierAjoutId, setDernierAjoutId] = useState<string | null>(null);
  const [annonce, setAnnonce] = useState("");
  const [affiches, afficherAjout] = useOptimistic(todos, (liste: Todo[], ajout: Todo) => [...liste, ajout]);
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
    compteurAttente.current += 1;
    const enAttente: Todo = {
      id: `en-attente-${compteurAttente.current}`,
      titre: verdict.titre,
      creeLe: Date.now(),
      termine: false,
    };
    startTransition(async () => {
      afficherAjout(enAttente);
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
        {registre.jours.length === 0 ? (
          <EtatVide />
        ) : (
          <Registre jours={registre.jours} enAttente={enAttente} dernierAjoutId={dernierAjoutId} />
        )}
      </main>
    </div>
  );
}
