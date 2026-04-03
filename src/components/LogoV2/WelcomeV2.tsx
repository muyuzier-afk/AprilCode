import * as React from 'react'
import { Box, Text } from '../../ink.js'
import { getUiText } from '../../i18n/ui.js'
import { RECOVERY_MACRO } from '../../recovery/macroShim.js'
import { AprilWordmark } from './AprilWordmark.js'

const WELCOME_V2_WIDTH = 58

export function WelcomeV2(): React.ReactNode {
  return (
    <Box width={WELCOME_V2_WIDTH} flexDirection="column" alignItems="center">
      <Text>
        <Text color="success" bold>
          {getUiText('welcomeMessage')}
        </Text>{' '}
        <Text dimColor>v{RECOVERY_MACRO.VERSION}</Text>
      </Text>
      <Box marginTop={1}>
        <AprilWordmark />
      </Box>
    </Box>
  )
}
