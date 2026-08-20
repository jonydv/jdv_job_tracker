import { ExternalLink } from "lucide-react"
import { getLocale, getTranslations } from "next-intl/server"
import { Link } from "@/i18n/navigation"

const AUTHOR_NAME = "Jonatan Villalba"
const AUTHOR_SITE = "https://www.jonatandvillalbaweb.com.ar"

export async function MarketingFooter() {
  const t = await getTranslations()
  const locale = await getLocale()
  const year = new Date().getFullYear()

  return (
    <footer className="text-muted-foreground border-t py-8 text-sm">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 sm:flex-row">
        <p>
          © {year} {t("common.appName")} — {t("landing.footer.rights")}
        </p>
        <nav className="flex items-center gap-4">
          <Link href="/legal/privacidad" className="hover:text-foreground">
            {t("landing.footer.privacy")}
          </Link>
          <Link href="/legal/terminos" className="hover:text-foreground">
            {t("landing.footer.terms")}
          </Link>
          <a
            href={`${AUTHOR_SITE}/${locale}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground inline-flex items-center gap-1"
          >
            {t("landing.footer.madeBy")} {AUTHOR_NAME}
            <ExternalLink className="size-3" aria-hidden="true" />
          </a>
        </nav>
      </div>
    </footer>
  )
}
