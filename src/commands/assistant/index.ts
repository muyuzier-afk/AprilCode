import type { Command } from '../../commands.js'

const assistant = {
  type: 'local',
  name: 'assistant',
  description: 'Recovered placeholder command for assistant (disabled).',
  supportsNonInteractive: true,
  isEnabled: () => false,
  isHidden: true,
  load: async () => ({
    call: async () => ({
      type: 'text' as const,
      value:
        'assistant 功能在当前恢复版中尚未还原，已使用占位命令防止运行期崩溃。',
    }),
  }),
} satisfies Command

export default assistant
