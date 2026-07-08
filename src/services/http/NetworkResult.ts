export type NetworkResult<T> =
  | { status: 'ok'; data: T; source: 'server' }
  | { status: 'offline' }
  | { status: 'error'; code: number }

export function isOk<T>(result: NetworkResult<T>): result is { status: 'ok'; data: T; source: 'server' } {
  return result.status === 'ok'
}
