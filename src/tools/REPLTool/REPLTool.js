import { REPL_TOOL_NAME } from './constants.js'
import { createRecoveredDisabledTool } from '../recovery/createRecoveredDisabledTool.js'

export const REPLTool = createRecoveredDisabledTool({
  name: REPL_TOOL_NAME,
  searchHint: 'batch primitive tool calls via repl',
  unavailableMessage:
    'REPL 在当前恢复版中不可用：原始 VM/bridge 执行实现未被还原。',
})
