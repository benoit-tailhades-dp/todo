"use client";

import { useRef, useState, type MouseEvent, type PointerEvent } from "react";

/** Distance à parcourir pour que le geste compte (px). */
export const SEUIL_GESTE = 96;
/** Au-delà de cette distance, le doigt a choisi : horizontal (geste) ou vertical (défilement). */
const SEUIL_DIRECTION = 10;
/** Un clic qui suit un geste de moins de ce délai (ms) vient du doigt qui se lève : on l'ignore. */
const DELAI_CLIC_FANTOME = 400;

type Depart = { x: number; y: number; id: number; horizontal: boolean };

export type Geste = {
  /** Décalage de la ligne, amorti au-delà du seuil (px). */
  dx: number;
  /** Le doigt glisse la ligne. */
  enCours: boolean;
  /** Le seuil est franchi : relâcher déclenche l'action. */
  franchi: boolean;
  gestionnaires: {
    onPointerDown: (evenement: PointerEvent<HTMLElement>) => void;
    onPointerMove: (evenement: PointerEvent<HTMLElement>) => void;
    onPointerUp: (evenement: PointerEvent<HTMLElement>) => void;
    onPointerCancel: () => void;
    onClickCapture: (evenement: MouseEvent<HTMLElement>) => void;
  };
};

function amortir(dx: number): number {
  const distance = Math.abs(dx);
  return distance <= SEUIL_GESTE ? dx : Math.sign(dx) * (SEUIL_GESTE + (distance - SEUIL_GESTE) * 0.35);
}

/**
 * Glisser une ligne au doigt : vers la droite, puis relâcher au-delà du seuil, appelle `onDroite` ;
 * vers la gauche, `onGauche`. Seulement au toucher et au stylet : à la souris, la ligne se prend par
 * le glisser-déposer. Le défilement vertical reste au navigateur (la ligne porte `touch-action: pan-y`).
 */
export function useGesteLigne({
  actif,
  onDroite,
  onGauche,
}: {
  actif: boolean;
  onDroite: () => void;
  onGauche: () => void;
}): Geste {
  const [dx, setDx] = useState(0);
  const [enCours, setEnCours] = useState(false);
  const depart = useRef<Depart | null>(null);
  const finDuGeste = useRef(0);

  function annuler() {
    depart.current = null;
    setEnCours(false);
    setDx(0);
  }

  return {
    dx,
    enCours,
    franchi: Math.abs(dx) >= SEUIL_GESTE,
    gestionnaires: {
      onPointerDown(evenement) {
        if (!actif || evenement.pointerType === "mouse" || !evenement.isPrimary) return;
        depart.current = { x: evenement.clientX, y: evenement.clientY, id: evenement.pointerId, horizontal: false };
      },
      onPointerMove(evenement) {
        const d = depart.current;
        if (!d || evenement.pointerId !== d.id) return;
        const ecartX = evenement.clientX - d.x;
        const ecartY = evenement.clientY - d.y;
        if (!d.horizontal) {
          if (Math.abs(ecartY) > SEUIL_DIRECTION && Math.abs(ecartY) >= Math.abs(ecartX)) {
            depart.current = null;
            return;
          }
          if (Math.abs(ecartX) <= SEUIL_DIRECTION) return;
          d.horizontal = true;
          evenement.currentTarget.setPointerCapture?.(evenement.pointerId);
          setEnCours(true);
        }
        const suivant = amortir(ecartX);
        // Un léger retour au franchissement du seuil, là où le téléphone sait vibrer.
        if (Math.abs(suivant) >= SEUIL_GESTE && Math.abs(dx) < SEUIL_GESTE) navigator.vibrate?.(8);
        setDx(suivant);
      },
      onPointerUp(evenement) {
        const d = depart.current;
        depart.current = null;
        if (!d?.horizontal) return;
        finDuGeste.current = evenement.timeStamp;
        const ecart = evenement.clientX - d.x;
        setEnCours(false);
        setDx(0);
        if (ecart >= SEUIL_GESTE) onDroite();
        else if (ecart <= -SEUIL_GESTE) onGauche();
      },
      onPointerCancel: annuler,
      onClickCapture(evenement) {
        if (finDuGeste.current && evenement.timeStamp - finDuGeste.current < DELAI_CLIC_FANTOME) {
          evenement.preventDefault();
          evenement.stopPropagation();
        }
      },
    },
  };
}
