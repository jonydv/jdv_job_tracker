export function isValidHttpUrl(value: string): boolean {
  try {
    const url = new URL(value)
    return url.protocol === "http:" || url.protocol === "https:"
  } catch {
    return false
  }
}

export function normalizeJobUrl(rawUrl: string): string | null {
  let url: URL
  try {
    url = new URL(rawUrl)
  } catch {
    return null
  }

  url.hash = ""
  url.hostname = url.hostname.toLowerCase()

  const params = url.searchParams
  for (const key of [...params.keys()]) {
    if (
      key.toLowerCase().startsWith("utm_") ||
      key === "ref" ||
      key === "fbclid"
    ) {
      params.delete(key)
    }
  }
  url.search = params.toString()

  const path =
    url.pathname.endsWith("/") && url.pathname !== "/"
      ? url.pathname.slice(0, -1)
      : url.pathname

  return `${url.hostname}${path}${url.search}`.slice(0, 512)
}
