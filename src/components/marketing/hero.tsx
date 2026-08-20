import { ChevronDown } from "lucide-react"
import { getTranslations, getLocale } from "next-intl/server"
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button"

export async function Hero() {
  const t = await getTranslations("landing.hero")
  const tAuth = await getTranslations("auth.login")
  const locale = await getLocale()

  return (
    <section className="bg-grain relative overflow-hidden">
      <div
        className="from-primary/25 pointer-events-none absolute -top-72 left-1/2 -z-10 h-144 w-208 -translate-x-1/2 rounded-full bg-radial to-transparent blur-3xl"
        aria-hidden="true"
      />
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-7 px-6 pt-24 pb-20 text-center">
        <h1 className="font-display text-5xl leading-[1.05] font-semibold tracking-tight text-balance sm:text-6xl md:text-7xl">
          {t("title")}
        </h1>
        <p className="text-muted-foreground max-w-2xl text-lg text-balance sm:text-xl">
          {t("subtitle")}
        </p>
        <div className="mt-2 flex flex-col items-center gap-4 sm:flex-row">
          <GoogleSignInButton
            label={t("ctaGoogle")}
            unavailableHint={tAuth("googleUnavailable")}
            callbackUrl={`/${locale}/dashboard`}
            className="w-72"
          />
          <a
            href="#preview"
            className="text-foreground/80 hover:text-foreground inline-flex items-center gap-1.5 text-sm font-medium"
          >
            {t("ctaSecondary")}
            <ChevronDown className="size-4" aria-hidden="true" />
          </a>
        </div>
        <p className="text-muted-foreground text-xs">{t("disclaimer")}</p>
      </div>
    </section>
  )
}
