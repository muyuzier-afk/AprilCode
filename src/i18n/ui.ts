import { getGlobalConfig, isConfigReadingAllowed, saveGlobalConfig } from '../utils/config.js'
import { getSystemLocaleLanguage } from '../utils/intl.js'

export type UiLanguage = 'en' | 'zh-CN'

const translations = {
  en: {
    welcomeMessage: 'Welcome to April Code',
    setupLanguageTitle: 'Choose interface language / 选择界面语言',
    setupLanguageDescription:
      'This controls the setup flow and April Code interface text.',
    setupLanguageOptionZh: '简体中文',
    setupLanguageOptionZhDesc: 'Use Simplified Chinese for setup and UI text.',
    setupLanguageOptionEn: 'English',
    setupLanguageOptionEnDesc: 'Use English for setup and UI text.',
    setupLanguageHint: 'You can update this later in ~/.april/.config.json.',
    themeHelpText: 'To change this later, run /theme',
    securityTitle: 'Security notes:',
    securityItem1Title: 'April Code can make mistakes',
    securityItem1Body:
      'You should always review model output, especially before executing code or applying file edits.',
    securityItem2Title: 'Only use it with repositories and prompts you trust',
    securityItem2Body:
      'Prompt injection and hostile tool output are still risks. Review generated commands before running them.',
    securityItem3Title: 'Telemetry is disabled by default',
    securityItem3Body:
      'Set APRIL_TELEMETRY_ENABLED=1 only if you later add your own telemetry pipeline.',
    terminalSetupTitle: "Use April Code's terminal setup?",
    terminalSetupIntro:
      'For the optimal coding experience, enable the recommended settings for your terminal:',
    terminalSetupAppleMode: 'Option+Enter for newlines and visual bell',
    terminalSetupOtherMode: 'Shift+Enter for newlines',
    terminalSetupYes: 'Yes, use recommended settings',
    terminalSetupNo: 'No, maybe later with /terminal-setup',
    pressAgainToExit: 'Press {{key}} again to exit',
    enterToConfirmEscToSkip: 'Enter to confirm · Esc to skip',
    pressEnterToContinue: 'Press Enter to continue…',
    apiSetupSummary:
      'April Code uses fixed API Type / Key / URL / Model settings. OAuth is disabled, and sensitive values are encrypted at rest. Use /provider later to update them.',
    apiTypeLabel: 'API Type',
    apiTypePlaceholder: 'anthropic / openai-responses / openai-chat',
    apiTypeDescription:
      'Supported values: anthropic, openai-responses, openai-chat.',
    apiKeyLabel: 'API Key',
    apiKeyPlaceholder: 'sk-...',
    apiKeyDescription: 'Enter the API key for the selected provider.',
    baseUrlFieldLabel: 'Base URL',
    baseUrlPlaceholder: 'https://example.com/v1',
    baseUrlDescription:
      'Enter the API base URL. OpenAI-like endpoints are usually https://example.com/v1. Anthropic uses https://api.anthropic.com.',
    modelLabel: 'Model',
    modelPlaceholder: 'claude-sonnet-4-5 / gpt-4.1 / qwen-max',
    modelDescription: 'Enter the default model name.',
    notSet: '(not set)',
    savingConfig: 'Saving configuration...',
    setupContinueCancel: 'Enter to continue, Esc to cancel.',
    loginDescriptionConfigured: 'Re-run API setup',
    loginDescriptionUnconfigured: 'Configure API credentials',
    providerDescriptionConfigured: 'Update API provider settings',
    providerDescriptionUnconfigured: 'Configure API provider settings',
    logoutDescription: 'Clear stored API credentials',
    configureApiTitle: 'Configure API',
    providerSettingsTitle: 'Provider Settings',
    cancelAction: 'cancel',
    apiConfigurationSaved: 'API configuration saved',
    apiConfigurationInterrupted: 'API configuration interrupted',
    providerConfigurationSaved: 'Provider configuration saved',
    providerConfigurationInterrupted: 'Provider configuration interrupted',
    oauthRemovedLong:
      'OAuth login has been removed from April Code. Open April Code and run /login for initial setup, or /provider to update API Type, Key, Base URL, and Model.\n',
    oauthRemovedShort:
      'OAuth login has been removed from April Code. Use /login for initial setup, or /provider to update API Type, Key, Base URL, and Model.',
    oauthRemovedConfigureInstead:
      'Use /login to configure API key, base URL, and model instead.',
    oauthSetupTokenRemoved:
      'OAuth token setup has been removed from April Code.',
    pressEnterOrEscToContinue: 'Press Enter or Esc to continue.',
    statusConfigured: 'configured',
    statusApiFormat: 'apiFormat',
    statusApiKeyConfigured: 'apiKeyConfigured',
    statusBaseUrl: 'baseUrl',
    statusModel: 'model',
    statusTelemetryEnabled: 'telemetryEnabled',
    yes: 'yes',
    no: 'no',
    clearedApiCredentials: 'Cleared stored April API credentials.',
    setupTokenDescription: 'OAuth token setup removed; use /login instead',
    themeSectionTitle: 'Theme',
    themeIntro: "Let's get started.",
    themeHeading: 'Choose the text style that looks best with your terminal',
    themeOptionAuto: 'Auto (match terminal)',
    themeOptionDark: 'Dark mode',
    themeOptionLight: 'Light mode',
    themeOptionDarkDaltonized: 'Dark mode (colorblind-friendly)',
    themeOptionLightDaltonized: 'Light mode (colorblind-friendly)',
    themeOptionDarkAnsi: 'Dark mode (ANSI colors only)',
    themeOptionLightAnsi: 'Light mode (ANSI colors only)',
    themeSyntaxDisabledEnv:
      'Syntax highlighting disabled (via CLAUDE_CODE_SYNTAX_HIGHLIGHT={{value}})',
    themeSyntaxDisabledShortcut:
      'Syntax highlighting disabled ({{shortcut}} to enable)',
    themeSyntaxTheme:
      'Syntax theme: {{theme}}{{sourceSuffix}} ({{shortcut}} to disable)',
    themeSyntaxEnabledShortcut:
      'Syntax highlighting enabled ({{shortcut}} to disable)',
    themeSelectAction: 'select',
  },
  'zh-CN': {
    welcomeMessage: '欢迎使用 April Code',
    setupLanguageTitle: '选择界面语言 / Choose interface language',
    setupLanguageDescription: '该设置会控制 Setup 流程和 April Code 的界面文案。',
    setupLanguageOptionZh: '简体中文',
    setupLanguageOptionZhDesc: 'Setup 和界面文案使用简体中文。',
    setupLanguageOptionEn: 'English',
    setupLanguageOptionEnDesc: 'Setup 和界面文案使用英文。',
    setupLanguageHint: '后续可在 ~/.april/.config.json 中修改。',
    themeHelpText: '后续可通过 /theme 修改',
    securityTitle: '安全说明：',
    securityItem1Title: 'April Code 可能会出错',
    securityItem1Body: '在执行命令或应用文件修改前，请始终检查模型输出。',
    securityItem2Title: '仅用于你信任的仓库和提示词',
    securityItem2Body:
      '提示词注入和恶意工具输出仍然存在风险。执行生成命令前请先检查。',
    securityItem3Title: '默认关闭遥测',
    securityItem3Body:
      '只有在你后续接入自己的遥测管道时，才需要设置 APRIL_TELEMETRY_ENABLED=1。',
    terminalSetupTitle: '是否使用 April Code 的终端推荐配置？',
    terminalSetupIntro: '为了获得更好的编码体验，建议为当前终端启用推荐设置：',
    terminalSetupAppleMode: 'Option+Enter 插入换行，并启用视觉铃声',
    terminalSetupOtherMode: 'Shift+Enter 插入换行',
    terminalSetupYes: '是，应用推荐设置',
    terminalSetupNo: '否，稍后再用 /terminal-setup',
    pressAgainToExit: '再按一次 {{key}} 退出',
    enterToConfirmEscToSkip: 'Enter 确认 · Esc 跳过',
    pressEnterToContinue: '按 Enter 继续…',
    apiSetupSummary:
      'April Code 使用固定的 API Type / Key / URL / Model 配置。OAuth 已禁用，敏感值会加密存储。后续可通过 /provider 修改。',
    apiTypeLabel: 'API 类型',
    apiTypePlaceholder: 'anthropic / openai-responses / openai-chat',
    apiTypeDescription:
      '支持 anthropic、openai-responses、openai-chat。',
    apiKeyLabel: 'API Key',
    apiKeyPlaceholder: 'sk-...',
    apiKeyDescription: '输入所选 Provider 的 API Key。',
    baseUrlFieldLabel: 'Base URL',
    baseUrlPlaceholder: 'https://example.com/v1',
    baseUrlDescription:
      '输入 API 基础地址。OpenAI Like 一般是 https://example.com/v1；Anthropic 可用 https://api.anthropic.com。',
    modelLabel: '模型',
    modelPlaceholder: 'claude-sonnet-4-5 / gpt-4.1 / qwen-max',
    modelDescription: '输入默认模型名称。',
    notSet: '未设置',
    savingConfig: '正在保存配置...',
    setupContinueCancel: 'Enter 继续，Esc 取消。',
    loginDescriptionConfigured: '重新执行 API 配置',
    loginDescriptionUnconfigured: '配置 API 凭证',
    providerDescriptionConfigured: '更新 API Provider 配置',
    providerDescriptionUnconfigured: '配置 API Provider',
    logoutDescription: '清除已存储的 API 凭证',
    configureApiTitle: '配置 API',
    providerSettingsTitle: 'Provider 设置',
    cancelAction: '取消',
    apiConfigurationSaved: 'API 配置已保存',
    apiConfigurationInterrupted: 'API 配置已中断',
    providerConfigurationSaved: 'Provider 配置已保存',
    providerConfigurationInterrupted: 'Provider 配置已中断',
    oauthRemovedLong:
      'April Code 已移除 OAuth 登录。请打开 April Code 后运行 /login 完成初始化，或用 /provider 更新 API Type、Key、Base URL 和 Model。\n',
    oauthRemovedShort:
      'April Code 已移除 OAuth 登录。请使用 /login 完成初始化，或用 /provider 更新 API Type、Key、Base URL 和 Model。',
    oauthRemovedConfigureInstead:
      '请改用 /login 配置 API Key、Base URL 和模型。',
    oauthSetupTokenRemoved: 'April Code 已移除 OAuth token 初始化。',
    pressEnterOrEscToContinue: '按 Enter 或 Esc 继续。',
    statusConfigured: '已配置',
    statusApiFormat: 'API 类型',
    statusApiKeyConfigured: 'API Key 已配置',
    statusBaseUrl: 'Base URL',
    statusModel: '模型',
    statusTelemetryEnabled: '遥测已启用',
    yes: '是',
    no: '否',
    clearedApiCredentials: '已清除已存储的 April API 凭证。',
    setupTokenDescription: 'OAuth token 初始化已移除；请改用 /login',
    themeSectionTitle: '主题',
    themeIntro: '开始初始化设置。',
    themeHeading: '选择最适合你终端显示效果的文本样式',
    themeOptionAuto: '自动（跟随终端）',
    themeOptionDark: '深色模式',
    themeOptionLight: '浅色模式',
    themeOptionDarkDaltonized: '深色模式（色弱友好）',
    themeOptionLightDaltonized: '浅色模式（色弱友好）',
    themeOptionDarkAnsi: '深色模式（仅 ANSI 颜色）',
    themeOptionLightAnsi: '浅色模式（仅 ANSI 颜色）',
    themeSyntaxDisabledEnv:
      '语法高亮已关闭（通过 CLAUDE_CODE_SYNTAX_HIGHLIGHT={{value}}）',
    themeSyntaxDisabledShortcut: '语法高亮已关闭（{{shortcut}} 开启）',
    themeSyntaxTheme: '语法主题：{{theme}}{{sourceSuffix}}（{{shortcut}} 关闭）',
    themeSyntaxEnabledShortcut: '语法高亮已开启（{{shortcut}} 关闭）',
    themeSelectAction: '选择',
  },
} as const

export type UiTextKey = keyof (typeof translations)['en']

function formatTemplate(
  template: string,
  vars: Record<string, string | number> = {},
): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => String(vars[key] ?? ''))
}

export function normalizeUiLanguage(value?: string | null): UiLanguage | undefined {
  const normalized = value?.trim().toLowerCase()
  switch (normalized) {
    case 'en':
    case 'en-us':
    case 'en-gb':
    case 'english':
      return 'en'
    case 'zh':
    case 'zh-cn':
    case 'zh-hans':
    case 'simplified-chinese':
    case 'simplified chinese':
    case '简体中文':
      return 'zh-CN'
    default:
      return undefined
  }
}

export function getDefaultUiLanguage(): UiLanguage {
  return getSystemLocaleLanguage() === 'zh' ? 'zh-CN' : 'en'
}

export function getStoredUiLanguage(): UiLanguage | undefined {
  if (!isConfigReadingAllowed()) {
    return undefined
  }

  return normalizeUiLanguage(getGlobalConfig().uiLanguage)
}

export function getUiLanguage(): UiLanguage {
  return (
    normalizeUiLanguage(process.env.APRIL_UI_LANGUAGE) ||
    getStoredUiLanguage() ||
    getDefaultUiLanguage()
  )
}

export function setUiLanguage(language: UiLanguage): void {
  process.env.APRIL_UI_LANGUAGE = language

  if (!isConfigReadingAllowed()) {
    return
  }

  saveGlobalConfig(current =>
    current.uiLanguage === language
      ? current
      : {
          ...current,
          uiLanguage: language,
        },
  )
}

export function getUiText(
  key: UiTextKey,
  vars?: Record<string, string | number>,
): string {
  const language = getUiLanguage()
  return formatTemplate(translations[language][key], vars)
}

export function getUiTextFor(
  language: UiLanguage,
  key: UiTextKey,
  vars?: Record<string, string | number>,
): string {
  return formatTemplate(translations[language][key], vars)
}
