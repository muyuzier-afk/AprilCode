import type { SettingsJson } from '../../utils/settings/types.js'

export function initializeRemoteManagedSettingsLoadingPromise(): void {}

export function computeChecksumFromSettings(_settings: SettingsJson): string {
  return 'april-disabled'
}

export function isEligibleForRemoteManagedSettings(): boolean {
  return false
}

export async function waitForRemoteManagedSettingsToLoad(): Promise<void> {}

export async function clearRemoteManagedSettingsCache(): Promise<void> {}

export async function loadRemoteManagedSettings(): Promise<void> {}

export async function refreshRemoteManagedSettings(): Promise<void> {}

export function startBackgroundPolling(): void {}

export function stopBackgroundPolling(): void {}
