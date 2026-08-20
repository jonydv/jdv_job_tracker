import { getTranslations } from "next-intl/server"
import { env } from "@/lib/env"

export async function LegalPage({
  namespace,
}: {
  namespace: "legal.privacy" | "legal.terms"
}) {
  const t = await getTranslations(namespace)
  const sections = t.raw("sections") as { heading: string; body: string }[]

  return (
    <article className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
      <p className="text-muted-foreground mt-2 text-sm">{t("updatedAt")}</p>
      <div className="mt-10 flex flex-col gap-8">
        {sections.map((section, index) => (
          <section key={section.heading}>
            <h2 className="text-lg font-semibold">{section.heading}</h2>
            <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
              {t(`sections.${index}.body`, {
                contactEmail: env.NEXT_PUBLIC_CONTACT_EMAIL,
              })}
            </p>
          </section>
        ))}
      </div>
    </article>
  )
}
