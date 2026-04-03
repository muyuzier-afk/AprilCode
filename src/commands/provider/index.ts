import type { Command } from '../../commands.js'
import { hasAprilApiConfig } from '../../utils/april.js'

export default () =>
  ({
    type: 'local-jsx',
    name: 'provider',
    description: hasAprilApiConfig()
      ? 'Update API provider settings'
      : 'Configure API provider settings',
    load: () => import('./provider.js'),
  }) satisfies Command
