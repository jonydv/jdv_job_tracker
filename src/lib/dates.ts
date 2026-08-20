const dateOnlyFormatters: Record<string, Intl.DateTimeFormat> = {}
const dateTimeFormatters: Record<string, Intl.DateTimeFormat> = {}

function getDateOnlyFormatter(locale: string) {
  return (dateOnlyFormatters[locale] ??= new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }))
}

function getDateTimeFormatter(locale: string) {
  return (dateTimeFormatters[locale] ??= new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  }))
}

export function formatDateOnly(date: Date, locale: string) {
  return getDateOnlyFormatter(locale).format(date)
}

export function formatDateTime(date: Date, locale: string) {
  return getDateTimeFormatter(locale).format(date)
}

export function parseDateOnlyInput(value: string) {
  return new Date(`${value}T00:00:00.000Z`)
}

export function toDateOnlyInputValue(date: Date) {
  return date.toISOString().slice(0, 10)
}

export function isFutureDate(date: Date) {
  return date.getTime() > Date.now()
}

export function yearsAgo(years: number) {
  const date = new Date()
  date.setUTCFullYear(date.getUTCFullYear() - years)
  return date
}
