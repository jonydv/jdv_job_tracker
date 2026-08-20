import type { Metadata } from "next"
import { getTranslations, setRequestLocale } from "next-intl/server"
import { auth } from "@/server/auth"
import { ProfileForm } from "@/components/settings/profile-form"
import { SettingsLanguageSection } from "@/components/settings/language-section"
import { ExportSection } from "@/components/settings/export-section"
import { DeleteAccountSection } from "@/components/settings/delete-account-section"

export async function generateMetadata(
  props: PageProps<"/[locale]/dashboard/settings">
): Promise<Metadata> {
  const { locale } = await props.params
  const t = await getTranslations({ locale, namespace: "settings" })
  return { title: t("title") }
}

export default async function SettingsPage({
  params,
}: PageProps<"/[locale]/dashboard/settings">) {
  const { locale } = await params
  setRequestLocale(locale)

  const session = await auth()
  const t = await getTranslations("settings")

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-8 px-6 py-10">
      <h1 className="text-2xl font-semibold">{t("title")}</h1>

      <section>
        <h2 className="mb-2 font-medium">{t("profile.title")}</h2>
        <ProfileForm initialName={session!.user.name ?? ""} />
      </section>

      <SettingsLanguageSection />

      <ExportSection />

      <DeleteAccountSection userEmail={session!.user.email!} />
    </div>
  )
}
