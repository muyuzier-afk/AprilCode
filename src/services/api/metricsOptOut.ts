type MetricsStatus = {
  enabled: boolean
  hasError: boolean
}

export async function checkMetricsEnabled(): Promise<MetricsStatus> {
  return { enabled: false, hasError: false }
}

export const _clearMetricsEnabledCacheForTesting = (): void => {}
