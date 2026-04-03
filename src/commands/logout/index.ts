import type { Command } from '../../commands.js'
import { getUiText } from '../../i18n/ui.js'

export default {
  type: 'local-jsx',
  name: 'logout',
  description: getUiText('logoutDescription'),
  load: () => import('./logout.js'),
} satisfies Command
