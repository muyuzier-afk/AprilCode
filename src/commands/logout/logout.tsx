import * as React from 'react'
import { Text } from '../../ink.js'
import { gracefulShutdownSync } from '../../utils/gracefulShutdown.js'
import { clearAprilApiConfig } from '../../utils/april.js'

export async function clearStoredApiConfig(): Promise<void> {
  await clearAprilApiConfig()
}

export async function call(): Promise<React.ReactNode> {
  await clearStoredApiConfig()

  const message = <Text>Cleared stored April API credentials.</Text>
  setTimeout(() => {
    gracefulShutdownSync(0, 'logout')
  }, 200)

  return message
}
