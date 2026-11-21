"use client";

import { Monitor, Moon, Sun, type LucideIcon } from "lucide-react";
import { useLayoutEffect, useSyncExternalStore } from "react";
import { CHOIX_THEME, lireChoixTheme, themeAffiche, type ChoixTheme } from "@/service/theme";
import { RadioGroup, RadioGroupSegment } from "@/presentation/ui/radio-group";
import { CLE_THEME, SYSTEME_SOMBRE } from "./script-theme";

const ICONES: Record<ChoixTheme, LucideIcon> = { systeme: Monitor, clair: Sun, sombre: Moon };

/** Sélecteurs affichés : chacun se redessine quand le choix change. */
const abonnes = new Set<() => void>();

function abonner(rappel: () => void): () => void {
  abonnes.add(rappel);
  return () => abonnes.delete(rappel);
}

function choixEnregistre(): ChoixTheme {
  try {
    return lireChoixTheme(window.localStorage.getItem(CLE_THEME));
  } catch {
    return "systeme";
  }
}

/** Le serveur ne connaît pas le choix : il rend « Système », corrigé dès l'hydratation. */
function choixDuServeur(): ChoixTheme {
  return "systeme";
}

/** « Système » efface le choix : le script du <head> suit alors de nouveau le système. */
function enregistrer(choix: ChoixTheme) {
  try {
    if (choix === "systeme") window.localStorage.removeItem(CLE_THEME);
    else window.localStorage.setItem(CLE_THEME, choix);
  } catch {
    // Stockage inaccessible : le choix vaut pour cette page seulement.
  }
}

function appliquer(choix: ChoixTheme) {
  const systemeSombre = window.matchMedia?.(SYSTEME_SOMBRE).matches ?? false;
  document.documentElement.setAttribute("data-theme", themeAffiche(choix, systemeSombre));
}

/**
 * Sélecteur de thème du champ vermillon : trois pastilles, Système, Clair et Sombre, toujours visibles.
 * Un toucher suffit ; le choix actif est la pastille pleine. Au clavier, c'est un groupe de boutons radio :
 * Tab y entre sur le choix actif, les flèches changent de choix. Le choix s'applique tout de suite et reste
 * dans le navigateur ; le script du <head> le repose à chaque ouverture.
 */
export function SelecteurTheme() {
  const choix = useSyncExternalStore(abonner, choixEnregistre, choixDuServeur);

  // En dev, le mode Strict remonte la page et React efface l'attribut posé par le script du <head> : on le repose avant l'affichage.
  useLayoutEffect(() => appliquer(choixEnregistre()), []);

  function choisir(valeur: unknown) {
    const suivant = lireChoixTheme(valeur);
    enregistrer(suivant);
    appliquer(suivant);
    abonnes.forEach((rappel) => rappel());
  }

  return (
    <RadioGroup
      aria-label="Thème"
      value={choix}
      onValueChange={choisir}
      className="flex w-auto shrink-0 gap-0.5 rounded-full border-2 border-shell-foreground/45 p-0.5"
    >
      {CHOIX_THEME.map(({ valeur, libelle }) => {
        const Icone = ICONES[valeur];
        return (
          <RadioGroupSegment
            key={valeur}
            value={valeur}
            aria-label={libelle}
            title={libelle}
            className="size-9 text-shell-foreground hover:bg-shell-foreground/15 focus-visible:outline-shell-foreground data-checked:bg-shell-foreground data-checked:text-shell"
          >
            <Icone aria-hidden className="size-[1.125rem]" />
          </RadioGroupSegment>
        );
      })}
    </RadioGroup>
  );
}
