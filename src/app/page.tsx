import type { Metadata } from "next";
import { io } from "next/cache";
import { Suspense } from "react";
import { ChargementListe } from "@/presentation/todo/chargement-liste";
import { EcranTodo } from "@/presentation/todo/ecran-todo";
import { todoService } from "@/service/instances";

export const metadata: Metadata = {
  title: "Mes TODO",
  description: "Ma liste de TODO, rangée par jour d'ajout.",
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
  const registre = await todoService().consulter(maintenant);
  return <EcranTodo registre={registre} />;
}
