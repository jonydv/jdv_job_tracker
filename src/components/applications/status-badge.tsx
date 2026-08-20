import {
  Send,
  Search,
  Users,
  Award,
  XCircle,
  Undo2,
  type LucideIcon,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { ApplicationStatus } from "@/generated/prisma/client"

const statusIcon: Record<ApplicationStatus, LucideIcon> = {
  APPLIED: Send,
  SCREENING: Search,
  INTERVIEWING: Users,
  OFFER: Award,
  REJECTED: XCircle,
  WITHDRAWN: Undo2,
}

const statusClassName: Record<ApplicationStatus, string> = {
  APPLIED:
    "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-300",
  SCREENING:
    "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300",
  INTERVIEWING:
    "border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-900 dark:bg-violet-950 dark:text-violet-300",
  OFFER:
    "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300",
  REJECTED:
    "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300",
  WITHDRAWN:
    "border-zinc-200 bg-zinc-50 text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400",
}

export function StatusBadge({
  status,
  label,
}: {
  status: ApplicationStatus
  label: string
}) {
  const Icon = statusIcon[status]

  return (
    <Badge
      variant="outline"
      className={cn("gap-1 font-medium", statusClassName[status])}
    >
      <Icon className="size-3" aria-hidden="true" />
      {label}
    </Badge>
  )
}
