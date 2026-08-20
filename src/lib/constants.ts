export const CURRENCY_CODES = [
  "USD",
  "EUR",
  "GBP",
  "ARS",
  "MXN",
  "COP",
  "CLP",
  "PEN",
  "UYU",
  "BRL",
] as const

export type CurrencyCode = (typeof CURRENCY_CODES)[number]

export const APPLICATION_STATUSES = [
  "APPLIED",
  "SCREENING",
  "INTERVIEWING",
  "OFFER",
  "REJECTED",
  "WITHDRAWN",
] as const

export const LOCATION_TYPES = ["REMOTE", "HYBRID", "ONSITE"] as const

export const SALARY_PERIODS = ["HOURLY", "MONTHLY", "YEARLY"] as const

export const STAGE_TYPES = [
  "HR_SCREEN",
  "TECHNICAL_TEST",
  "TECH_INTERVIEW",
  "CULTURE_FIT",
  "MANAGEMENT",
  "OFFER_REVIEW",
  "OTHER",
] as const

export const PER_PAGE_VALUES = [10, 25, 50] as const

export const SORTABLE_FIELDS = [
  "appliedAt",
  "updatedAt",
  "companyName",
  "jobTitle",
  "status",
] as const

export type SortableField = (typeof SORTABLE_FIELDS)[number]

export const APPLICATION_FORM_MODE = {
  CREATE: "create",
  EDIT: "edit",
} as const

export type ApplicationFormMode =
  (typeof APPLICATION_FORM_MODE)[keyof typeof APPLICATION_FORM_MODE]
