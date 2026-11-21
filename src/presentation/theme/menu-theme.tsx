"use client";

import { Monitor, Moon, Sun, type LucideIcon } from "lucide-react";
import { useLayoutEffect, useSyncExternalStore } from "react";
import { CHOIX_THEME, lireChoixTheme, themeAffiche, type ChoixTheme } from "@/service/theme";
import { Button } from "@/presentation/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/presentation/ui/dropdown-menu";
import { CLE_THEME, SYSTEME_SOMBRE } from "./script-theme";

const ICONES: Record<ChoixTheme, LucideIcon> = { systeme: Monitor, clair: Sun, sombre: Moon };

/** Menus affichés : chacun se redessine quand le choix change. */
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
 * Bouton de thème du bandeau : Système, Clair ou Sombre. L'icône montre le choix, le nom du bouton l'annonce.
 * Le choix s'applique tout de suite et reste dans le navigateur ; le script du <head> le repose à chaque ouverture.
 */
export function MenuTheme({
  ouvert,
  onOuvertChange,
}: {
  ouvert?: boolean;
  onOuvertChange?: (ouvert: boolean) => void;
}) {
  const choix = useSyncExternalStore(abonner, choixEnregistre, choixDuServeur);
  const libelle = CHOIX_THEME.find((c) => c.valeur === choix)?.libelle ?? "Système";
  const Icone = ICONES[choix];

  // En dev, le mode Strict remonte la page et React efface l'attribut posé par le script du <head> : on le repose avant l'affichage.
  useLayoutEffect(() => appliquer(choixEnregistre()), []);

  function choisir(valeur: unknown) {
    const suivant = lireChoixTheme(valeur);
    enregistrer(suivant);
    appliquer(suivant);
    abonnes.forEach((rappel) => rappel());
  }

  return (
    <DropdownMenu open={ouvert} onOpenChange={onOuvertChange}>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Thème : ${libelle}`}
            className="border-shell-foreground/35 text-shell-foreground hover:bg-shell-foreground/10 hover:text-shell-foreground aria-expanded:bg-shell-foreground/10 aria-expanded:text-shell-foreground sm:h-full sm:w-12"
          />
        }
      >
        <Icone aria-hidden className="size-[1.125rem]" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-auto min-w-44">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Thème</DropdownMenuLabel>
          <DropdownMenuRadioGroup value={choix} onValueChange={choisir}>
            {CHOIX_THEME.map(({ valeur, libelle: nom }) => {
              const IconeDuChoix = ICONES[valeur];
              return (
                <DropdownMenuRadioItem key={valeur} value={valeur} closeOnClick>
                  <IconeDuChoix aria-hidden className="text-muted-foreground" />
                  {nom}
                </DropdownMenuRadioItem>
              );
            })}
          </DropdownMenuRadioGroup>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
