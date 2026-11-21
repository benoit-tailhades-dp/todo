"use client"

import { Radio as RadioPrimitive } from "@base-ui/react/radio"
import { RadioGroup as RadioGroupPrimitive } from "@base-ui/react/radio-group"
import { cn } from "cn"

function RadioGroup({ className, ...props }: RadioGroupPrimitive.Props) {
  return (
    <RadioGroupPrimitive
      data-slot="radio-group"
      className={cn("grid w-full gap-2", className)}
      {...props}
    />
  )
}

/** Affiche : bouton radio rond de 20 px, trait de 2 px, coché au vermillon ; focus = trait noir décalé de 2 px. */
function RadioGroupItem({ className, ...props }: RadioPrimitive.Root.Props) {
  return (
    <RadioPrimitive.Root
      data-slot="radio-group-item"
      className={cn(
        "group/radio-group-item peer relative flex aspect-square size-5 shrink-0 rounded-full border-2 border-input bg-card outline-none after:absolute after:-inset-x-3 after:-inset-y-2 hover:border-ring focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive data-checked:border-signature data-checked:bg-signature data-checked:text-signature-foreground",
        className
      )}
      {...props}
    >
      <RadioPrimitive.Indicator
        data-slot="radio-group-indicator"
        className="flex size-full items-center justify-center"
      >
        <span className="size-2 animate-coche rounded-full bg-signature-foreground" />
      </RadioPrimitive.Indicator>
    </RadioPrimitive.Root>
  )
}

/**
 * Affiche : un choix d'un sélecteur segmenté (pastilles côte à côte dans une pilule). Il porte son propre
 * contenu (icône, libellé) ; l'appelant donne les couleurs du fond sur lequel il est posé.
 */
function RadioGroupSegment({ className, ...props }: RadioPrimitive.Root.Props) {
  return (
    <RadioPrimitive.Root
      data-slot="radio-group-segment"
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full transition-colors duration-200 ease-trait outline-none select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
        className
      )}
      {...props}
    />
  )
}

export { RadioGroup, RadioGroupItem, RadioGroupSegment }
