import type { Metadata } from "next"
import { getTranslations, setRequestLocale } from "next-intl/server"
import { auth, signIn, devLoginEnabled } from "@/server/auth"
import { redirect } from "@/i18n/navigation"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button"

export async function generateMetadata(
  props: PageProps<"/[locale]/login">
): Promise<Metadata> {
  const { locale } = await props.params
  const t = await getTranslations({ locale, namespace: "auth.login" })

  return { title: t("title") }
}

export default async function LoginPage({
  params,
  searchParams,
}: PageProps<"/[locale]/login">) {
  const { locale } = await params
  const { callbackUrl, error } = await searchParams
  setRequestLocale(locale)

  const session = await auth()
  const redirectTarget =
    typeof callbackUrl === "string" ? callbackUrl : `/${locale}/dashboard`

  if (session) {
    redirect({ href: "/dashboard", locale })
  }

  const t = await getTranslations("auth.login")

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>{t("subtitle")}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <GoogleSignInButton
          label={t("continueWithGoogle")}
          unavailableHint={t("googleUnavailable")}
          callbackUrl={redirectTarget}
        />

        {error ? (
          <p className="text-destructive text-sm" role="alert">
            {t("error")}
          </p>
        ) : null}

        {devLoginEnabled ? (
          <>
            <div className="flex items-center gap-3">
              <Separator className="flex-1" />
              <span className="text-muted-foreground text-xs">
                {t("devSectionTitle")}
              </span>
              <Separator className="flex-1" />
            </div>
            <p className="text-muted-foreground -mt-3 text-xs">
              {t("devSectionSubtitle")}
            </p>
            <form
              action={async (formData) => {
                "use server"
                await signIn("dev", {
                  email: formData.get("email"),
                  redirectTo: redirectTarget,
                })
              }}
              className="flex flex-col gap-3"
            >
              <div className="grid gap-1.5">
                <Label htmlFor="email">{t("devEmailLabel")}</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder={t("devEmailPlaceholder")}
                />
              </div>
              <Button type="submit" variant="outline">
                {t("devSubmit")}
              </Button>
            </form>
          </>
        ) : null}
      </CardContent>
    </Card>
  )
}
