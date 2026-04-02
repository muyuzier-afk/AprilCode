/**
 * 恢复占位实现：
 * context collapse 未恢复时提供稳定的空统计结果。
 */
const EMPTY_STATS = {
  collapsedSpans: 0,
  stagedSpans: 0,
  health: {
    totalErrors: 0,
    totalEmptySpawns: 0,
    emptySpawnWarningEmitted: false,
  },
};

export function getStats() {
  return EMPTY_STATS;
}

export function subscribe() {
  return () => {};
}
