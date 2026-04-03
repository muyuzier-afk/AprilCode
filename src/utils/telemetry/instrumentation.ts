import type { Meter } from '@opentelemetry/api'

export function bootstrapTelemetry() {}

export function parseExporterTypes(_value: string | undefined): string[] {
  return []
}

export function isTelemetryEnabled() {
  return false
}

export async function initializeTelemetry(): Promise<Meter | null> {
  return null
}

export async function flushTelemetry(): Promise<void> {}
