"use server";

import { refresh } from "next/cache";
import type { ResultatAjout } from "@/service/todo-service";
import { todoService } from "@/service/instances";

/** Ajoute un TODO, puis recharge la page avec la base. Le service valide le titre. */
export async function ajouterTodo(saisie: string): Promise<ResultatAjout> {
  const resultat = await todoService().ajouter(saisie, Date.now());
  if (resultat.ok) refresh();
  return resultat;
}
