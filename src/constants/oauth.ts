type OauthConfig = {
  BASE_API_URL: string
  CONSOLE_AUTHORIZE_URL: string
  CLAUDE_AI_AUTHORIZE_URL: string
  CLAUDE_AI_ORIGIN: string
  TOKEN_URL: string
  API_KEY_URL: string
  ROLES_URL: string
  CONSOLE_SUCCESS_URL: string
  CLAUDEAI_SUCCESS_URL: string
  MANUAL_REDIRECT_URL: string
  CLIENT_ID: string
  OAUTH_FILE_SUFFIX: string
  MCP_PROXY_URL: string
  MCP_PROXY_PATH: string
}

function getBaseUrl(): string {
  const fallback =
    process.env.APRIL_BASE_URL ||
    process.env.ANTHROPIC_BASE_URL ||
    'https://example.com/v1'

  return fallback.replace(/\/+$/, '')
}

function getOrigin(url: string): string {
  try {
    return new URL(url).origin
  } catch {
    return 'https://example.com'
  }
}

export function fileSuffixForOauthConfig(): string {
  return ''
}

export const CLAUDE_AI_INFERENCE_SCOPE = 'user:inference' as const
export const CLAUDE_AI_PROFILE_SCOPE = 'user:profile' as const
export const OAUTH_BETA_HEADER = '' as const

export const CONSOLE_OAUTH_SCOPES = [CLAUDE_AI_PROFILE_SCOPE] as const
export const CLAUDE_AI_OAUTH_SCOPES = [
  CLAUDE_AI_PROFILE_SCOPE,
  CLAUDE_AI_INFERENCE_SCOPE,
] as const
export const ALL_OAUTH_SCOPES = Array.from(
  new Set([...CONSOLE_OAUTH_SCOPES, ...CLAUDE_AI_OAUTH_SCOPES]),
)

export const MCP_CLIENT_METADATA_URL = ''

export function getOauthConfig(): OauthConfig {
  const base = getBaseUrl()
  const origin = getOrigin(base)

  return {
    BASE_API_URL: base,
    CONSOLE_AUTHORIZE_URL: origin,
    CLAUDE_AI_AUTHORIZE_URL: origin,
    CLAUDE_AI_ORIGIN: origin,
    TOKEN_URL: `${base}/oauth/token`,
    API_KEY_URL: `${base}/oauth/api-key`,
    ROLES_URL: `${base}/oauth/roles`,
    CONSOLE_SUCCESS_URL: origin,
    CLAUDEAI_SUCCESS_URL: origin,
    MANUAL_REDIRECT_URL: origin,
    CLIENT_ID: 'april-cli',
    OAUTH_FILE_SUFFIX: '',
    MCP_PROXY_URL: origin,
    MCP_PROXY_PATH: '/v1/mcp/{server_id}',
  }
}
