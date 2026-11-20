import type { Metadata } from "next";
import { io } from "next/cache";
import { Suspense } from "react";
import { ChargementRegistre } from "@/presentation/maquette/chargement-registre";
import { estScenario } from "@/presentation/maquette/donnees-fictives";
import { MaquetteTodo } from "@/presentation/maquette/maquette-todo";

export const metadata: Metadata = {
  title: "Maquette · Mes TODO",
  description: "Maquette dynamique de l'écran TODO, avec des données fictives.",
};

export default function MaquettePage({ searchParams }: PageProps<"/maquette">) {
  return (
    <Suspense fallback={<ChargementRegistre />}>
      <RegistreDuJour searchParams={searchParams} />
    </Suspense>
  );
}

/** L'heure est lue à la requête, hors du rendu statique : les jours affichés suivent la date réelle. */
async function heureDeLaRequete(): Promise<number> {
  await io();
  return Date.now();
}

async function RegistreDuJour({ searchParams }: Pick<PageProps<"/maquette">, "searchParams">) {
  const { etat } = await searchParams;
  const maintenant = await heureDeLaRequete();
  return (
    <MaquetteTodo maintenant={maintenant} scenarioInitial={estScenario(etat) ? etat : "liste"} />
  );
}
