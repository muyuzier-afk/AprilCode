import { getUiText } from '../../i18n/ui.js'
import type { OAuthTokens } from './types.js'

const OAUTH_REMOVED_MESSAGE = getUiText('oauthRemovedShort')

export class OAuthService {
  async startOAuthFlow(
    _authURLHandler: (url: string, automaticUrl?: string) => Promise<void>,
    _options?: {
      loginWithClaudeAi?: boolean
      inferenceOnly?: boolean
      expiresIn?: number
      orgUUID?: string
      loginHint?: string
      loginMethod?: string
      skipBrowserOpen?: boolean
    },
  ): Promise<OAuthTokens> {
    throw new Error(OAUTH_REMOVED_MESSAGE)
  }

  handleManualAuthCodeInput(_params: {
    authorizationCode: string
    state: string
  }): void {}

  cleanup(): void {}
}
