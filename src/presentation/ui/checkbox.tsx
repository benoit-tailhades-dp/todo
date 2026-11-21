"use client"

import { Checkbox as CheckboxPrimitive } from "@base-ui/react/checkbox"
import { cn } from "cn"
import { CheckIcon } from "lucide-react"

function Checkbox({ className, ...props }: CheckboxPrimitive.Root.Props) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        // Affiche : case ronde de 20 px, trait de 2 px, cochée au vermillon avec un léger ressort ; focus = trait noir décalé.
        "peer relative flex size-5 shrink-0 items-center justify-center rounded-full border-2 border-input bg-card transition-[background-color,border-color,box-shadow] duration-150 outline-none after:absolute after:-inset-x-3 after:-inset-y-2.5 hover:border-ring focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-60 aria-invalid:border-destructive data-checked:border-signature data-checked:bg-signature data-checked:text-signature-foreground",
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="grid animate-coche place-content-center text-current transition-none [&>svg]:size-3.5 [&>svg]:stroke-3"
      >
        <CheckIcon
        />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox }
