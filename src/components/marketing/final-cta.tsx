import { getTranslations, getLocale } from "next-intl/server"
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button"

export async function FinalCta() {
  const t = await getTranslations("landing.finalCta")
  const tAuth = await getTranslations("auth.login")
  const locale = await getLocale()

  return (
    <section className="bg-foreground text-background relative overflow-hidden">
      <div
        className="from-primary/30 pointer-events-none absolute -bottom-56 left-1/2 h-96 w-176 -translate-x-1/2 rounded-full bg-radial to-transparent blur-3xl"
        aria-hidden="true"
      />
      <div className="relative mx-auto max-w-3xl px-6 py-24 text-center">
        <h2 className="font-display text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
          {t("title")}
        </h2>
        <p className="mt-3 text-lg text-balance opacity-70">{t("subtitle")}</p>
        <div className="mt-8 flex justify-center">
          <GoogleSignInButton
            label={t("cta")}
            unavailableHint={tAuth("googleUnavailable")}
            callbackUrl={`/${locale}/dashboard`}
            className="w-72"
          />
        </div>
      </div>
    </section>
  )
}
