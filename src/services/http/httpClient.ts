import type { NetworkResult } from './NetworkResult'

function resolveApiBase(): string | null {
  if (typeof location !== 'undefined' && location.protocol === 'file:') {
    return null
  }
  return import.meta.env.VITE_API_BASE ?? '/api'
}

const API_BASE = resolveApiBase()
const REQUEST_TIMEOUT_MS = 8000

function isDbUnavailable(body: unknown): boolean {
  return typeof body === 'object' && body !== null && (body as { error?: unknown }).error === 'db_unavailable'
}

async function request<T>(path: string, init?: RequestInit): Promise<NetworkResult<T>> {
  if (API_BASE === null) {
    return { status: 'offline' }
  }
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
  try {
    const response = await fetch(`${API_BASE}/${path}`, { ...init, signal: controller.signal })
    const body = await response.json()
    if (isDbUnavailable(body)) {
      return { status: 'offline' }
    }
    if (!response.ok) {
      return { status: 'error', code: response.status }
    }
    return { status: 'ok', data: body as T, source: 'server' }
  } catch {
    return { status: 'offline' }
  } finally {
    clearTimeout(timeout)
  }
}

function toQueryString(query: Record<string, string | number>): string {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(query)) {
    params.set(key, String(value))
  }
  return params.toString()
}

export function apiGet<T>(path: string, query?: Record<string, string | number>): Promise<NetworkResult<T>> {
  const suffix = query ? `?${toQueryString(query)}` : ''
  return request<T>(`${path}${suffix}`)
}

export function apiPost<T>(path: string, payload: unknown): Promise<NetworkResult<T>> {
  return request<T>(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload ?? {}),
  })
}
