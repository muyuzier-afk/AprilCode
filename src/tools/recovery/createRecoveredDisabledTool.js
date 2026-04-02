import { z } from 'zod/v4'
import { buildTool } from '../../Tool.js'

const inputSchema = () => z.object({}).passthrough()
const outputSchema = () =>
  z.object({
    status: z.literal('unavailable'),
    message: z.string(),
  })

/**
 * 恢复版通用 disabled tool 工厂。
 * 目标是：
 * 1. 保持构建闭合；
 * 2. 在运行期给出明确提示；
 * 3. 避免空对象/空 class 被后续流程误用后直接崩溃。
 */
export function createRecoveredDisabledTool({
  name,
  searchHint,
  unavailableMessage,
  userFacingName,
}) {
  return buildTool({
    name,
    searchHint,
    maxResultSizeChars: 10_000,
    get inputSchema() {
      return inputSchema()
    },
    get outputSchema() {
      return outputSchema()
    },
    isEnabled() {
      return false
    },
    isReadOnly() {
      return true
    },
    isConcurrencySafe() {
      return true
    },
    userFacingName() {
      return userFacingName ?? name
    },
    async description() {
      return unavailableMessage
    },
    async prompt() {
      return unavailableMessage
    },
    renderToolUseMessage() {
      return null
    },
    async call() {
      return {
        data: {
          status: 'unavailable',
          message: unavailableMessage,
        },
      }
    },
  })
}
