import type { Registre as RegistreDuService } from "@/service/todo-service";
import { Bandeau } from "./bandeau";
import { EtatVide } from "./etat-vide";
import { Registre } from "./registre";

/** L'écran de l'application : le bandeau, puis la liste rangée par jour, ou l'état vide. */
export function EcranTodo({ registre }: { registre: RegistreDuService }) {
  return (
    <div className="flex flex-1 flex-col">
      <Bandeau date={registre.dateDuJour} />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 pt-6 pb-32 sm:px-6 sm:pt-8">
        {registre.jours.length === 0 ? <EtatVide /> : <Registre jours={registre.jours} />}
      </main>
    </div>
  );
}
