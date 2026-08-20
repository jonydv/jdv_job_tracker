"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ApplicationFormDialog } from "./application-form-dialog"
import type { PlatformOption } from "@/types/application"

export function CreateApplicationButton({
  platforms,
}: {
  platforms: PlatformOption[]
}) {
  const t = useTranslations("dashboard")
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="size-4" aria-hidden="true" />
        {t("newApplication")}
      </Button>
      <ApplicationFormDialog
        mode="create"
        open={open}
        onOpenChange={setOpen}
        platforms={platforms}
      />
    </>
  )
}
