"use client"

import { Checkbox as CheckboxPrimitive } from "@base-ui/react/checkbox"
import { cn } from "cn"
import { CheckIcon } from "lucide-react"

function Checkbox({ className, ...props }: CheckboxPrimitive.Root.Props) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        // Cartouche : case nette de 20 px, trait de 1,5 px, cochée à l'encre ; focus = trait encre + halo surligneur.
        "peer relative flex size-5 shrink-0 items-center justify-center rounded-lg border-[1.5px] border-input bg-card transition-[background-color,border-color,box-shadow] duration-150 outline-none after:absolute after:-inset-x-3 after:-inset-y-2.5 hover:border-ring focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-ring focus-visible:ring-6 focus-visible:ring-signature disabled:cursor-not-allowed disabled:opacity-60 aria-invalid:border-destructive data-checked:border-primary data-checked:bg-primary data-checked:text-primary-foreground",
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="grid place-content-center text-current transition-none [&>svg]:size-3.5 [&>svg]:stroke-3"
      >
        <CheckIcon
        />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox }
