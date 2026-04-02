import { VERIFY_PLAN_EXECUTION_TOOL_NAME } from './constants.js'
import { createRecoveredDisabledTool } from '../recovery/createRecoveredDisabledTool.js'

export const VerifyPlanExecutionTool = createRecoveredDisabledTool({
  name: VERIFY_PLAN_EXECUTION_TOOL_NAME,
  searchHint: 'verify plan execution in background',
  unavailableMessage:
    'VerifyPlanExecution 在当前恢复版中不可用：原始计划校验实现未被还原。',
})
