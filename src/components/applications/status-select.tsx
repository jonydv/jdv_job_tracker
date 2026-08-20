"use client"

import { useTransition } from "react"
import { useTranslations } from "next-intl"
import { toast } from "sonner"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { updateApplicationStatus } from "@/server/actions/application"
import { translateKey } from "@/lib/translate-key"
import { APPLICATION_STATUSES } from "@/lib/constants"
import { useRouter } from "@/i18n/navigation"
import type { ApplicationStatus } from "@/generated/prisma/client"

export function StatusSelect({
  applicationId,
  status,
}: {
  applicationId: string
  status: ApplicationStatus
}) {
  const t = useTranslations()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function handleChange(nextStatus: ApplicationStatus) {
    startTransition(async () => {
      const result = await updateApplicationStatus({
        id: applicationId,
        status: nextStatus,
      })
      if (result.ok) {
        toast.success(t("application.toasts.statusUpdated"))
        router.refresh()
      } else {
        toast.error(translateKey(t, result.errorKey))
      }
    })
  }

  return (
    <Select
      value={status}
      disabled={isPending}
      onValueChange={(value) => handleChange(value as ApplicationStatus)}
    >
      <SelectTrigger
        size="sm"
        className="w-auto border-transparent bg-transparent shadow-none"
        aria-label={t("application.actions.changeStatus")}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {APPLICATION_STATUSES.map((value) => (
          <SelectItem key={value} value={value}>
            {t(`enums.status.${value}`)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
