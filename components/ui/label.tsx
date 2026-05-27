import * as React from "react"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

export type LabelProps = React.ComponentProps<"label"> & {
  asChild?: boolean
}

function Label({ className, asChild = false, ...props }: LabelProps) {
  const Comp = asChild ? Slot.Root : "label"

  return (
    <Comp
      data-slot="label"
      className={cn(
        "text-sm leading-none font-medium select-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
        className
      )}
      {...props}
    />
  )
}

export { Label }

