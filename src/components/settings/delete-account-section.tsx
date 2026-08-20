"use client"

import { useState, useTransition } from "react"
import { useTranslations } from "next-intl"
import { toast } from "sonner"
import { Trash2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  deleteAccount,
  signOutAfterAccountDeletion,
} from "@/server/actions/account"
import { translateKey } from "@/lib/translate-key"

export function DeleteAccountSection({ userEmail }: { userEmail: string }) {
  const t = useTranslations()
  const [email, setEmail] = useState("")
  const [isPending, startTransition] = useTransition()

  const canDelete = email.trim().toLowerCase() === userEmail.toLowerCase()

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteAccount({ email })
      if (result.ok) {
        await signOutAfterAccountDeletion()
      } else {
        toast.error(translateKey(t, result.errorKey))
      }
    })
  }

  return (
    <section className="border-destructive/30 rounded-lg border p-4">
      <h2 className="text-destructive font-medium">
        {t("settings.dangerZone.title")}
      </h2>
      <p className="text-muted-foreground mt-1 text-sm">
        {t("settings.dangerZone.description")}
      </p>
      <div className="mt-3 grid max-w-sm gap-1.5">
        <Label htmlFor="delete-email">
          {t("settings.dangerZone.emailLabel")}
        </Label>
        <Input
          id="delete-email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder={userEmail}
        />
      </div>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="destructive" className="mt-3" disabled={!canDelete}>
            <Trash2 className="size-4" aria-hidden="true" />
            {t("settings.dangerZone.confirm")}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("settings.dangerZone.title")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("settings.dangerZone.description")}
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
              {t("settings.dangerZone.confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  )
}
