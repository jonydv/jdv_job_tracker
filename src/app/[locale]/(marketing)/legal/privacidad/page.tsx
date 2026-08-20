import type { Metadata } from "next"
import { getTranslations, setRequestLocale } from "next-intl/server"
import { LegalPage } from "@/components/marketing/legal-page"

export async function generateMetadata(
  props: PageProps<"/[locale]/legal/privacidad">
): Promise<Metadata> {
  const { locale } = await props.params
  const t = await getTranslations({ locale, namespace: "legal.privacy" })

  return { title: t("title") }
}

export default async function PrivacyPage({
  params,
}: PageProps<"/[locale]/legal/privacidad">) {
  const { locale } = await params
  setRequestLocale(locale)

  return <LegalPage namespace="legal.privacy" />
}
