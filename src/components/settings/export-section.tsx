import { Download } from "lucide-react"
import { getTranslations } from "next-intl/server"
import { Button } from "@/components/ui/button"

export async function ExportSection() {
  const t = await getTranslations("settings.export")

  return (
    <section>
      <h2 className="mb-1 font-medium">{t("title")}</h2>
      <p className="text-muted-foreground mb-2 text-sm">{t("description")}</p>
      <div className="flex gap-2">
        <Button asChild variant="outline">
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- file download, not a page route */}
          <a href="/api/export?format=json">
            <Download className="size-4" aria-hidden="true" />
            {t("json")}
          </a>
        </Button>
        <Button asChild variant="outline">
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- file download, not a page route */}
          <a href="/api/export?format=csv">
            <Download className="size-4" aria-hidden="true" />
            {t("csv")}
          </a>
        </Button>
      </div>
    </section>
  )
}
