const DEFAULT_API_URL = 'http://localhost:8000'

function normalizeApiUrl(value: string | undefined): string {
  if (!value) {
    return DEFAULT_API_URL
  }

  return value.endsWith('/') ? value.slice(0, -1) : value
}

export const apiUrl = normalizeApiUrl(import.meta.env.VITE_API_URL)