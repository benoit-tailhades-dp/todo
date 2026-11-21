import type { Metadata, Viewport } from "next";
import { io } from "next/cache";
import { Suspense } from "react";
import { ChargementListe } from "@/presentation/todo/chargement-liste";
import { EcranTodo } from "@/presentation/todo/ecran-todo";
import { todoService } from "@/service/instances";
import { ajouterTodo, changerDateTodo, terminerTodo } from "./actions";

export const metadata: Metadata = {
  title: "Mes TODO",
  description: "Ma liste de TODO, rangée par jour.",
};

// Téléphone : la saisie est posée en bas de l'écran. Le clavier réduit la page plutôt que de la recouvrir,
// et la page s'étend sous les bords arrondis (marge de sécurité gérée par la saisie).
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  interactiveWidget: "resizes-content",
};

export default function Page() {
  return (
    <Suspense fallback={<ChargementListe />}>
      <ListeDuJour />
    </Suspense>
  );
}

/** L'heure est lue à la requête, hors du rendu statique : les jours affichés suivent la date réelle. */
async function heureDeLaRequete(): Promise<number> {
  await io();
  return Date.now();
}

async function ListeDuJour() {
  const maintenant = await heureDeLaRequete();
  const todos = await todoService().lister();
  return (
    <EcranTodo
      todos={todos}
      maintenant={maintenant}
      ajouterAction={ajouterTodo}
      terminerAction={terminerTodo}
      changerDateAction={changerDateTodo}
    />
  );
}
