import { LogOut, Settings } from "lucide-react"
import { getTranslations } from "next-intl/server"
import { auth, signOut } from "@/server/auth"
import { redirect, Link } from "@/i18n/navigation"
import { Button } from "@/components/ui/button"
import { LanguageSwitcher } from "@/components/layout/language-switcher"
import { Logo } from "@/components/layout/logo"

export default async function AppLayout({
  children,
  params,
}: LayoutProps<"/[locale]">) {
  const { locale } = await params
  const session = await auth()
  const t = await getTranslations()

  if (!session) {
    redirect({ href: "/login", locale })
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between border-b px-6 py-4">
        <Link href="/dashboard">
          <Logo label={t("common.appName")} />
        </Link>
        <nav className="flex items-center gap-1.5">
          <Button
            asChild
            size="sm"
            variant="ghost"
            className="text-muted-foreground hover:text-foreground"
          >
            <Link href="/dashboard/settings">
              <Settings className="size-4" aria-hidden="true" />
              <span className="hidden sm:inline">{t("nav.settings")}</span>
            </Link>
          </Button>
          <LanguageSwitcher />
          <form
            action={async () => {
              "use server"
              await signOut({ redirectTo: "/" })
            }}
          >
            <Button type="submit" size="sm" variant="ghost">
              <LogOut className="size-4" aria-hidden="true" />
              <span className="hidden sm:inline">{t("nav.logout")}</span>
            </Button>
          </form>
        </nav>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  )
}
