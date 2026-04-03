export function _resetPolicyLimitsForTesting(): void {}

export function initializePolicyLimitsLoadingPromise(): void {}

export function isPolicyLimitsEligible(): boolean {
  return false
}

export async function waitForPolicyLimitsToLoad(): Promise<void> {}

export function isPolicyAllowed(_policy: string): boolean {
  return true
}

export async function loadPolicyLimits(): Promise<void> {}

export async function refreshPolicyLimits(): Promise<void> {}

export async function clearPolicyLimitsCache(): Promise<void> {}

export function startBackgroundPolling(): void {}

export function stopBackgroundPolling(): void {}
