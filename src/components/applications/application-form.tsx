"use client"

import { useEffect, useState, useTransition } from "react"
import { Save } from "lucide-react"
import { useForm, useWatch, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTranslations } from "next-intl"
import { toast } from "sonner"
import { useRouter } from "@/i18n/navigation"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { PlatformQuickCreate } from "@/components/platforms/platform-quick-create"
import { PlatformIcon } from "@/components/platforms/platform-icon"
import { StagesSection } from "./stages-section"
import { CountryCombobox } from "./country-combobox"
import { ApplicationLocationMap } from "./application-location-map"
import {
  applicationInputSchema,
  type ApplicationInput,
} from "@/lib/validation/application"
import { translateKey } from "@/lib/translate-key"
import { toDateOnlyInputValue } from "@/lib/dates"
import {
  APPLICATION_STATUSES,
  APPLICATION_FORM_MODE,
  LOCATION_TYPES,
  SALARY_PERIODS,
  CURRENCY_CODES,
  type ApplicationFormMode,
} from "@/lib/constants"
import {
  createApplication,
  updateApplication,
  checkApplicationDuplicate,
} from "@/server/actions/application"
import type { ApplicationListItem, PlatformOption } from "@/types/application"

const NO_PLATFORM = "__none__"

function FieldError({ message }: { message?: string }) {
  const t = useTranslations()
  if (!message) return null
  return <p className="text-destructive text-sm">{translateKey(t, message)}</p>
}

function toDefaultValues(application?: ApplicationListItem): ApplicationInput {
  if (!application) {
    return {
      platformId: null,
      companyName: "",
      jobTitle: "",
      jobUrl: "",
      salaryMin: undefined,
      salaryMax: undefined,
      salaryCurrency: undefined,
      salaryPeriod: undefined,
      locationType: "REMOTE",
      locationCity: "",
      locationCountry: undefined,
      status: "APPLIED",
      appliedAt: new Date(),
      notes: "",
    }
  }

  return {
    platformId: application.platformId,
    companyName: application.companyName,
    jobTitle: application.jobTitle,
    jobUrl: application.jobUrl ?? "",
    salaryMin: application.salaryMin ?? undefined,
    salaryMax: application.salaryMax ?? undefined,
    salaryCurrency:
      (application.salaryCurrency as ApplicationInput["salaryCurrency"]) ??
      undefined,
    salaryPeriod: application.salaryPeriod ?? undefined,
    locationType: application.locationType,
    locationCity: application.locationCity ?? "",
    locationCountry:
      (application.locationCountry as ApplicationInput["locationCountry"]) ??
      undefined,
    status: application.status,
    appliedAt: application.appliedAt,
    notes: application.notes ?? "",
  }
}

export function ApplicationForm({
  mode,
  application,
  platforms,
  onSuccess,
}: {
  mode: ApplicationFormMode
  application?: ApplicationListItem
  platforms: PlatformOption[]
  onSuccess: () => void
}) {
  const t = useTranslations()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [platformOptions, setPlatformOptions] = useState(platforms)
  const [duplicate, setDuplicate] = useState<{
    id: string
    companyName: string
    jobTitle: string
  } | null>(null)

  const form = useForm<ApplicationInput>({
    resolver: zodResolver(applicationInputSchema),
    defaultValues: toDefaultValues(application),
  })

  const companyName = useWatch({ control: form.control, name: "companyName" })
  const jobTitle = useWatch({ control: form.control, name: "jobTitle" })
  const jobUrl = useWatch({ control: form.control, name: "jobUrl" })
  const locationType = useWatch({ control: form.control, name: "locationType" })
  const locationCountry = useWatch({
    control: form.control,
    name: "locationCountry",
  })

  useEffect(() => {
    if (mode !== APPLICATION_FORM_MODE.CREATE) return

    const handle = setTimeout(async () => {
      if (!companyName || !jobTitle) {
        setDuplicate(null)
        return
      }

      const result = await checkApplicationDuplicate({
        companyName,
        jobTitle,
        jobUrl: jobUrl || undefined,
      })
      setDuplicate(result.ok ? (result.data ?? null) : null)
    }, 500)

    return () => clearTimeout(handle)
  }, [mode, companyName, jobTitle, jobUrl])

  function onSubmit(values: ApplicationInput) {
    startTransition(async () => {
      const result =
        mode === APPLICATION_FORM_MODE.CREATE
          ? await createApplication(values)
          : await updateApplication({ ...values, id: application!.id })

      if (result.ok) {
        toast.success(
          t(
            mode === APPLICATION_FORM_MODE.CREATE
              ? "application.toasts.created"
              : "application.toasts.updated"
          )
        )
        onSuccess()
        router.refresh()
      } else {
        toast.error(translateKey(t, result.errorKey))
      }
    })
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="flex flex-col gap-4 py-2"
    >
      {duplicate ? (
        <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300">
          {t("dashboard.duplicateWarning", {
            company: duplicate.companyName,
            role: duplicate.jobTitle,
          })}
        </p>
      ) : null}

      <div className="grid gap-1.5">
        <Label htmlFor="companyName">
          {t("application.fields.companyName")}
        </Label>
        <Input
          id="companyName"
          placeholder={t("application.fields.companyNamePlaceholder")}
          {...form.register("companyName")}
        />
        <FieldError message={form.formState.errors.companyName?.message} />
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="jobTitle">{t("application.fields.jobTitle")}</Label>
        <Input
          id="jobTitle"
          placeholder={t("application.fields.jobTitlePlaceholder")}
          {...form.register("jobTitle")}
        />
        <FieldError message={form.formState.errors.jobTitle?.message} />
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="jobUrl">{t("application.fields.jobUrl")}</Label>
        <Input
          id="jobUrl"
          placeholder={t("application.fields.jobUrlPlaceholder")}
          {...form.register("jobUrl")}
        />
        <FieldError message={form.formState.errors.jobUrl?.message} />
      </div>

      <div className="grid gap-1.5">
        <Label>{t("application.fields.platform")}</Label>
        <div className="flex gap-2">
          <Controller
            control={form.control}
            name="platformId"
            render={({ field }) => (
              <Select
                value={field.value ?? NO_PLATFORM}
                onValueChange={(value) =>
                  field.onChange(value === NO_PLATFORM ? null : value)
                }
              >
                <SelectTrigger
                  className="flex-1"
                  aria-label={t("application.fields.platform")}
                >
                  <SelectValue
                    placeholder={t("application.fields.platformPlaceholder")}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_PLATFORM}>
                    {t("application.fields.platformPlaceholder")}
                  </SelectItem>
                  {platformOptions.map((platform) => (
                    <SelectItem key={platform.id} value={platform.id}>
                      <span className="flex items-center gap-2">
                        <PlatformIcon
                          slug={platform.slug}
                          name={platform.name}
                        />
                        {platform.name}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <PlatformQuickCreate
            onCreated={(platform) => {
              setPlatformOptions((current) => [...current, platform])
              form.setValue("platformId", platform.id)
            }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-1.5">
          <Label htmlFor="salaryMin">{t("application.fields.salaryMin")}</Label>
          <Input
            id="salaryMin"
            type="number"
            inputMode="numeric"
            {...form.register("salaryMin", {
              setValueAs: (value) => (value === "" ? undefined : Number(value)),
            })}
          />
          <FieldError message={form.formState.errors.salaryMin?.message} />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="salaryMax">{t("application.fields.salaryMax")}</Label>
          <Input
            id="salaryMax"
            type="number"
            inputMode="numeric"
            {...form.register("salaryMax", {
              setValueAs: (value) => (value === "" ? undefined : Number(value)),
            })}
          />
          <FieldError message={form.formState.errors.salaryMax?.message} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-1.5">
          <Label>{t("application.fields.salaryCurrency")}</Label>
          <Controller
            control={form.control}
            name="salaryCurrency"
            render={({ field }) => (
              <Select value={field.value ?? ""} onValueChange={field.onChange}>
                <SelectTrigger
                  aria-label={t("application.fields.salaryCurrency")}
                >
                  <SelectValue placeholder="—" />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCY_CODES.map((code) => (
                    <SelectItem key={code} value={code}>
                      {code}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <FieldError message={form.formState.errors.salaryCurrency?.message} />
        </div>
        <div className="grid gap-1.5">
          <Label>{t("application.fields.salaryPeriod")}</Label>
          <Controller
            control={form.control}
            name="salaryPeriod"
            render={({ field }) => (
              <Select value={field.value ?? ""} onValueChange={field.onChange}>
                <SelectTrigger
                  aria-label={t("application.fields.salaryPeriod")}
                >
                  <SelectValue placeholder="—" />
                </SelectTrigger>
                <SelectContent>
                  {SALARY_PERIODS.map((period) => (
                    <SelectItem key={period} value={period}>
                      {t(`enums.salaryPeriod.${period}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-1.5">
          <Label>{t("application.fields.locationType")}</Label>
          <Controller
            control={form.control}
            name="locationType"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger
                  aria-label={t("application.fields.locationType")}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LOCATION_TYPES.map((location) => (
                    <SelectItem key={location} value={location}>
                      {t(`enums.locationType.${location}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="locationCity">
            {t("application.fields.locationCity")}
          </Label>
          <Input
            id="locationCity"
            disabled={locationType === "REMOTE"}
            placeholder={t("application.fields.locationCityPlaceholder")}
            {...form.register("locationCity")}
          />
          <FieldError message={form.formState.errors.locationCity?.message} />
        </div>
      </div>

      <div className="grid gap-1.5">
        <Label>{t("application.fields.locationCountry")}</Label>
        <Controller
          control={form.control}
          name="locationCountry"
          render={({ field }) => (
            <CountryCombobox
              value={field.value}
              onChange={field.onChange}
              placeholder={t("application.fields.locationCountryPlaceholder")}
              clearLabel={t("application.fields.locationCountryClear")}
              ariaLabel={t("application.fields.locationCountry")}
            />
          )}
        />
      </div>

      {mode === APPLICATION_FORM_MODE.EDIT && locationCountry ? (
        <ApplicationLocationMap countryCode={locationCountry} />
      ) : null}

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-1.5">
          <Label>{t("application.fields.status")}</Label>
          <Controller
            control={form.control}
            name="status"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger aria-label={t("application.fields.status")}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {APPLICATION_STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>
                      {t(`enums.status.${status}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="appliedAt">{t("application.fields.appliedAt")}</Label>
          <Controller
            control={form.control}
            name="appliedAt"
            render={({ field }) => (
              <Input
                id="appliedAt"
                type="date"
                value={
                  field.value ? toDateOnlyInputValue(new Date(field.value)) : ""
                }
                onChange={(event) =>
                  field.onChange(new Date(event.target.value))
                }
              />
            )}
          />
          <FieldError message={form.formState.errors.appliedAt?.message} />
        </div>
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="notes">{t("application.fields.notes")}</Label>
        <Textarea id="notes" rows={3} {...form.register("notes")} />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={isPending}>
          <Save className="size-4" aria-hidden="true" />
          {t("common.save")}
        </Button>
      </div>

      {mode === APPLICATION_FORM_MODE.EDIT && application ? (
        <StagesSection
          applicationId={application.id}
          stages={application.stages}
        />
      ) : null}
    </form>
  )
}
