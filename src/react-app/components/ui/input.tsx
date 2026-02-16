import * as React from "react"

import { cn } from "@/react-app/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "border-4 border-black bg-white text-black placeholder:text-gray-500 h-12 px-4 py-3 text-base font-medium shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all focus:outline-none focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:translate-x-[2px] focus:translate-y-[2px] disabled:cursor-not-allowed disabled:opacity-50 w-full min-w-0 file:border-0 file:bg-black file:text-white file:text-sm file:font-bold file:mr-4 file:px-4 file:py-2 file:inline-flex",
        className
      )}
      {...props}
    />
  )
}

export { Input }
