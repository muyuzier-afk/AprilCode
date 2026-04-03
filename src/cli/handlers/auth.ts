/* eslint-disable custom-rules/no-process-exit -- CLI subcommand handler intentionally exits */

import type { OAuthTokens } from '../../services/oauth/types.js'
import {
  clearAprilApiConfig,
  getAprilApiConfig,
  getAprilApiFormatLabel,
  hasAprilApiConfig,
} from '../../utils/april.js'

const OAUTH_REMOVED_MESSAGE =
  'OAuth login has been removed from April Code. Open April Code and run /login for initial setup, or /provider to update API Type, Key, Base URL, and Model.\n'

export async function installOAuthTokens(_tokens: OAuthTokens): Promise<void> {
  throw new Error(
    'OAuth login has been removed from April Code. Use /login for initial setup, or /provider to update API Type, Key, Base URL, and Model.',
  )
}

export async function authLogin(): Promise<void> {
  process.stderr.write(OAUTH_REMOVED_MESSAGE)
  process.exit(1)
}

export async function authStatus(opts: {
  json?: boolean
  text?: boolean
}): Promise<void> {
  const config = getAprilApiConfig()
  const status = {
    configured: hasAprilApiConfig(),
    apiFormat: config.apiFormat,
    apiFormatLabel: getAprilApiFormatLabel(config.apiFormat),
    apiKeyConfigured: Boolean(config.apiKey),
    baseUrl: config.baseUrl ?? null,
    model: config.model ?? null,
    telemetryEnabled: process.env.APRIL_TELEMETRY_ENABLED === '1',
  }

  if (opts.text) {
    process.stdout.write(`configured: ${status.configured ? 'yes' : 'no'}\n`)
    process.stdout.write(`apiFormat: ${status.apiFormatLabel}\n`)
    process.stdout.write(
      `apiKeyConfigured: ${status.apiKeyConfigured ? 'yes' : 'no'}\n`,
    )
    process.stdout.write(`baseUrl: ${status.baseUrl ?? '(not set)'}\n`)
    process.stdout.write(`model: ${status.model ?? '(not set)'}\n`)
    process.stdout.write(
      `telemetryEnabled: ${status.telemetryEnabled ? 'yes' : 'no'}\n`,
    )
  } else {
    process.stdout.write(`${JSON.stringify(status, null, 2)}\n`)
  }

  process.exit(status.configured ? 0 : 1)
}

export async function authLogout(): Promise<void> {
  await clearAprilApiConfig()
  process.stdout.write('Cleared stored April API credentials.\n')
  process.exit(0)
}
