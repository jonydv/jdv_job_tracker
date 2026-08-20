import { Compass } from "lucide-react"
import { cn } from "@/lib/utils"

export function Logo({
  label,
  className,
  markClassName,
}: {
  label: string
  className?: string
  markClassName?: string
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span
        className={cn(
          "bg-primary text-primary-foreground flex size-8 shrink-0 items-center justify-center rounded-lg shadow-sm",
          markClassName
        )}
      >
        <Compass className="size-4.5" strokeWidth={2.25} aria-hidden="true" />
      </span>
      <span className="font-display text-xl leading-none font-semibold tracking-tight">
        {label}
      </span>
    </span>
  )
}
