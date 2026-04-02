import { RECOVERY_MACRO } from '../recovery/macroShim.js';
import type { Command, LocalCommandCall } from '../types/command.js'

const call: LocalCommandCall = async () => {
  return {
    type: 'text',
    value: RECOVERY_MACRO.BUILD_TIME
      ? `${RECOVERY_MACRO.VERSION} (built ${RECOVERY_MACRO.BUILD_TIME})`
      : RECOVERY_MACRO.VERSION,
  }
}

const version = {
  type: 'local',
  name: 'version',
  description:
    'Print the version this session is running (not what autoupdate downloaded)',
  isEnabled: () => process.env.USER_TYPE === 'ant',
  supportsNonInteractive: true,
  load: () => Promise.resolve({ call }),
} satisfies Command

export default version
