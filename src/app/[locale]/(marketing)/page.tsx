import type { Metadata } from "next"
import { getTranslations, setRequestLocale } from "next-intl/server"
import { routing } from "@/i18n/routing"
import { env } from "@/lib/env"
import { Hero } from "@/components/marketing/hero"
import { DashboardPreview } from "@/components/marketing/dashboard-preview"
import { Features } from "@/components/marketing/features"
import { SocialProof } from "@/components/marketing/social-proof"
import { FinalCta } from "@/components/marketing/final-cta"

export async function generateMetadata(
  props: PageProps<"/[locale]">
): Promise<Metadata> {
  const { locale } = await props.params
  const t = await getTranslations({ locale, namespace: "LocaleLayout" })

  return {
    title: t("title"),
    description: t("description"),
    alternates: {
      canonical: `${env.NEXT_PUBLIC_APP_URL}/${locale}`,
      languages: Object.fromEntries(
        routing.locales.map((value) => [
          value,
          `${env.NEXT_PUBLIC_APP_URL}/${value}`,
        ])
      ),
    },
    openGraph: {
      title: t("title"),
      description: t("description"),
      url: `${env.NEXT_PUBLIC_APP_URL}/${locale}`,
      locale,
    },
  }
}

export default async function LandingPage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params
  setRequestLocale(locale)

  const t = await getTranslations({ locale, namespace: "LocaleLayout" })
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Job Tracker",
    applicationCategory: "BusinessApplication",
    description: t("description"),
    url: `${env.NEXT_PUBLIC_APP_URL}/${locale}`,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Hero />
      <DashboardPreview />
      <Features />
      <SocialProof />
      <FinalCta />
    </>
  )
}
