"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Eye, MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ApplicationFormDialog } from "./application-form-dialog"
import { ApplicationDetailDialog } from "./application-detail-dialog"
import { DeleteApplicationDialog } from "./delete-application-dialog"
import type { ApplicationListItem, PlatformOption } from "@/types/application"

export function ApplicationRowActions({
  application,
  platforms,
}: {
  application: ApplicationListItem
  platforms: PlatformOption[]
}) {
  const t = useTranslations()
  const [viewOpen, setViewOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            aria-label={t("dashboard.table.actions")}
            className="size-8"
          >
            <MoreHorizontal className="size-4" aria-hidden="true" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => setViewOpen(true)}>
            <Eye className="size-4" aria-hidden="true" />
            {t("application.actions.view")}
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setEditOpen(true)}>
            <Pencil className="size-4" aria-hidden="true" />
            {t("application.actions.edit")}
          </DropdownMenuItem>
          <DropdownMenuItem
            variant="destructive"
            onSelect={() => setDeleteOpen(true)}
          >
            <Trash2 className="size-4" aria-hidden="true" />
            {t("application.actions.delete")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ApplicationDetailDialog
        open={viewOpen}
        onOpenChange={setViewOpen}
        application={application}
      />

      <ApplicationFormDialog
        mode="edit"
        open={editOpen}
        onOpenChange={setEditOpen}
        application={application}
        platforms={platforms}
      />

      <DeleteApplicationDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        applicationId={application.id}
        companyName={application.companyName}
        jobTitle={application.jobTitle}
      />
    </>
  )
}
