import * as React from 'react'
import { Box, Text } from '../../ink.js'

const FULL_WORDMARK = [
  '    _    ____  ____  ___ _     ',
  '   / \\  |  _ \\|  _ \\|_ _| |    ',
  '  / _ \\ | |_) | |_) || || |    ',
  ' / ___ \\|  __/|  _ < | || |___ ',
  '/_/   \\_\\_|   |_| \\_\\___|_____|',
] as const

const COMPACT_WORDMARK = [
  ' .------------. ',
  ' | APRIL CODE | ',
  " '------------' ",
] as const

type Props = {
  compact?: boolean
}

export function AprilWordmark({ compact = false }: Props): React.ReactNode {
  const lines = compact ? COMPACT_WORDMARK : FULL_WORDMARK

  return (
    <Box flexDirection="column" alignItems="center">
      {lines.map((line, index) => (
        <Text key={`${compact ? 'compact' : 'full'}-${index}`} color="success">
          {line}
        </Text>
      ))}
    </Box>
  )
}
