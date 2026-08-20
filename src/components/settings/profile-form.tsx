"use client"

import { useState, useTransition, type FormEvent } from "react"
import { useTranslations } from "next-intl"
import { toast } from "sonner"
import { Save } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { updateProfile } from "@/server/actions/account"
import { translateKey } from "@/lib/translate-key"

export function ProfileForm({ initialName }: { initialName: string }) {
  const t = useTranslations()
  const [name, setName] = useState(initialName)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    startTransition(async () => {
      const result = await updateProfile({ name })
      if (result.ok) {
        toast.success(t("settings.toasts.profileUpdated"))
      } else {
        toast.error(translateKey(t, result.errorKey))
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-sm flex-col gap-3">
      <div className="grid gap-1.5">
        <Label htmlFor="profile-name">{t("settings.profile.nameLabel")}</Label>
        <Input
          id="profile-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
      </div>
      <Button type="submit" disabled={isPending} className="w-fit">
        <Save className="size-4" aria-hidden="true" />
        {t("settings.profile.save")}
      </Button>
    </form>
  )
}
