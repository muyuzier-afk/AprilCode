/**
 * 恢复占位实现：
 * 仅提供运行时判定函数，类型信息由 TypeScript import type 擦除。
 */
export function isConnectorTextBlock(value) {
  return Boolean(
    value &&
      typeof value === 'object' &&
      'type' in value &&
      value.type === 'connector_text',
  );
}
