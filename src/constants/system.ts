const DEFAULT_PREFIX = 'You are April Code, a terminal-first coding assistant.'
const AGENT_SDK_APRIL_CODE_PRESET_PREFIX =
  'You are April Code, running within the April agent runtime.'
const AGENT_SDK_PREFIX = 'You are an April coding agent.'

const CLI_SYSPROMPT_PREFIX_VALUES = [
  DEFAULT_PREFIX,
  AGENT_SDK_APRIL_CODE_PRESET_PREFIX,
  AGENT_SDK_PREFIX,
] as const

export type CLISyspromptPrefix = (typeof CLI_SYSPROMPT_PREFIX_VALUES)[number]

export const CLI_SYSPROMPT_PREFIXES: ReadonlySet<string> = new Set(
  CLI_SYSPROMPT_PREFIX_VALUES,
)

export function getCLISyspromptPrefix(options?: {
  isNonInteractive: boolean
  hasAppendSystemPrompt: boolean
}): CLISyspromptPrefix {
  if (options?.isNonInteractive) {
    if (options.hasAppendSystemPrompt) {
      return AGENT_SDK_APRIL_CODE_PRESET_PREFIX
    }
    return AGENT_SDK_PREFIX
  }

  return DEFAULT_PREFIX
}

export function getAttributionHeader(_fingerprint: string): string {
  return ''
}
