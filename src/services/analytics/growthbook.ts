import memoize from 'lodash-es/memoize.js'

export type GrowthBookUserAttributes = {
  id: string
  sessionId: string
  deviceID: string
  platform: 'win32' | 'darwin' | 'linux'
  apiBaseUrlHost?: string
  organizationUUID?: string
  accountUUID?: string
  userType?: string
  subscriptionType?: string
  rateLimitTier?: string
  firstTokenTime?: number
  email?: string
  appVersion?: string
  github?: unknown
}

type GrowthBookRefreshListener = () => void | Promise<void>

const listeners = new Set<GrowthBookRefreshListener>()

function notifyListeners(): void {
  for (const listener of listeners) {
    void Promise.resolve(listener())
  }
}

export function onGrowthBookRefresh(
  listener: GrowthBookRefreshListener,
): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function hasGrowthBookEnvOverride(_feature: string): boolean {
  return false
}

export function getAllGrowthBookFeatures(): Record<string, unknown> {
  return {}
}

export function getGrowthBookConfigOverrides(): Record<string, unknown> {
  return {}
}

export function setGrowthBookConfigOverride(
  _feature: string,
  _value: unknown,
): void {
  notifyListeners()
}

export function clearGrowthBookConfigOverrides(): void {
  notifyListeners()
}

export function getApiBaseUrlHost(): string | undefined {
  const baseUrl = process.env.APRIL_BASE_URL || process.env.ANTHROPIC_BASE_URL
  if (!baseUrl) {
    return undefined
  }

  try {
    return new URL(baseUrl).host
  } catch {
    return undefined
  }
}

export const initializeGrowthBook = memoize(async (): Promise<void> => {})

export async function getFeatureValue_DEPRECATED<T>(
  _feature: string,
  defaultValue: T,
): Promise<T> {
  return defaultValue
}

export function getFeatureValue_CACHED_MAY_BE_STALE<T>(
  _feature: string,
  defaultValue: T,
): T {
  return defaultValue
}

export function getFeatureValue_CACHED_WITH_REFRESH<T>(
  _feature: string,
  defaultValue: T,
): T {
  return defaultValue
}

export function checkStatsigFeatureGate_CACHED_MAY_BE_STALE(
  _feature: string,
): boolean {
  return false
}

export async function checkSecurityRestrictionGate(
  _feature: string,
): Promise<boolean> {
  return false
}

export async function checkGate_CACHED_OR_BLOCKING(
  _feature: string,
): Promise<boolean> {
  return false
}

export function refreshGrowthBookAfterAuthChange(): void {
  notifyListeners()
}

export function resetGrowthBook(): void {}

export async function refreshGrowthBookFeatures(): Promise<void> {
  notifyListeners()
}

export function setupPeriodicGrowthBookRefresh(): void {}

export function stopPeriodicGrowthBookRefresh(): void {}

export async function getDynamicConfig_BLOCKS_ON_INIT<T>(
  _configName: string,
  defaultValue: T,
): Promise<T> {
  return defaultValue
}

export function getDynamicConfig_CACHED_MAY_BE_STALE<T>(
  _configName: string,
  defaultValue: T,
): T {
  return defaultValue
}
