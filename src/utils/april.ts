import { getAnthropicApiKey, removeApiKey, saveApiKey } from './auth.js'
import { getGlobalConfig, saveGlobalConfig } from './config.js'
import { getSecureStorage } from './secureStorage/index.js'
import type { SecureStorageData } from './secureStorage/types.js'

const APRIL_BASE_URL_KEY = 'APRIL_BASE_URL'
const APRIL_MODEL_KEY = 'APRIL_MODEL'
const APRIL_API_FORMAT_KEY = 'APRIL_API_FORMAT'
const APRIL_TELEMETRY_KEY = 'APRIL_TELEMETRY_ENABLED'
const LEGACY_BASE_URL_KEY = 'ANTHROPIC_BASE_URL'
const LEGACY_MODEL_KEY = 'ANTHROPIC_MODEL'
const LEGACY_CONFIG_KEYS = [
  APRIL_BASE_URL_KEY,
  LEGACY_BASE_URL_KEY,
  APRIL_MODEL_KEY,
  LEGACY_MODEL_KEY,
  APRIL_API_FORMAT_KEY,
  APRIL_TELEMETRY_KEY,
] as const

export const APRIL_API_FORMATS = [
  'anthropic',
  'openai-responses',
  'openai-chat',
] as const

export type AprilApiFormat = (typeof APRIL_API_FORMATS)[number]

export type AprilApiConfig = {
  apiKey?: string
  baseUrl?: string
  model?: string
  apiFormat: AprilApiFormat
}

type StoredProviderConfig = NonNullable<SecureStorageData['providerConfig']>

let hasMigratedLegacyAprilConfig = false

function normalizeBaseUrl(baseUrl: string): string {
  return baseUrl.trim().replace(/\/+$/, '')
}

function readConfigEnv(key: string): string | undefined {
  const value = getGlobalConfig().env[key]
  return value && value.trim() ? value : undefined
}

function inferApiFormat(baseUrl?: string): AprilApiFormat {
  if (!baseUrl) {
    return 'openai-chat'
  }

  try {
    const host = new URL(baseUrl).host.toLowerCase()
    if (host === 'api.anthropic.com' || host === 'api-staging.anthropic.com') {
      return 'anthropic'
    }
  } catch {
    return 'openai-chat'
  }

  return 'openai-chat'
}

function normalizeApiFormat(
  apiFormat: string | undefined,
  baseUrl?: string,
): AprilApiFormat {
  const value = apiFormat?.trim().toLowerCase()
  switch (value) {
    case 'anthropic':
    case 'claude':
      return 'anthropic'
    case 'openai-responses':
    case 'responses':
    case 'responses-api':
    case 'openai-responses-api':
      return 'openai-responses'
    case 'openai-chat':
    case 'chat':
    case 'chat-completions':
    case 'chat-completion':
    case 'completions':
    case 'openai-chat-completions':
      return 'openai-chat'
    default:
      return inferApiFormat(baseUrl)
  }
}

function parseApiFormat(apiFormat: string | undefined): AprilApiFormat | null {
  const value = apiFormat?.trim().toLowerCase()
  switch (value) {
    case 'anthropic':
    case 'claude':
      return 'anthropic'
    case 'openai-responses':
    case 'responses':
    case 'responses-api':
    case 'openai-responses-api':
      return 'openai-responses'
    case 'openai-chat':
    case 'chat':
    case 'chat-completions':
    case 'chat-completion':
    case 'completions':
    case 'openai-chat-completions':
      return 'openai-chat'
    default:
      return null
  }
}

function clearLegacyConfigEnv(): void {
  saveGlobalConfig(current => {
    let changed = false
    const env = { ...current.env }

    for (const key of LEGACY_CONFIG_KEYS) {
      if (env[key] !== undefined) {
        delete env[key]
        changed = true
      }
    }

    return changed ? { ...current, env } : current
  })
}

function setRuntimeConfig(
  baseUrl?: string,
  model?: string,
  apiFormat?: AprilApiFormat,
): void {
  if (baseUrl) {
    process.env[APRIL_BASE_URL_KEY] = baseUrl
    process.env[LEGACY_BASE_URL_KEY] = baseUrl
  }
  if (model) {
    process.env[APRIL_MODEL_KEY] = model
    process.env[LEGACY_MODEL_KEY] = model
  }
  if (apiFormat) {
    process.env[APRIL_API_FORMAT_KEY] = apiFormat
  }
  process.env[APRIL_TELEMETRY_KEY] = '0'
}

function clearRuntimeConfig(): void {
  delete process.env[APRIL_BASE_URL_KEY]
  delete process.env[LEGACY_BASE_URL_KEY]
  delete process.env[APRIL_MODEL_KEY]
  delete process.env[LEGACY_MODEL_KEY]
  delete process.env[APRIL_API_FORMAT_KEY]
  delete process.env[APRIL_TELEMETRY_KEY]
}

function readStoredProviderConfigRaw(): StoredProviderConfig | undefined {
  return getSecureStorage().read()?.providerConfig
}

function readStoredProviderConfig(): {
  baseUrl?: string
  model?: string
  apiFormat?: AprilApiFormat
} {
  const stored = readStoredProviderConfigRaw()
  if (!stored) {
    return {}
  }

  const baseUrl = stored.baseUrl?.trim()
    ? normalizeBaseUrl(stored.baseUrl)
    : undefined
  const model = stored.model?.trim() || undefined
  const apiFormat = stored.apiFormat
    ? normalizeApiFormat(stored.apiFormat, baseUrl)
    : undefined

  return { baseUrl, model, apiFormat }
}

function saveStoredProviderConfig(config: {
  baseUrl?: string
  model?: string
  apiFormat?: AprilApiFormat
}): void {
  const secureStorage = getSecureStorage()
  const storageData = secureStorage.read() || {}
  const providerConfig = {
    ...storageData.providerConfig,
    ...(config.baseUrl ? { baseUrl: config.baseUrl } : {}),
    ...(config.model ? { model: config.model } : {}),
    ...(config.apiFormat ? { apiFormat: config.apiFormat } : {}),
  }

  if (Object.keys(providerConfig).length === 0) {
    return
  }

  const result = secureStorage.update({
    ...storageData,
    providerConfig,
  })

  if (!result.success) {
    throw new Error('无法安全保存 Provider 配置。')
  }
}

function clearStoredProviderConfig(): void {
  const secureStorage = getSecureStorage()
  const storageData = secureStorage.read()
  if (!storageData?.providerConfig) {
    return
  }

  const nextData = { ...storageData }
  delete nextData.providerConfig
  const result = secureStorage.update(nextData)
  if (!result.success) {
    throw new Error('无法安全清除 Provider 配置。')
  }
}

function hydrateRuntimeConfigFromSecureStorage(): void {
  const stored = readStoredProviderConfig()
  if (
    stored.baseUrl &&
    !process.env[APRIL_BASE_URL_KEY] &&
    !process.env[LEGACY_BASE_URL_KEY]
  ) {
    process.env[APRIL_BASE_URL_KEY] = stored.baseUrl
    process.env[LEGACY_BASE_URL_KEY] = stored.baseUrl
  }
  if (
    stored.model &&
    !process.env[APRIL_MODEL_KEY] &&
    !process.env[LEGACY_MODEL_KEY]
  ) {
    process.env[APRIL_MODEL_KEY] = stored.model
    process.env[LEGACY_MODEL_KEY] = stored.model
  }
  if (stored.apiFormat && !process.env[APRIL_API_FORMAT_KEY]) {
    process.env[APRIL_API_FORMAT_KEY] = stored.apiFormat
  }
  process.env[APRIL_TELEMETRY_KEY] = '0'
}

function migrateLegacyAprilConfig(): void {
  if (hasMigratedLegacyAprilConfig) {
    return
  }
  hasMigratedLegacyAprilConfig = true

  const legacyBaseUrl =
    readConfigEnv(APRIL_BASE_URL_KEY) || readConfigEnv(LEGACY_BASE_URL_KEY)
  const legacyModel =
    readConfigEnv(APRIL_MODEL_KEY) || readConfigEnv(LEGACY_MODEL_KEY)
  const legacyApiFormat = readConfigEnv(APRIL_API_FORMAT_KEY)
  const shouldClearLegacy =
    legacyBaseUrl ||
    legacyModel ||
    legacyApiFormat ||
    readConfigEnv(APRIL_TELEMETRY_KEY)

  const existing = readStoredProviderConfig()
  if (shouldClearLegacy) {
    const nextBaseUrl = legacyBaseUrl ? normalizeBaseUrl(legacyBaseUrl) : existing.baseUrl
    const nextModel = legacyModel?.trim() || existing.model
    const nextApiFormat = normalizeApiFormat(
      existing.apiFormat || legacyApiFormat,
      nextBaseUrl,
    )
    const hasConfigToPersist = Boolean(
      nextBaseUrl || nextModel || legacyApiFormat,
    )

    if (hasConfigToPersist) {
      const rawStored = readStoredProviderConfigRaw()
      const alreadyStored =
        rawStored?.baseUrl === nextBaseUrl &&
        rawStored?.model === nextModel &&
        normalizeApiFormat(rawStored?.apiFormat, nextBaseUrl) === nextApiFormat

      if (!alreadyStored) {
        try {
          saveStoredProviderConfig({
            baseUrl: nextBaseUrl,
            model: nextModel,
            apiFormat: nextApiFormat,
          })
        } catch {
          hydrateRuntimeConfigFromSecureStorage()
          return
        }
      }
    }

    clearLegacyConfigEnv()
  }

  hydrateRuntimeConfigFromSecureStorage()
}

function getStoredOrLegacyBaseUrl(): string | undefined {
  migrateLegacyAprilConfig()
  const value =
    process.env[APRIL_BASE_URL_KEY] ||
    process.env[LEGACY_BASE_URL_KEY] ||
    readStoredProviderConfig().baseUrl ||
    readConfigEnv(APRIL_BASE_URL_KEY) ||
    readConfigEnv(LEGACY_BASE_URL_KEY)

  return value ? normalizeBaseUrl(value) : undefined
}

function getStoredOrLegacyModel(): string | undefined {
  migrateLegacyAprilConfig()
  return (
    process.env[APRIL_MODEL_KEY] ||
    process.env[LEGACY_MODEL_KEY] ||
    readStoredProviderConfig().model ||
    readConfigEnv(APRIL_MODEL_KEY) ||
    readConfigEnv(LEGACY_MODEL_KEY)
  )
}

export function getAprilBaseUrl(): string | undefined {
  return getStoredOrLegacyBaseUrl()
}

export function getAprilModel(): string | undefined {
  return getStoredOrLegacyModel()
}

export function getAprilApiFormat(): AprilApiFormat {
  const baseUrl = getAprilBaseUrl()
  migrateLegacyAprilConfig()
  const value =
    process.env[APRIL_API_FORMAT_KEY] ||
    readStoredProviderConfig().apiFormat ||
    readConfigEnv(APRIL_API_FORMAT_KEY)
  return normalizeApiFormat(value, baseUrl)
}

export function isAnthropicApiFormat(
  apiFormat: AprilApiFormat = getAprilApiFormat(),
): boolean {
  return apiFormat === 'anthropic'
}

export function isOpenAIResponsesApiFormat(
  apiFormat: AprilApiFormat = getAprilApiFormat(),
): boolean {
  return apiFormat === 'openai-responses'
}

export function isOpenAIChatApiFormat(
  apiFormat: AprilApiFormat = getAprilApiFormat(),
): boolean {
  return apiFormat === 'openai-chat'
}

export function getAprilApiFormatLabel(
  apiFormat: AprilApiFormat = getAprilApiFormat(),
): string {
  switch (apiFormat) {
    case 'anthropic':
      return 'Anthropic Messages API'
    case 'openai-responses':
      return 'OpenAI Responses API'
    case 'openai-chat':
      return 'OpenAI Chat Completions API'
  }
}

export function getAprilApiConfig(): AprilApiConfig {
  migrateLegacyAprilConfig()

  return {
    apiKey:
      process.env.APRIL_API_KEY ||
      process.env.ANTHROPIC_API_KEY ||
      getAnthropicApiKey() ||
      undefined,
    baseUrl: getAprilBaseUrl(),
    model: getAprilModel(),
    apiFormat: getAprilApiFormat(),
  }
}

export function hasAprilApiConfig(): boolean {
  const config = getAprilApiConfig()
  return Boolean(config.apiKey && config.baseUrl && config.model)
}

export function validateAprilApiKey(apiKey: string): string | null {
  if (!apiKey.trim()) {
    return 'API key 不能为空。'
  }
  if (/\s/.test(apiKey)) {
    return 'API key 不能包含空白字符。'
  }
  return null
}

export function validateAprilBaseUrl(baseUrl: string): string | null {
  const normalized = normalizeBaseUrl(baseUrl)
  if (!normalized) {
    return 'Base URL 不能为空。'
  }

  try {
    const parsed = new URL(normalized)
    if (!/^https?:$/.test(parsed.protocol)) {
      return 'Base URL 必须使用 http 或 https。'
    }
  } catch {
    return 'Base URL 不是有效的 URL。'
  }

  return null
}

export function validateAprilModel(model: string): string | null {
  if (!model.trim()) {
    return 'Model 不能为空。'
  }
  return null
}

export function validateAprilApiFormat(apiFormat: string): string | null {
  if (!parseApiFormat(apiFormat)) {
    return 'API 类型必须是 anthropic、openai-responses 或 openai-chat。'
  }
  return null
}

export async function saveAprilApiConfig(config: {
  apiKey: string
  baseUrl: string
  model: string
  apiFormat: string
}): Promise<void> {
  const apiKey = config.apiKey.trim()
  const baseUrl = normalizeBaseUrl(config.baseUrl)
  const model = config.model.trim()

  const apiKeyError = validateAprilApiKey(apiKey)
  if (apiKeyError) {
    throw new Error(apiKeyError)
  }

  const baseUrlError = validateAprilBaseUrl(baseUrl)
  if (baseUrlError) {
    throw new Error(baseUrlError)
  }

  const modelError = validateAprilModel(model)
  if (modelError) {
    throw new Error(modelError)
  }

  const apiFormatError = validateAprilApiFormat(config.apiFormat)
  if (apiFormatError) {
    throw new Error(apiFormatError)
  }
  const apiFormat = normalizeApiFormat(config.apiFormat, baseUrl)

  await saveApiKey(apiKey)
  saveStoredProviderConfig({
    baseUrl,
    model,
    apiFormat,
  })
  clearLegacyConfigEnv()

  process.env.APRIL_API_KEY = apiKey
  setRuntimeConfig(baseUrl, model, apiFormat)
}

export async function clearAprilApiConfig(): Promise<void> {
  await removeApiKey()
  delete process.env.APRIL_API_KEY

  clearStoredProviderConfig()
  clearLegacyConfigEnv()
  clearRuntimeConfig()
}

migrateLegacyAprilConfig()
