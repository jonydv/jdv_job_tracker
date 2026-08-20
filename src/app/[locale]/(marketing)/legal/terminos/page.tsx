import type { Metadata } from "next"
import { getTranslations, setRequestLocale } from "next-intl/server"
import { LegalPage } from "@/components/marketing/legal-page"

export async function generateMetadata(
  props: PageProps<"/[locale]/legal/terminos">
): Promise<Metadata> {
  const { locale } = await props.params
  const t = await getTranslations({ locale, namespace: "legal.terms" })

  return { title: t("title") }
}

export default async function TermsPage({
  params,
}: PageProps<"/[locale]/legal/terminos">) {
  const { locale } = await params
  setRequestLocale(locale)

  return <LegalPage namespace="legal.terms" />
}
