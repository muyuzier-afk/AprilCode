/**
 * 恢复版占位实现：
 * 原始 assistant session discovery 源码未包含在 sourcemap 恢复结果中。
 * 这里提供最小接口，避免动态 import 直接失败。
 */

export type AssistantSession = {
  id: string
  title?: string
  name?: string
  label?: string
  description?: string
  status?: string
  projectName?: string
  repo?: string
  updatedAt?: string
  [key: string]: unknown
}

export async function discoverAssistantSessions(): Promise<AssistantSession[]> {
  return []
}
