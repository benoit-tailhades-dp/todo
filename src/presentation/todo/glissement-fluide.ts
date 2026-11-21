"use client";

import { useLayoutEffect, useRef, type RefObject } from "react";

/** La courbe `ease-trait` de globals.css : `@theme inline` ne l'expose pas en variable CSS lisible ici. */
const COURBE = "cubic-bezier(0.22, 1, 0.36, 1)";
const DUREE_DEPLACEMENT = 460;
const DUREE_ARRIVEE = 260;

/**
 * Les lignes glissent à leur nouvelle place au lieu d'y sauter (technique FLIP) : après chaque rendu,
 * on compare la position de chaque `[data-todo-id]` à celle du rendu précédent et on anime l'écart.
 * Une ligne qui arrive apparaît en fondu. Une ligne qui en remplace une autre à la même place (le TODO
 * en attente devenu enregistré) ne rejoue rien. Rien en mouvement réduit.
 */
export function useGlissementFluide(racine: RefObject<HTMLElement | null>) {
  const positions = useRef<Map<string, number> | null>(null);

  useLayoutEffect(() => {
    const element = racine.current;
    if (!element) return;
    const origine = element.getBoundingClientRect().top;
    const reduit = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    const avant = positions.current;
    const apres = new Map<string, number>();
    const lignes = Array.from(element.querySelectorAll<HTMLElement>("[data-todo-id]"));

    for (const ligne of lignes) {
      const id = ligne.dataset.todoId;
      if (id) apres.set(id, ligne.getBoundingClientRect().top - origine);
    }

    if (avant && !reduit) {
      const placesLiberees = [...avant].filter(([id]) => !apres.has(id)).map(([, haut]) => haut);
      for (const ligne of lignes) {
        const id = ligne.dataset.todoId;
        const haut = id ? apres.get(id) : undefined;
        if (!id || haut === undefined || typeof ligne.animate !== "function") continue;
        const precedent = avant.get(id);
        if (precedent === undefined) {
          if (placesLiberees.some((place) => Math.abs(place - haut) < 2)) continue;
          ligne.animate(
            [
              { opacity: 0, transform: "translateY(-10px)" },
              { opacity: 1, transform: "none" },
            ],
            { duration: DUREE_ARRIVEE, easing: COURBE },
          );
        } else if (Math.abs(precedent - haut) > 1) {
          ligne.animate([{ transform: `translateY(${precedent - haut}px)` }, { transform: "none" }], {
            duration: DUREE_DEPLACEMENT,
            easing: COURBE,
          });
        }
      }
    }
    positions.current = apres;
  });
}
