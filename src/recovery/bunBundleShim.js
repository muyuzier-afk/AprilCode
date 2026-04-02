/**
 * 恢复源码兼容层：
 * 原始源码依赖 bun:bundle 的 feature() 做编译期开关裁剪。
 * 这里改为通过环境变量 CLAUDE_CODE_FEATURES=FLAG_A,FLAG_B 进行运行时判定，
 * 以保证恢复后的源码至少可以继续被编译。
 */
const enabledFeatures = new Set(
  (process.env.CLAUDE_CODE_FEATURES ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean),
);

export function feature(name) {
  return enabledFeatures.has(name);
}
