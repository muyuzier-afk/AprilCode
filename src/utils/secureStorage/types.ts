export type SecureStorageOAuthTokens = {
  accessToken: string
  refreshToken: string | null
  expiresAt: number | null
  scopes: string[]
  subscriptionType: string | null
  rateLimitTier: string | null
}

export type SecureStorageMcpDiscoveryState = {
  authorizationServerUrl?: string
  resourceMetadataUrl?: string
}

export type SecureStorageMcpOAuthEntry = {
  serverName?: string
  serverUrl?: string
  accessToken: string
  refreshToken?: string
  expiresAt: number
  scope?: string
  clientId?: string
  clientSecret?: string
  stepUpScope?: string
  discoveryState?: SecureStorageMcpDiscoveryState
}

export type SecureStorageData = {
  claudeAiOauth?: SecureStorageOAuthTokens
  mcpOAuth?: Record<string, SecureStorageMcpOAuthEntry>
  mcpOAuthClientConfig?: Record<
    string,
    {
      clientSecret?: string
      [key: string]: unknown
    }
  >
  mcpXaaIdp?: Record<
    string,
    {
      idToken: string
      expiresAt: number
    }
  >
  mcpXaaIdpConfig?: Record<
    string,
    {
      clientSecret?: string
    }
  >
  pluginSecrets?: Record<string, Record<string, unknown>>
  primaryApiKey?: string
  providerConfig?: {
    apiFormat?: string
    baseUrl?: string
    model?: string
  }
  trustedDeviceToken?: string
  [key: string]: unknown
}

export type SecureStorage = {
  name: string
  read(): SecureStorageData | null
  readAsync(): Promise<SecureStorageData | null>
  update(data: SecureStorageData): { success: boolean; warning?: string }
  delete(): boolean
}
