"use client"

import { useState, useTransition } from "react"
import { useTranslations } from "next-intl"
import { toast } from "sonner"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { createPlatform } from "@/server/actions/platform"
import { translateKey } from "@/lib/translate-key"
import { useRouter } from "@/i18n/navigation"
import type { PlatformOption } from "@/types/application"

export function PlatformQuickCreate({
  onCreated,
}: {
  onCreated: (platform: PlatformOption) => void
}) {
  const t = useTranslations()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [isPending, startTransition] = useTransition()

  function handleCreate() {
    startTransition(async () => {
      const result = await createPlatform({ name })
      if (result.ok) {
        onCreated({
          id: result.data.id,
          name: result.data.name,
          slug: result.data.slug,
          isDefault: result.data.isDefault,
        })
        toast.success(t("platform.createTitle"))
        setName("")
        setOpen(false)
        router.refresh()
      } else {
        toast.error(translateKey(t, result.errorKey))
      }
    })
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label={t("platform.createTitle")}
        >
          <Plus className="size-4" aria-hidden="true" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-64">
        <div className="flex flex-col gap-2">
          <Label htmlFor="quick-platform-name">
            {t("platform.namePlaceholder")}
          </Label>
          <Input
            id="quick-platform-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder={t("platform.namePlaceholder")}
          />
          <Button
            type="button"
            size="sm"
            disabled={name.trim().length < 2 || isPending}
            onClick={handleCreate}
          >
            <Plus className="size-4" aria-hidden="true" />
            {t("platform.create")}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
