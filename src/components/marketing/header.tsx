import { LayoutDashboard, LogIn } from "lucide-react"
import { getTranslations } from "next-intl/server"
import { auth } from "@/server/auth"
import { Link } from "@/i18n/navigation"
import { Button } from "@/components/ui/button"
import { LanguageSwitcher } from "@/components/layout/language-switcher"
import { Logo } from "@/components/layout/logo"

export async function MarketingHeader() {
  const t = await getTranslations()
  const session = await auth()

  return (
    <header className="bg-background/80 sticky top-0 z-40 border-b backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/">
          <Logo label={t("common.appName")} />
        </Link>
        <nav className="flex items-center gap-3">
          <LanguageSwitcher />
          {session ? (
            <Button asChild size="sm">
              <Link href="/dashboard">
                <LayoutDashboard className="size-4" aria-hidden="true" />
                {t("nav.dashboard")}
              </Link>
            </Button>
          ) : (
            <Button asChild size="sm" variant="outline">
              <Link href="/login">
                <LogIn className="size-4" aria-hidden="true" />
                {t("nav.login")}
              </Link>
            </Button>
          )}
        </nav>
      </div>
    </header>
  )
}
