import type { Metadata } from "next"
import { hasLocale, NextIntlClientProvider } from "next-intl"
import { getTranslations, setRequestLocale } from "next-intl/server"
import { notFound } from "next/navigation"
import { Geist, Geist_Mono, Fraunces } from "next/font/google"
import { NuqsAdapter } from "nuqs/adapters/next/app"
import { routing } from "@/i18n/routing"
import { env } from "@/lib/env"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Toaster } from "@/components/ui/sonner"
import "../globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["opsz", "SOFT", "WONK"],
})

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export async function generateMetadata(
  props: Omit<LayoutProps<"/[locale]">, "children">
): Promise<Metadata> {
  const { locale } = await props.params

  const t = await getTranslations({ locale, namespace: "LocaleLayout" })

  return {
    metadataBase: new URL(env.NEXT_PUBLIC_APP_URL),
    title: t("title"),
    description: t("description"),
  }
}

export default async function LocaleLayout({
  children,
  params,
}: LayoutProps<"/[locale]">) {
  const { locale } = await params

  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }

  setRequestLocale(locale)

  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} antialiased`}
      >
        <NextIntlClientProvider>
          <NuqsAdapter>
            <TooltipProvider>
              {children}
              <Toaster />
            </TooltipProvider>
          </NuqsAdapter>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
