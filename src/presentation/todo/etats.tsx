import { Check, CircleAlert, Plus, X } from "lucide-react";
import { cn } from "@/presentation/lib/utils";
import { Alert, AlertAction, AlertDescription, AlertTitle } from "@/presentation/ui/alert";
import { Button } from "@/presentation/ui/button";

/** Un état sans liste, en affiche : un disque, un grand titre, une phrase. */
function Encart({
  id,
  icone,
  disque,
  titre,
  children,
}: {
  id: string;
  icone: React.ReactNode;
  /** Classes du disque qui porte l'icône. */
  disque: string;
  titre: string;
  children: React.ReactNode;
}) {
  return (
    <section aria-labelledby={id} className="animate-apparait pt-6 lg:pt-16">
      <div className={cn("mb-7 flex size-20 items-center justify-center rounded-full lg:size-24", disque)}>
        {icone}
      </div>
      <h2 id={id} className="text-[2rem] leading-[1.05] text-balance sm:text-[2.75rem]">
        {titre}
      </h2>
      <p className="mt-3 max-w-[34rem] text-[1.0625rem] text-pretty text-muted-foreground">{children}</p>
    </section>
  );
}

export function EtatVide() {
  return (
    <Encart
      id="etat-vide"
      disque="border-[3px] border-foreground text-foreground"
      icone={<Plus className="size-9 stroke-[2.5]" aria-hidden />}
      titre="Aucun TODO pour l'instant"
    >
      Écris ton premier TODO dans le champ, puis appuie sur Entrée. Il se rangera sous « Aujourd&apos;hui »
      et le compteur passera à 1.
    </Encart>
  );
}

/** Tout est fait : le disque vermillon se pose avec un léger ressort, c'est le moment de la journée. */
export function EtatToutTermine({ nombre }: { nombre: number }) {
  return (
    <Encart
      id="etat-tout-termine"
      disque="animate-coche bg-signature text-signature-foreground [animation-duration:600ms]"
      icone={<Check className="size-10 stroke-3" aria-hidden />}
      titre="Rien à faire pour l'instant"
    >
      {nombre === 1 ? "Ton TODO est terminé." : `Tes ${nombre} TODO sont terminés.`} Le prochain que tu
      ajoutes s&apos;affichera ici.
    </Encart>
  );
}

/** Le TODO coché n'existe plus en base : rien n'a été modifié. */
export function AlerteIntrouvable({ onFermer }: { onFermer: () => void }) {
  return (
    <Alert variant="destructive" className="mb-6 animate-apparait">
      <CircleAlert aria-hidden />
      <AlertTitle>Ce TODO n&apos;existe plus</AlertTitle>
      <AlertDescription>
        Il a été retiré de la base entre-temps. Rien n&apos;a été modifié et ta liste est à jour.
      </AlertDescription>
      <AlertAction>
        <Button variant="ghost" size="icon-sm" aria-label="Fermer le message" onClick={onFermer}>
          <X aria-hidden />
        </Button>
      </AlertAction>
    </Alert>
  );
}

/** Le serveur a refusé le jour choisi : le TODO n'a pas bougé. */
export function AlerteDateInvalide({ onFermer }: { onFermer: () => void }) {
  return (
    <Alert variant="destructive" className="mb-6 animate-apparait">
      <CircleAlert aria-hidden />
      <AlertTitle>Cette date n&apos;est pas valide</AlertTitle>
      <AlertDescription>
        Le TODO est resté sous son jour. Choisis un autre jour dans son calendrier.
      </AlertDescription>
      <AlertAction>
        <Button variant="ghost" size="icon-sm" aria-label="Fermer le message" onClick={onFermer}>
          <X aria-hidden />
        </Button>
      </AlertAction>
    </Alert>
  );
}
