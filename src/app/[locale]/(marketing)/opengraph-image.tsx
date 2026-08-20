import { ImageResponse } from "next/og"
import { getTranslations } from "next-intl/server"

export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default async function OpengraphImage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "landing.hero" })

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        gap: 24,
        backgroundColor: "#0a0a0a",
        color: "#ffffff",
        padding: 80,
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: 28, color: "#a1a1aa", display: "flex" }}>
        Job Tracker
      </div>
      <div
        style={{
          fontSize: 64,
          fontWeight: 700,
          lineHeight: 1.1,
          display: "flex",
        }}
      >
        {t("title")}
      </div>
    </div>,
    { ...size }
  )
}
