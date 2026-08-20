import { LayoutGrid, ListChecks, TrendingUp, ShieldCheck } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { getTranslations } from "next-intl/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const FEATURE_ICONS: LucideIcon[] = [
  LayoutGrid,
  ListChecks,
  TrendingUp,
  ShieldCheck,
]

export async function Features() {
  const t = await getTranslations("landing.features")
  const items = t.raw("items") as { title: string; description: string }[]

  return (
    <section id="features" className="mx-auto max-w-6xl px-6 py-16 sm:py-24">
      <div className="mx-auto mb-14 max-w-2xl text-center">
        <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          {t("title")}
        </h2>
        <p className="text-muted-foreground mt-3 text-lg">{t("subtitle")}</p>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        {items.map((item, index) => {
          const Icon = FEATURE_ICONS[index]
          return (
            <Card
              key={item.title}
              className="border-border/60 gap-3 shadow-none transition-shadow hover:shadow-md"
            >
              <CardHeader>
                <div className="bg-accent text-accent-foreground mb-1 flex size-10 items-center justify-center rounded-xl">
                  <Icon className="size-5" aria-hidden="true" />
                </div>
                <CardTitle className="font-display text-xl font-semibold">
                  {item.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {item.description}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </section>
  )
}
