import React from 'react'
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
          ? 'OAuth token setup has been removed from April Code.'
          : 'OAuth login has been removed from April Code.'}
      </Text>
      {startingMessage ? <Text dimColor>{startingMessage}</Text> : null}
      <Text>Use /login to configure API key, base URL, and model instead.</Text>
      <Text dimColor>Press Enter or Esc to continue.</Text>
    </Box>
  )
}
