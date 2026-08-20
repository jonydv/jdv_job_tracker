"use client"

import { useState, useTransition } from "react"
import { useTranslations, useLocale } from "next-intl"
import { toast } from "sonner"
import { Plus, Trash2 } from "lucide-react"
import { useRouter } from "@/i18n/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  addStage,
  deleteStage,
  toggleStageCompleted,
  updateStage,
} from "@/server/actions/stage"
import { translateKey } from "@/lib/translate-key"
import { formatDateTime } from "@/lib/dates"
import { STAGE_TYPES } from "@/lib/constants"
import type { InterviewStage, StageType } from "@/generated/prisma/client"

function StageRow({
  stage,
  onUpdated,
  onDeleted,
}: {
  stage: InterviewStage
  onUpdated: (stage: InterviewStage) => void
  onDeleted: (id: string) => void
}) {
  const t = useTranslations()
  const locale = useLocale()
  const [isPending, startTransition] = useTransition()
  const [feedback, setFeedback] = useState(stage.feedback ?? "")

  function handleToggle() {
    startTransition(async () => {
      const result = await toggleStageCompleted({ id: stage.id })
      if (result.ok) {
        toast.success(t("stage.toasts.statusUpdated"))
        onUpdated(result.data)
      } else {
        toast.error(translateKey(t, result.errorKey))
      }
    })
  }

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteStage({ id: stage.id })
      if (result.ok) {
        toast.success(t("stage.toasts.deleted"))
        onDeleted(stage.id)
      } else {
        toast.error(translateKey(t, result.errorKey))
      }
    })
  }

  function handleFeedbackBlur() {
    if (feedback === (stage.feedback ?? "")) return
    startTransition(async () => {
      const result = await updateStage({
        id: stage.id,
        type: stage.type,
        title: stage.title ?? undefined,
        scheduledAt: stage.scheduledAt ?? undefined,
        feedback,
      })
      if (result.ok) {
        toast.success(t("stage.toasts.updated"))
        onUpdated(result.data)
      } else {
        toast.error(translateKey(t, result.errorKey))
      }
    })
  }

  return (
    <div className="flex flex-col gap-2 rounded-md border p-3">
      <div className="flex items-start justify-between gap-2">
        <label className="flex items-start gap-2 text-sm">
          <Checkbox
            checked={Boolean(stage.completedAt)}
            onCheckedChange={handleToggle}
            disabled={isPending}
            className="mt-0.5"
          />
          <span>
            <span className="font-medium">
              {t(`enums.stageType.${stage.type}`)}
            </span>
            {stage.title ? (
              <span className="text-muted-foreground"> — {stage.title}</span>
            ) : null}
            {stage.scheduledAt ? (
              <span className="text-muted-foreground block text-xs">
                {formatDateTime(stage.scheduledAt, locale)}
              </span>
            ) : null}
          </span>
        </label>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-7"
          aria-label={t("stage.delete")}
          disabled={isPending}
          onClick={handleDelete}
        >
          <Trash2 className="size-3.5" aria-hidden="true" />
        </Button>
      </div>
      <Textarea
        rows={2}
        placeholder={t("stage.fields.feedback")}
        value={feedback}
        onChange={(event) => setFeedback(event.target.value)}
        onBlur={handleFeedbackBlur}
        className="text-sm"
      />
    </div>
  )
}

export function StagesSection({
  applicationId,
  stages: initialStages,
}: {
  applicationId: string
  stages: InterviewStage[]
}) {
  const t = useTranslations()
  const router = useRouter()
  const [stages, setStages] = useState(initialStages)
  const [isPending, startTransition] = useTransition()
  const [type, setType] = useState<StageType>("HR_SCREEN")
  const [title, setTitle] = useState("")
  const [scheduledAt, setScheduledAt] = useState("")

  function syncOuterTable() {
    router.refresh()
  }

  function handleUpdated(stage: InterviewStage) {
    setStages((prev) => prev.map((s) => (s.id === stage.id ? stage : s)))
    syncOuterTable()
  }

  function handleDeleted(id: string) {
    setStages((prev) => prev.filter((s) => s.id !== id))
    syncOuterTable()
  }

  function handleAdd() {
    startTransition(async () => {
      const result = await addStage({
        applicationId,
        type,
        title: title || undefined,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
      })
      if (result.ok) {
        toast.success(t("stage.toasts.added"))
        setStages((prev) => [...prev, result.data])
        setTitle("")
        setScheduledAt("")
        syncOuterTable()
      } else {
        toast.error(translateKey(t, result.errorKey))
      }
    })
  }

  return (
    <div className="flex flex-col gap-3 border-t pt-4">
      <Label>{t("stage.title")}</Label>

      {stages.length === 0 ? (
        <p className="text-muted-foreground text-sm">{t("stage.empty")}</p>
      ) : (
        <div className="flex flex-col gap-2">
          {stages.map((stage) => (
            <StageRow
              key={stage.id}
              stage={stage}
              onUpdated={handleUpdated}
              onDeleted={handleDeleted}
            />
          ))}
        </div>
      )}

      <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
        <div className="grid flex-1 gap-1.5">
          <Label className="text-xs">{t("stage.fields.type")}</Label>
          <Select
            value={type}
            onValueChange={(value) => setType(value as StageType)}
          >
            <SelectTrigger aria-label={t("stage.fields.type")}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STAGE_TYPES.map((value) => (
                <SelectItem key={value} value={value}>
                  {t(`enums.stageType.${value}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {type === "OTHER" ? (
          <div className="grid flex-1 gap-1.5">
            <Label className="text-xs">{t("stage.fields.title")}</Label>
            <Input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder={t("stage.fields.titlePlaceholder")}
            />
          </div>
        ) : null}
        <div className="grid gap-1.5">
          <Label htmlFor="stageScheduledAt" className="text-xs">
            {t("stage.fields.scheduledAt")}
          </Label>
          <Input
            id="stageScheduledAt"
            type="date"
            value={scheduledAt}
            onChange={(event) => setScheduledAt(event.target.value)}
          />
        </div>
        <Button
          type="button"
          variant="outline"
          disabled={isPending || (type === "OTHER" && !title.trim())}
          onClick={handleAdd}
        >
          <Plus className="size-4" aria-hidden="true" />
          {t("stage.add")}
        </Button>
      </div>
    </div>
  )
}
