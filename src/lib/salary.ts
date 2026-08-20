const numberFormatters: Record<string, Intl.NumberFormat> = {}

function getNumberFormatter(locale: string) {
  return (numberFormatters[locale] ??= new Intl.NumberFormat(locale, {
    maximumFractionDigits: 0,
  }))
}

export type SalaryInfo = {
  salaryMin: number | null
  salaryMax: number | null
  salaryCurrency: string | null
  salaryPeriod: "HOURLY" | "MONTHLY" | "YEARLY" | null
}

export function formatSalary(
  salary: SalaryInfo,
  locale: string,
  periodLabels: Record<"HOURLY" | "MONTHLY" | "YEARLY", string>
) {
  if (!salary.salaryMin && !salary.salaryMax) return null

  const formatter = getNumberFormatter(locale)
  const amount =
    salary.salaryMin &&
    salary.salaryMax &&
    salary.salaryMin !== salary.salaryMax
      ? `${formatter.format(salary.salaryMin)}–${formatter.format(salary.salaryMax)}`
      : formatter.format((salary.salaryMax ?? salary.salaryMin)!)

  const currency = salary.salaryCurrency ?? ""
  const period = salary.salaryPeriod
    ? ` / ${periodLabels[salary.salaryPeriod]}`
    : ""

  return `${currency} ${amount}${period}`.trim()
}
