import { getTranslations } from "next-intl/server"

export async function SocialProof() {
  const t = await getTranslations("landing.socialProof")

  return (
    <section className="bg-secondary/50 border-y py-20">
      <div className="mx-auto max-w-2xl px-6 text-center">
        <span
          className="font-display text-primary/30 block text-7xl leading-none"
          aria-hidden="true"
        >
          &ldquo;
        </span>
        <h2 className="font-display -mt-4 text-2xl font-medium tracking-tight text-balance sm:text-3xl">
          {t("title")}
        </h2>
        <p className="text-muted-foreground mt-3 text-balance">
          {t("subtitle")}
        </p>
      </div>
    </section>
  )
}
