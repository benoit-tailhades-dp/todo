import { ArrowUp } from "lucide-react";

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
