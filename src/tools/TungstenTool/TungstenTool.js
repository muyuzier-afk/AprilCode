import { createRecoveredDisabledTool } from '../recovery/createRecoveredDisabledTool.js'

const UNAVAILABLE_MESSAGE =
  'Tungsten 在当前恢复版中不可用：原始 tmux/terminal 管理实现未被还原。'

export const TungstenTool = createRecoveredDisabledTool({
  name: 'Tungsten',
  searchHint: 'manage tmux sessions in tungsten',
  unavailableMessage: UNAVAILABLE_MESSAGE,
})

export function clearSessionsWithTungstenUsage() {}

export function resetInitializationState() {}
