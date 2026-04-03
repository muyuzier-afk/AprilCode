import * as React from 'react'
import { getUiText } from '../i18n/ui.js'
import { Text } from '../ink.js'

export function PressEnterToContinue(): React.ReactNode {
  const [before, after = ''] = getUiText('pressEnterToContinue').split('Enter')

  return (
    <Text color="permission">
      {before}
      <Text bold>Enter</Text>
      {after}
    </Text>
  )
}
