"use client"

import { useTranslations } from "next-intl"
import { ResponsiveDialog } from "@/components/layout/responsive-dialog"
import { ApplicationForm } from "./application-form"
import { APPLICATION_FORM_MODE, type ApplicationFormMode } from "@/lib/constants"
import type { ApplicationListItem, PlatformOption } from "@/types/application"

export function ApplicationFormDialog({
  mode,
  open,
  onOpenChange,
  application,
  platforms,
}: {
  mode: ApplicationFormMode
  open: boolean
  onOpenChange: (open: boolean) => void
  application?: ApplicationListItem
  platforms: PlatformOption[]
}) {
  const t = useTranslations("application")

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title={
        mode === APPLICATION_FORM_MODE.CREATE ? t("createTitle") : t("editTitle")
      }
    >
      <ApplicationForm
        mode={mode}
        application={application}
        platforms={platforms}
        onSuccess={() => onOpenChange(false)}
      />
    </ResponsiveDialog>
  )
}
