import type { Ref } from "react";
import { CircleAlert, Plus } from "lucide-react";
import { Button } from "@/presentation/ui/button";
import { Input } from "@/presentation/ui/input";

/** Saisie d'un TODO, posée sur le bandeau. Le contrôle du titre appartient au service. */
export function FormulaireAjout({
  valeur,
  erreur,
  refChamp,
  onValeurChange,
  onAjouter,
  onAbandon,
}: {
  valeur: string;
  erreur: string | null;
  refChamp?: Ref<HTMLInputElement>;
  onValeurChange: (valeur: string) => void;
  onAjouter: () => void;
  /** Sortie du champ ou Échap : l'erreur affichée n'a plus lieu d'être. */
  onAbandon?: () => void;
}) {
  return (
    <div>
      <form
        noValidate
        className="flex gap-2"
        onSubmit={(evenement) => {
          evenement.preventDefault();
          onAjouter();
        }}
      >
        <label htmlFor="nouveau-todo" className="sr-only">
          Nouveau TODO
        </label>
        <Input
          ref={refChamp}
          id="nouveau-todo"
          value={valeur}
          onChange={(evenement) => onValeurChange(evenement.target.value)}
          onKeyDown={(evenement) => {
            if (evenement.key === "Escape") {
              onValeurChange("");
              onAbandon?.();
            }
          }}
          onBlur={() => onAbandon?.()}
          placeholder="Écris un nouveau TODO"
          autoComplete="off"
          enterKeyHint="done"
          aria-invalid={erreur ? true : undefined}
          aria-describedby={erreur ? "erreur-titre" : "aide-titre"}
          className="h-11 min-w-0 flex-1 border-shell-foreground focus-visible:outline-shell-foreground"
        />
        <Button
          type="submit"
          variant="signature"
          size="lg"
          className="h-11 px-4 text-base focus-visible:outline-shell-foreground sm:px-5"
        >
          <Plus data-icon="inline-start" aria-hidden />
          Ajouter
        </Button>
      </form>
      {erreur ? (
        <p
          id="erreur-titre"
          role="alert"
          className="mt-2.5 inline-flex animate-apparait items-center gap-1.5 rounded-sm bg-signature px-2 py-1 text-[0.8125rem] font-medium text-signature-foreground"
        >
          <CircleAlert className="size-4 shrink-0" aria-hidden />
          {erreur}
        </p>
      ) : (
        <p id="aide-titre" className="mt-2.5 text-xs font-medium text-shell-foreground/75">
          Entrée pour ajouter<span className="hidden sm:inline"> · Échap pour effacer</span>
        </p>
      )}
    </div>
  );
}
