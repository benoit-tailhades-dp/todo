import type { Ref } from "react";
import { CircleAlert, Plus } from "lucide-react";
import { Button } from "@/presentation/ui/button";
import { Input } from "@/presentation/ui/input";

/**
 * Saisie d'un TODO : un champ en pilule et le bouton noir. Téléphone : posée en bas de l'écran, à portée
 * du pouce, le message au-dessus du champ. Large : en tête de la liste, le message dessous.
 * Le contrôle du titre appartient au service.
 */
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
    <div className="flex flex-col">
      <form
        noValidate
        className="flex gap-2 sm:gap-3"
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
          className="h-13 min-w-0 flex-1 rounded-full border-2 border-foreground bg-background px-5 text-[1.0625rem] caret-signature aria-invalid:border-destructive aria-invalid:outline-destructive lg:h-16 lg:px-7 lg:text-[1.1875rem]"
        />
        <Button
          type="submit"
          className="h-13 shrink-0 gap-1.5 rounded-full px-5 text-base font-bold lg:h-16 lg:px-8 lg:text-[1.1875rem]"
        >
          <Plus data-icon="inline-start" aria-hidden className="size-5 stroke-[2.5]" />
          Ajouter
        </Button>
      </form>
      {erreur ? (
        <p
          id="erreur-titre"
          role="alert"
          className="order-first mb-2.5 flex animate-apparait items-center gap-2 px-1 text-[0.9375rem] font-semibold text-destructive lg:order-last lg:mt-3 lg:mb-0 lg:pl-7"
        >
          <CircleAlert className="size-[1.125rem] shrink-0" aria-hidden />
          {erreur}
        </p>
      ) : (
        <p id="aide-titre" className="mt-2 px-1 text-[0.8125rem] font-medium text-muted-foreground lg:mt-3 lg:pl-7">
          <span className="lg:hidden">Glisse une ligne vers la droite pour la terminer</span>
          <span className="max-lg:hidden">Entrée pour ajouter · Échap pour effacer</span>
        </p>
      )}
    </div>
  );
}
