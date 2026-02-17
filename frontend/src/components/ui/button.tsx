import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "border-4 border-black font-bold uppercase tracking-wide inline-flex items-center justify-center whitespace-nowrap transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none shrink-0 [&_svg]:shrink-0 outline-none group/button select-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-none active:translate-x-[4px] active:translate-y-[4px] [&_svg:not([class*='size-'])]:size-5",
  {
    variants: {
      variant: {
        default: "bg-black text-white hover:bg-black/90",
        outline: "bg-white text-black border-black hover:bg-gray-100",
        secondary: "bg-gray-200 text-black border-black hover:bg-gray-300",
        ghost: "border-transparent shadow-none hover:shadow-none hover:bg-gray-100 hover:translate-x-0 hover:translate-y-0",
        destructive: "bg-black text-white border-black hover:bg-black/90",
        link: "border-none shadow-none text-black underline-offset-4 hover:underline hover:shadow-none hover:translate-x-0 hover:translate-y-0",
      },
      size: {
        default: "h-11 gap-2 px-6 text-sm",
        xs: "h-7 gap-1 px-3 text-xs",
        sm: "h-9 gap-1.5 px-4 text-sm",
        lg: "h-14 gap-2 px-8 text-base",
        icon: "size-11",
        "icon-xs": "size-7",
        "icon-sm": "size-9",
        "icon-lg": "size-14",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }

