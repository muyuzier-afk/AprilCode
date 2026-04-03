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
    welcomeBack: 'Welcome back!',
    welcomeBackWithName: 'Welcome back {{username}}!',
    apiUsageBilling: 'API Usage Billing',
    recentActivityTitle: 'Recent activity',
    recentActivityEmpty: 'No recent activity',
    recentActivityFooter: '/resume for more',
    onboardingTipsTitle: 'Tips for getting started',
    onboardingHomeDirectoryWarning:
      'Note: You have launched April Code in your home directory. For the best experience, launch it in a project directory instead.',
    onboardingStepCreateApp:
      'Ask April Code to create a new app or clone a repository',
    onboardingStepInitClaude:
      'Run /init to create a CLAUDE.md file with instructions for April Code',
    shortcutsHint: '? for shortcuts',
    voiceHoldToSpeak: 'hold {{shortcut}} to speak',
    whatsNewTitle: "What's new",
    whatsNewTitleAnt: "What's new [ANT-ONLY: Latest CC commits]",
    whatsNewEmpty: 'Check the April Code changelog for updates',
    whatsNewEmptyAnt: 'Unable to fetch latest claude-cli-internal commits',
    whatsNewFooter: '/release-notes for more',
    guestPassesTitle: '3 guest passes',
    guestPassesSubtitle: 'Share April Code with friends',
    guestPassesSubtitleWithReward:
      'Share April Code and earn {{reward}} of extra usage',
    sandboxWarning:
      'Your bash commands will be sandboxed. Disable with /sandbox.',
    footerWaiting: 'waiting {{duration}}',
    footerViewTasks: 'view tasks',
    footerManage: 'manage',
    footerShowTasks: 'show tasks',
    footerShowTeammates: 'show teammates',
    footerHide: 'hide',
    footerHideTasks: 'hide tasks',
    pressAgainToExitPlain: 'Press {{key}} again to exit',
    pastingText: 'Pasting text…',
    debugModeEnabled: 'Debug mode enabled',
    loggingTo: 'Logging to: {{target}}',
    tmuxSession: 'tmux session: {{session}}',
    tmuxDetach: 'Detach: {{prefix}} d',
    tmuxDetachConflict:
      'Detach: {{prefix}} {{prefix}} d (press prefix twice - April Code uses {{prefix}})',
    messageFrom: 'Message from {{organization}}:',
    issueReportHint: 'Use /issue to report model behavior issues',
    antLogsTitle: '[ANT-ONLY] Logs:',
    antLogsApiCalls: 'API calls: {{path}}',
    antLogsDebugLogs: 'Debug logs: {{path}}',
    antLogsStartupPerf: 'Startup Perf: {{path}}',
    enterToConfirmEscToCancel: 'Enter to confirm · Esc to cancel',
    enterToConfirmEscToExit: 'Enter to confirm · Esc to exit',
    escToCancel: 'Esc to cancel',
    pressEnterToContinuePlain: 'Press Enter to continue',
    trustFolderYes: 'Yes, I trust this folder',
    trustFolderNo: 'No, exit',
    trustWorkspaceTitle: 'Accessing workspace:',
    trustSettingsYes: 'Yes, I trust these settings',
    trustSettingsNo: 'No, exit April Code',
    setupWarningsTitle: 'Setup Warnings',
    setupWarningsDescription:
      'We found some potential issues, but you can continue anyway',
    setupWarningsContinue:
      'Press Enter to continue anyway, or Ctrl+C to exit and fix issues',
    setupWarningsManual:
      'You can also try the manual setup steps if needed:',
    fastModeGuide: 'Tab to toggle · Enter to confirm · Esc to cancel',
    fastModeEscToCancel: 'Esc to cancel',
    fastModeTitle: 'Fast mode (research preview)',
    fastModeLabel: 'Fast mode',
    fastModeOn: 'ON',
    fastModeOff: 'OFF',
    fastModeLearnMore: 'Learn more:',
    fastModeSubtitle:
      'High-speed mode for {{model}}. Billed as extra usage at a premium rate. Separate rate limits apply.',
    fastModeUnavailableOverloaded:
      'Fast mode overloaded and is temporarily unavailable',
    fastModeUnavailableLimit: "You've hit your fast limit",
    fastModeResetsIn: 'resets in {{duration}}',
    fastModeResultUnavailable: 'Fast mode unavailable: {{reason}}',
    fastModeResultModelSet: 'model set to {{model}}',
    fastModeResultOn: 'Fast mode ON',
    fastModeResultOff: 'Fast mode OFF',
    fastModeResultKeptOn: 'Kept Fast mode ON',
    fastModeResultKeptOff: 'Kept Fast mode OFF',
    remoteLabel: 'remote',
    nativeSelect: 'native select',
    macOptionClickSetting:
      'set macOptionClickForcesSelection in VS Code settings',
    undercoverLabel: 'undercover',
    fuzzyPickerTypeToSearch: 'Type to search…',
    fuzzyPickerNoResults: 'No results',
    quickOpenTitle: 'Quick Open',
    quickOpenPlaceholder: 'Type to search files…',
    quickOpenEmptyQuery: 'Start typing to search…',
    quickOpenEmptyNoMatch: 'No matching files',
    quickOpenOpenInEditor: 'open in editor',
    globalSearchTitle: 'Global Search',
    globalSearchPlaceholder: 'Type to search…',
    globalSearchSearching: 'Searching…',
    globalSearchNoMatches: 'No matches',
    modelSetTo: 'Model set to {{model}}',
    billedAsExtraUsage: 'Billed as extra usage',
    permissionEnterSubmitEscCancel: 'Enter to submit · Esc to cancel',
    permissionEscCancel: 'Esc to cancel',
    helpForMore: 'For more help:',
    remoteSessionDetailsTitle: 'Remote session details',
    remoteSessionDismissed: 'Remote session details dismissed',
    remoteSessionStatus: 'Status',
    remoteSessionRuntime: 'Runtime',
    remoteSessionTitleLabel: 'Title',
    remoteSessionProgress: 'Progress',
    remoteSessionUrl: 'Session URL',
    remoteSessionRecentMessages: 'Recent messages',
    remoteSessionShowingLast: 'Showing last {{shown}} of {{total}} messages',
    remoteSessionTeleportFailed: 'Teleport failed: {{error}}',
    guestPassesDismissed: 'Guest passes dialog dismissed',
    guestPassesLoading: 'Loading guest pass information…',
    guestPassesUnavailable: 'Guest passes are not currently available.',
    guestPassesRemaining: 'Guest passes · {{count}} left',
    termsApply: 'Terms apply.',
    enterCopyLinkEscCancel: 'Enter to copy link · Esc to cancel',
    searchWithClaude: 'Searching with Claude…',
    typeToSearchTitleCase: 'Type to Search',
    learnMore: 'Learn more:',
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
    welcomeBack: '欢迎回来！',
    welcomeBackWithName: '欢迎回来，{{username}}！',
    apiUsageBilling: 'API 用量计费',
    recentActivityTitle: '最近活动',
    recentActivityEmpty: '暂无最近活动',
    recentActivityFooter: '/resume 查看更多',
    onboardingTipsTitle: '开始使用提示',
    onboardingHomeDirectoryWarning:
      '注意：你当前是在 home 目录启动的 April Code。为了获得更好的体验，建议在项目目录中启动。',
    onboardingStepCreateApp: '让 April Code 创建一个新应用，或克隆一个仓库',
    onboardingStepInitClaude:
      '运行 /init 创建包含 April Code 使用说明的 CLAUDE.md 文件',
    shortcutsHint: '? 查看快捷键',
    voiceHoldToSpeak: '按住 {{shortcut}} 开始说话',
    whatsNewTitle: '新内容',
    whatsNewTitleAnt: '新内容 [仅 ANT: 最新 CC 提交]',
    whatsNewEmpty: '查看 April Code 更新日志以了解最新变化',
    whatsNewEmptyAnt: '无法获取最新 claude-cli-internal 提交',
    whatsNewFooter: '/release-notes 查看更多',
    guestPassesTitle: '3 张邀请卡',
    guestPassesSubtitle: '分享 April Code 给朋友',
    guestPassesSubtitleWithReward:
      '分享 April Code，可额外获得 {{reward}} 使用额度',
    sandboxWarning:
      '你的 bash 命令将在沙箱中执行。可用 /sandbox 关闭。',
    footerWaiting: '等待中 {{duration}}',
    footerViewTasks: '查看任务',
    footerManage: '管理',
    footerShowTasks: '显示任务',
    footerShowTeammates: '显示队友',
    footerHide: '隐藏',
    footerHideTasks: '隐藏任务',
    pressAgainToExitPlain: '再按一次 {{key}} 退出',
    pastingText: '正在粘贴文本…',
    debugModeEnabled: '调试模式已开启',
    loggingTo: '日志输出到：{{target}}',
    tmuxSession: 'tmux 会话：{{session}}',
    tmuxDetach: '分离：{{prefix}} d',
    tmuxDetachConflict:
      '分离：{{prefix}} {{prefix}} d（前缀按两次，April Code 使用 {{prefix}}）',
    messageFrom: '来自 {{organization}} 的消息：',
    issueReportHint: '使用 /issue 反馈模型行为问题',
    antLogsTitle: '[仅 ANT] 日志：',
    antLogsApiCalls: 'API 调用：{{path}}',
    antLogsDebugLogs: '调试日志：{{path}}',
    antLogsStartupPerf: '启动性能：{{path}}',
    enterToConfirmEscToCancel: 'Enter 确认 · Esc 取消',
    enterToConfirmEscToExit: 'Enter 确认 · Esc 退出',
    escToCancel: 'Esc 取消',
    pressEnterToContinuePlain: '按 Enter 继续',
    trustFolderYes: '是，我信任这个文件夹',
    trustFolderNo: '否，退出',
    trustWorkspaceTitle: '访问工作区：',
    trustSettingsYes: '是，我信任这些设置',
    trustSettingsNo: '否，退出 April Code',
    setupWarningsTitle: '安装警告',
    setupWarningsDescription: '我们发现了一些潜在问题，但你仍然可以继续',
    setupWarningsContinue:
      '按 Enter 仍然继续，或按 Ctrl+C 退出并先修复这些问题',
    setupWarningsManual: '如有需要，你也可以尝试手动安装步骤：',
    fastModeGuide: 'Tab 切换 · Enter 确认 · Esc 取消',
    fastModeEscToCancel: 'Esc 取消',
    fastModeTitle: 'Fast mode（研究预览）',
    fastModeLabel: 'Fast mode',
    fastModeOn: '开启',
    fastModeOff: '关闭',
    fastModeLearnMore: '了解更多：',
    fastModeSubtitle:
      '面向 {{model}} 的高速模式。会按更高费率计入额外用量，并且适用独立速率限制。',
    fastModeUnavailableOverloaded: 'Fast mode 过载，暂时不可用',
    fastModeUnavailableLimit: '你已达到 Fast mode 使用上限',
    fastModeResetsIn: '{{duration}} 后重置',
    fastModeResultUnavailable: 'Fast mode 不可用：{{reason}}',
    fastModeResultModelSet: '模型已切换为 {{model}}',
    fastModeResultOn: 'Fast mode 已开启',
    fastModeResultOff: 'Fast mode 已关闭',
    fastModeResultKeptOn: '保持 Fast mode 开启',
    fastModeResultKeptOff: '保持 Fast mode 关闭',
    remoteLabel: '远程',
    nativeSelect: '原生选择',
    macOptionClickSetting:
      '请在 VS Code 设置中开启 macOptionClickForcesSelection',
    undercoverLabel: '隐身模式',
    fuzzyPickerTypeToSearch: '输入以搜索…',
    fuzzyPickerNoResults: '无结果',
    quickOpenTitle: '快速打开',
    quickOpenPlaceholder: '输入以搜索文件…',
    quickOpenEmptyQuery: '开始输入以搜索…',
    quickOpenEmptyNoMatch: '没有匹配的文件',
    quickOpenOpenInEditor: '在编辑器中打开',
    globalSearchTitle: '全局搜索',
    globalSearchPlaceholder: '输入以搜索…',
    globalSearchSearching: '搜索中…',
    globalSearchNoMatches: '无匹配结果',
    modelSetTo: '模型已切换为 {{model}}',
    billedAsExtraUsage: '按额外用量计费',
    permissionEnterSubmitEscCancel: 'Enter 提交 · Esc 取消',
    permissionEscCancel: 'Esc 取消',
    helpForMore: '更多帮助：',
    remoteSessionDetailsTitle: '远程会话详情',
    remoteSessionDismissed: '已关闭远程会话详情',
    remoteSessionStatus: '状态',
    remoteSessionRuntime: '运行时长',
    remoteSessionTitleLabel: '标题',
    remoteSessionProgress: '进度',
    remoteSessionUrl: '会话链接',
    remoteSessionRecentMessages: '最近消息',
    remoteSessionShowingLast: '显示最近 {{shown}} / {{total}} 条消息',
    remoteSessionTeleportFailed: 'Teleport 失败：{{error}}',
    guestPassesDismissed: '已关闭邀请卡对话框',
    guestPassesLoading: '正在加载邀请卡信息…',
    guestPassesUnavailable: '当前没有可用邀请卡。',
    guestPassesRemaining: '邀请卡 · 剩余 {{count}} 张',
    termsApply: '适用条款。',
    enterCopyLinkEscCancel: 'Enter 复制链接 · Esc 取消',
    searchWithClaude: 'Claude 搜索中…',
    typeToSearchTitleCase: '输入以搜索',
    learnMore: '了解更多：',
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
