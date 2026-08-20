const displayNamesByLocale = new Map<string, Intl.DisplayNames>()

function getDisplayNames(locale: string): Intl.DisplayNames {
  let instance = displayNamesByLocale.get(locale)
  if (!instance) {
    instance = new Intl.DisplayNames([locale], { type: "region" })
    displayNamesByLocale.set(locale, instance)
  }
  return instance
}

export function getCountryName(isoAlpha2: string, locale: string): string {
  return getDisplayNames(locale).of(isoAlpha2) ?? isoAlpha2
}
