/**
 * 恢复占位实现：
 * 仅提供禁用命令占位，避免 feature 打开时命令元数据不完整。
 */
export default {
  type: 'local',
  name: 'agents-platform',
  description: 'Recovered placeholder command for agents-platform (disabled).',
  supportsNonInteractive: true,
  isEnabled: () => false,
  isHidden: true,
  load: async () => ({
    call: async () => ({
      type: 'text',
      value:
        'agents-platform 功能在当前恢复版中尚未还原，已禁用以避免运行期异常。',
    }),
  }),
}
