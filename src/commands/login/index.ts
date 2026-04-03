import type { Command } from '../../commands.js'
import { getUiText } from '../../i18n/ui.js'
import { hasAprilApiConfig } from '../../utils/april.js'

export default () =>
  ({
    type: 'local-jsx',
    name: 'login',
    description: hasAprilApiConfig()
      ? getUiText('loginDescriptionConfigured')
      : getUiText('loginDescriptionUnconfigured'),
    load: () => import('./login.js'),
  }) satisfies Command
