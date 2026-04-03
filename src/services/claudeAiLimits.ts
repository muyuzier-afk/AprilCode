export {
  getRateLimitErrorMessage,
  getRateLimitWarning,
  getUsingOverageText,
} from './rateLimitMessages.js'

export type RateLimitType =
  | 'five_hour'
  | 'seven_day'
  | 'seven_day_opus'
  | 'seven_day_sonnet'
  | 'overage'

export type OverageDisabledReason = 'unknown'

export type ClaudeAILimits = {
  status: 'allowed' | 'allowed_warning' | 'rejected'
  unifiedRateLimitFallbackAvailable: boolean
  resetsAt?: number
  rateLimitType?: RateLimitType
  utilization?: number
  overageStatus?: 'allowed' | 'allowed_warning' | 'rejected'
  overageResetsAt?: number
  overageDisabledReason?: OverageDisabledReason
  isUsingOverage?: boolean
  surpassedThreshold?: number
}

type RawWindowUtilization = {
  utilization: number
  resets_at: number
}

type RawUtilization = {
  five_hour?: RawWindowUtilization
  seven_day?: RawWindowUtilization
}

const RATE_LIMIT_DISPLAY_NAMES: Record<RateLimitType, string> = {
  five_hour: 'session limit',
  seven_day: 'weekly limit',
  seven_day_opus: 'Opus limit',
  seven_day_sonnet: 'Sonnet limit',
  overage: 'extra usage limit',
}

export let currentLimits: ClaudeAILimits = {
  status: 'allowed',
  unifiedRateLimitFallbackAvailable: false,
  isUsingOverage: false,
}

export function getRateLimitDisplayName(type: RateLimitType): string {
  return RATE_LIMIT_DISPLAY_NAMES[type] || type
}

export function getRawUtilization(): RawUtilization {
  return {}
}

type StatusChangeListener = (limits: ClaudeAILimits) => void
export const statusListeners: Set<StatusChangeListener> = new Set()

export function emitStatusChange(limits: ClaudeAILimits) {
  currentLimits = limits
  for (const listener of statusListeners) {
    listener(limits)
  }
}

export async function checkQuotaStatus(): Promise<void> {}

export function extractQuotaStatusFromHeaders(
  _headers: globalThis.Headers,
): void {}

export function extractQuotaStatusFromError(_error: unknown): void {}
