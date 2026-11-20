import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"
import { cn } from "cn"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        // Cartouche : feuille blanche, trait de 1 px, focus = trait encre + halo surligneur.
        "h-9 w-full min-w-0 rounded-lg border border-input bg-card px-3 py-1 text-base text-card-foreground transition-[color,box-shadow,border-color] outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-ring focus-visible:ring-6 focus-visible:ring-signature disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-60 read-only:bg-muted aria-invalid:border-destructive aria-invalid:outline-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/25",
        className
      )}
      {...props}
    />
  )
}

export { Input }
