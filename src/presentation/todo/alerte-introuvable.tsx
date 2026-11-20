import { CircleAlert, X } from "lucide-react";
import { Alert, AlertAction, AlertDescription, AlertTitle } from "@/presentation/ui/alert";
import { Button } from "@/presentation/ui/button";

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
