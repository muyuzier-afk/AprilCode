import type { Command } from '../../commands.js'
import { getUiText } from '../../i18n/ui.js'
import { hasAprilApiConfig } from '../../utils/april.js'

export default () =>
  ({
    type: 'local-jsx',
    name: 'provider',
    description: hasAprilApiConfig()
      ? getUiText('providerDescriptionConfigured')
      : getUiText('providerDescriptionUnconfigured'),
    load: () => import('./provider.js'),
  }) satisfies Command
