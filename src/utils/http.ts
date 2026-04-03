import { RECOVERY_MACRO } from '../recovery/macroShim.js'
import { getAprilApiConfig } from './april.js'
import { getClaudeCodeUserAgent } from './userAgent.js'
import { isAnthropicApiFormat } from './april.js'
import { isFirstPartyAnthropicBaseUrl } from './model/providers.js'
import { getWorkload } from './workloadContext.js'

export function getUserAgent(): string {
  const agentSdkVersion = process.env.CLAUDE_AGENT_SDK_VERSION
    ? `, agent-sdk/${process.env.CLAUDE_AGENT_SDK_VERSION}`
    : ''
  const clientApp = process.env.CLAUDE_AGENT_SDK_CLIENT_APP
    ? `, client-app/${process.env.CLAUDE_AGENT_SDK_CLIENT_APP}`
    : ''
  const workload = getWorkload()
  const workloadSuffix = workload ? `, workload/${workload}` : ''

  return `april-cli/${RECOVERY_MACRO.VERSION} (${process.env.USER_TYPE}, ${process.env.CLAUDE_CODE_ENTRYPOINT ?? 'cli'}${agentSdkVersion}${clientApp}${workloadSuffix})`
}

export function getMCPUserAgent(): string {
  const parts: string[] = []
  if (process.env.CLAUDE_CODE_ENTRYPOINT) {
    parts.push(process.env.CLAUDE_CODE_ENTRYPOINT)
  }
  if (process.env.CLAUDE_AGENT_SDK_VERSION) {
    parts.push(`agent-sdk/${process.env.CLAUDE_AGENT_SDK_VERSION}`)
  }
  if (process.env.CLAUDE_AGENT_SDK_CLIENT_APP) {
    parts.push(`client-app/${process.env.CLAUDE_AGENT_SDK_CLIENT_APP}`)
  }
  const suffix = parts.length > 0 ? ` (${parts.join(', ')})` : ''
  return `april-code/${RECOVERY_MACRO.VERSION}${suffix}`
}

export function getWebFetchUserAgent(): string {
  return `April-User (${getClaudeCodeUserAgent()})`
}

export type AuthHeaders = {
  headers: Record<string, string>
  error?: string
}

export function getAuthHeaders(): AuthHeaders {
  const { apiKey, apiFormat } = getAprilApiConfig()
  if (!apiKey) {
    return {
      headers: {},
      error: 'No API key available',
    }
  }

  if (isAnthropicApiFormat(apiFormat) && isFirstPartyAnthropicBaseUrl()) {
    return {
      headers: {
        'x-api-key': apiKey,
      },
    }
  }

  return {
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  }
}

export async function withOAuth401Retry<T>(
  request: () => Promise<T>,
  _opts?: { also403Revoked?: boolean },
): Promise<T> {
  return request()
}
