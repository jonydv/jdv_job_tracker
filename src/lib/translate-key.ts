import type { useTranslations } from "next-intl"

type Translator = ReturnType<typeof useTranslations>

export function translateKey(t: Translator, key: string): string {
  return t(key as Parameters<Translator>[0])
}
