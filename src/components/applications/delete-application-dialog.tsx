"use client"

import { useTransition } from "react"
import { useTranslations } from "next-intl"
import { toast } from "sonner"
import { Trash2 } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { deleteApplication } from "@/server/actions/application"
import { translateKey } from "@/lib/translate-key"
import { useRouter } from "@/i18n/navigation"

export function DeleteApplicationDialog({
  open,
  onOpenChange,
  applicationId,
  companyName,
  jobTitle,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  applicationId: string
  companyName: string
  jobTitle: string
}) {
  const t = useTranslations()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteApplication({ id: applicationId })
      if (result.ok) {
        toast.success(t("application.toasts.deleted"))
        onOpenChange(false)
        router.refresh()
      } else {
        toast.error(translateKey(t, result.errorKey))
      }
    })
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {t("application.deleteConfirm.title")}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {t("application.deleteConfirm.description", {
              company: companyName,
              role: jobTitle,
            })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>
            {t("common.cancel")}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(event) => {
              event.preventDefault()
              handleDelete()
            }}
            disabled={isPending}
            className="bg-destructive hover:bg-destructive/90 text-white"
          >
            <Trash2 className="size-4" aria-hidden="true" />
            {t("application.deleteConfirm.confirm")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
