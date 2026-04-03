import type { Command } from '../../commands.js'
import { hasAprilApiConfig } from '../../utils/april.js'

export default () =>
  ({
    type: 'local-jsx',
    name: 'login',
    description: hasAprilApiConfig()
      ? 'Re-run API setup'
      : 'Configure API credentials',
    load: () => import('./login.js'),
  }) satisfies Command
