/**
 * 恢复占位实现：
 * 历史 snip 功能默认关闭，避免阻塞构建。
 */
export const SNIP_NUDGE_TEXT =
  'Snip compaction is unavailable in the recovered build.';

export function isSnipRuntimeEnabled() {
  return false;
}

export function shouldNudgeForSnips() {
  return false;
}

export function isSnipMarkerMessage() {
  return false;
}

export function snipCompactIfNeeded(messages) {
  return {
    messages,
    tokensFreed: 0,
    boundaryMessage: null,
  };
}
