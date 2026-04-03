/* eslint-disable custom-rules/no-process-exit -- CLI subcommand handler intentionally exits */

import { getUiText } from '../../i18n/ui.js'
import type { OAuthTokens } from '../../services/oauth/types.js'
import {
  clearAprilApiConfig,
  getAprilApiConfig,
  getAprilApiFormatLabel,
  hasAprilApiConfig,
} from '../../utils/april.js'

const OAUTH_REMOVED_MESSAGE = `${getUiText('oauthRemovedLong')}`

export async function installOAuthTokens(_tokens: OAuthTokens): Promise<void> {
  throw new Error(getUiText('oauthRemovedShort'))
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
    process.stdout.write(
      `${getUiText('statusConfigured')}: ${status.configured ? getUiText('yes') : getUiText('no')}\n`,
    )
    process.stdout.write(`${getUiText('statusApiFormat')}: ${status.apiFormatLabel}\n`)
    process.stdout.write(
      `${getUiText('statusApiKeyConfigured')}: ${status.apiKeyConfigured ? getUiText('yes') : getUiText('no')}\n`,
    )
    process.stdout.write(
      `${getUiText('statusBaseUrl')}: ${status.baseUrl ?? getUiText('notSet')}\n`,
    )
    process.stdout.write(
      `${getUiText('statusModel')}: ${status.model ?? getUiText('notSet')}\n`,
    )
    process.stdout.write(
      `${getUiText('statusTelemetryEnabled')}: ${status.telemetryEnabled ? getUiText('yes') : getUiText('no')}\n`,
    )
  } else {
    process.stdout.write(`${JSON.stringify(status, null, 2)}\n`)
  }

  process.exit(status.configured ? 0 : 1)
}

export async function authLogout(): Promise<void> {
  await clearAprilApiConfig()
  process.stdout.write(`${getUiText('clearedApiCredentials')}\n`)
  process.exit(0)
}
