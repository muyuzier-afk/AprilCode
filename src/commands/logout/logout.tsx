import * as React from 'react'
import { Text } from '../../ink.js'
import { getUiText } from '../../i18n/ui.js'
import { gracefulShutdownSync } from '../../utils/gracefulShutdown.js'
import { clearAprilApiConfig } from '../../utils/april.js'

export async function clearStoredApiConfig(): Promise<void> {
  await clearAprilApiConfig()
}

export async function call(): Promise<React.ReactNode> {
  await clearStoredApiConfig()

  const message = <Text>{getUiText('clearedApiCredentials')}</Text>
  setTimeout(() => {
    gracefulShutdownSync(0, 'logout')
  }, 200)

  return message
}
