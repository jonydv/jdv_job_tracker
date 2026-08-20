import { getTranslations } from "next-intl/server"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { PlatformIcon } from "@/components/platforms/platform-icon"

const statusVariant: Record<string, "default" | "secondary" | "outline"> = {
  0: "outline",
  1: "secondary",
  2: "default",
}

const ROW_SLUGS = ["linkedin", "getonboard", "weworkremotely"]

export async function DashboardPreview() {
  const t = await getTranslations("landing.preview")
  const rows = t.raw("rows") as {
    company: string
    role: string
    platform: string
    status: string
  }[]

  return (
    <section
      id="preview"
      className="mx-auto max-w-4xl px-6 pt-4 pb-16 sm:pb-24"
    >
      <p className="text-muted-foreground mb-4 text-center text-sm font-medium">
        {t("label")}
      </p>
      <Card className="border-border/60 overflow-hidden py-0 shadow-xl shadow-black/5">
        <div className="border-border/60 flex items-center gap-1.5 border-b px-4 py-3">
          <span className="size-2.5 rounded-full bg-red-400/70" />
          <span className="size-2.5 rounded-full bg-amber-400/70" />
          <span className="size-2.5 rounded-full bg-emerald-400/70" />
        </div>

        <div className="hidden overflow-x-auto sm:block">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/40 text-muted-foreground text-xs uppercase">
              <tr>
                <th className="px-4 py-3 font-medium">{t("columnCompany")}</th>
                <th className="px-4 py-3 font-medium">{t("columnRole")}</th>
                <th className="px-4 py-3 font-medium">{t("columnPlatform")}</th>
                <th className="px-4 py-3 font-medium">{t("columnStatus")}</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {rows.map((row, index) => (
                <tr key={row.company} className="hover:bg-muted/20">
                  <td className="px-4 py-3.5 font-medium">{row.company}</td>
                  <td className="text-muted-foreground px-4 py-3.5">
                    {row.role}
                  </td>
                  <td className="text-muted-foreground px-4 py-3.5">
                    <span className="flex items-center gap-2">
                      <PlatformIcon
                        slug={ROW_SLUGS[index] ?? "other"}
                        name={row.platform}
                      />
                      {row.platform}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <Badge variant={statusVariant[index] ?? "outline"}>
                      {row.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="divide-y sm:hidden">
          {rows.map((row, index) => (
            <div
              key={row.company}
              className="flex items-center gap-3 px-4 py-3.5"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{row.company}</p>
                <p className="text-muted-foreground truncate text-sm">
                  {row.role}
                </p>
                <span className="text-muted-foreground mt-1 flex items-center gap-1.5 text-xs">
                  <PlatformIcon
                    slug={ROW_SLUGS[index] ?? "other"}
                    name={row.platform}
                  />
                  {row.platform}
                </span>
              </div>
              <Badge variant={statusVariant[index] ?? "outline"}>
                {row.status}
              </Badge>
            </div>
          ))}
        </div>
      </Card>
    </section>
  )
}
