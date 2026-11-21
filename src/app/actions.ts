"use server";

import { refresh } from "next/cache";
import type { ResultatAjout, ResultatChangerDate, ResultatTerminer } from "@/service/todo-service";
import { todoService } from "@/service/instances";

/** Ajoute un TODO, puis recharge la page avec la base. Le service valide le titre. */
export async function ajouterTodo(saisie: string): Promise<ResultatAjout> {
  const resultat = await todoService().ajouter(saisie, Date.now());
  if (resultat.ok) refresh();
  return resultat;
}

/** Marque un TODO terminé, puis recharge la page avec la base, même s'il était introuvable. */
export async function terminerTodo(id: string): Promise<ResultatTerminer> {
  const resultat = await todoService().terminer(id);
  refresh();
  return resultat;
}

/** Range un TODO sous un autre jour, puis recharge la page avec la base, même si le changement est refusé. */
export async function changerDateTodo(id: string, jour: string): Promise<ResultatChangerDate> {
  const resultat = await todoService().changerDate(id, jour);
  refresh();
  return resultat;
}
