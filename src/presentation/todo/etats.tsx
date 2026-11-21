import { ArrowUp, CheckCheck, CircleAlert, X } from "lucide-react";
import { Alert, AlertAction, AlertDescription, AlertTitle } from "@/presentation/ui/alert";
import { Button } from "@/presentation/ui/button";

function Encart({
  id,
  icone,
  titre,
  children,
}: {
  id: string;
  icone: React.ReactNode;
  titre: string;
  children: React.ReactNode;
}) {
  return (
    <section
      aria-labelledby={id}
      className="animate-apparait rounded-xl border border-border bg-card px-5 py-8 sm:px-8 sm:py-10"
    >
      <div className="mb-3 text-primary">{icone}</div>
      <h2 id={id} className="text-xl leading-tight">
        {titre}
      </h2>
      <p className="mt-1.5 max-w-prose text-pretty text-muted-foreground">{children}</p>
    </section>
  );
}

export function EtatVide() {
  return (
    <Encart id="etat-vide" icone={<ArrowUp className="size-5" aria-hidden />} titre="Aucun TODO pour l'instant">
      Écris ton premier TODO dans le champ ci-dessus, puis appuie sur Entrée. Il se rangera sous
      « Aujourd&apos;hui » et le compteur passera à 1.
    </Encart>
  );
}

export function EtatToutTermine({ nombre }: { nombre: number }) {
  return (
    <Encart
      id="etat-tout-termine"
      icone={<CheckCheck className="size-5" aria-hidden />}
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
