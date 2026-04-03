import React from 'react'
import { getUiText } from '../i18n/ui.js'
import { Box, Text } from '../ink.js'
import { useKeybindings } from '../keybindings/useKeybinding.js'

type Props = {
  forceLoginMethod?: 'claudeai' | 'console'
  mode?: 'login' | 'setup-token'
  onDone: () => void
  startingMessage?: string
}

export function ConsoleOAuthFlow({
  mode = 'login',
  onDone,
  startingMessage,
}: Props): React.ReactNode {
  useKeybindings(
    {
      'confirm:yes': onDone,
      'confirm:no': onDone,
    },
    {
      context: 'Confirmation',
      isActive: true,
    },
  )

  return (
    <Box flexDirection="column" gap={1}>
      <Text color="warning">
        {mode === 'setup-token'
          ? getUiText('oauthSetupTokenRemoved')
          : getUiText('oauthRemovedShort')}
      </Text>
      {startingMessage ? <Text dimColor>{startingMessage}</Text> : null}
      <Text>{getUiText('oauthRemovedConfigureInstead')}</Text>
      <Text dimColor>{getUiText('pressEnterOrEscToContinue')}</Text>
    </Box>
  )
}
