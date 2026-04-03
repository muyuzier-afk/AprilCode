import type { Command } from '../../commands.js'

export default {
  type: 'local-jsx',
  name: 'logout',
  description: 'Clear stored API credentials',
  load: () => import('./logout.js'),
} satisfies Command
