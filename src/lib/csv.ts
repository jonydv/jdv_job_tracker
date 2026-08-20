// Semicolon-delimited: Excel's default CSV list separator under
// non-English regional settings (incl. es-AR) is ";", since "," is already
// the decimal separator there. A comma-delimited file opens as a single
// unsplit column for those users.
const DELIMITER = ";"

function escapeCsvValue(value: unknown): string {
  if (value === null || value === undefined) return ""
  const text = value instanceof Date ? value.toISOString() : String(value)
  if (new RegExp(`[${DELIMITER}"\n]`).test(text)) {
    return `"${text.replace(/"/g, '""')}"`
  }
  return text
}

export function toCsv(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return ""

  const headers = Object.keys(rows[0])
  const lines = [headers.join(DELIMITER)]

  for (const row of rows) {
    lines.push(
      headers.map((header) => escapeCsvValue(row[header])).join(DELIMITER)
    )
  }

  // Leading BOM so Excel detects UTF-8 and renders accented characters
  // correctly instead of falling back to the system codepage.
  const bom = String.fromCharCode(0xfeff)
  return bom + lines.join("\n")
}
