/**
 * 恢复占位实现：
 * cached microcompact 在恢复版中默认关闭，并提供最小 noop API。
 */
export function isCachedMicrocompactEnabled() {
  return false;
}

export function isModelSupportedForCacheEditing() {
  return false;
}

export function getCachedMCConfig() {
  return {
    supportedModels: [],
  };
}

export function createCachedMCState() {
  return {
    pinnedEdits: [],
    registeredTools: new Set(),
    registeredMessages: new Set(),
  };
}

export function registerToolResult(state, toolUseId) {
  state.registeredTools.add(toolUseId);
}

export function registerToolMessage(state, toolUseIds) {
  state.registeredMessages.add(JSON.stringify(toolUseIds));
}

export function getToolResultsToDelete() {
  return [];
}

export function createCacheEditsBlock() {
  return null;
}

export function markToolsSentToAPI() {}

export function resetCachedMCState(state) {
  state.pinnedEdits = [];
  state.registeredTools = new Set();
  state.registeredMessages = new Set();
}
