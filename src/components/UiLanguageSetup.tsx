import * as React from 'react'
import { Box, Text } from '../ink.js'
import { getDefaultUiLanguage, getUiText, type UiLanguage } from '../i18n/ui.js'
import { Select } from './CustomSelect/select.js'

type Props = {
  initialLanguage?: UiLanguage
  onDone: (language: UiLanguage) => void
}

function getOptions() {
  return [
    {
      label: getUiText('setupLanguageOptionZh'),
      value: 'zh-CN' as const,
      description: getUiText('setupLanguageOptionZhDesc'),
    },
    {
      label: getUiText('setupLanguageOptionEn'),
      value: 'en' as const,
      description: getUiText('setupLanguageOptionEnDesc'),
    },
  ]
}

export function UiLanguageSetup({
  initialLanguage,
  onDone,
}: Props): React.ReactNode {
  const language = initialLanguage ?? getDefaultUiLanguage()
  const options = getOptions()

  return (
    <Box flexDirection="column" gap={1} paddingLeft={1} width={76}>
      <Text bold>{getUiText('setupLanguageTitle')}</Text>
      <Text dimColor>{getUiText('setupLanguageDescription')}</Text>
      <Select
        options={options}
        defaultValue={language}
        defaultFocusValue={language}
        onChange={value => onDone(value as UiLanguage)}
        onCancel={() => onDone(language)}
      />
      <Text dimColor>{getUiText('setupLanguageHint')}</Text>
    </Box>
  )
}
