import { createRecoveredDisabledTool } from '../recovery/createRecoveredDisabledTool.js'

export const SuggestBackgroundPRTool = createRecoveredDisabledTool({
  name: 'SuggestBackgroundPR',
  searchHint: 'suggest creating a background pull request',
  unavailableMessage:
    'SuggestBackgroundPR 在当前恢复版中不可用：原始后台 PR 建议逻辑未被还原。',
})
