import React, { useMemo, useState } from 'react'
import { Box, Text } from '../ink.js'
import { getUiText } from '../i18n/ui.js'
import {
  getAprilApiConfig,
  saveAprilApiConfig,
  validateAprilApiFormat,
  validateAprilApiKey,
  validateAprilBaseUrl,
  validateAprilModel,
} from '../utils/april.js'
import TextInput from './TextInput.js'

type Props = {
  onDone: () => void
}

type FieldKey = 'apiFormat' | 'apiKey' | 'baseUrl' | 'model'

type FieldDefinition = {
  key: FieldKey
  label: string
  placeholder: string
  description: string
  mask?: string
}

function getFields(): FieldDefinition[] {
  return [
    {
      key: 'apiFormat',
      label: getUiText('apiTypeLabel'),
      placeholder: getUiText('apiTypePlaceholder'),
      description: getUiText('apiTypeDescription'),
    },
    {
      key: 'apiKey',
      label: getUiText('apiKeyLabel'),
      placeholder: getUiText('apiKeyPlaceholder'),
      description: getUiText('apiKeyDescription'),
      mask: '*',
    },
    {
      key: 'baseUrl',
      label: getUiText('baseUrlFieldLabel'),
      placeholder: getUiText('baseUrlPlaceholder'),
      description: getUiText('baseUrlDescription'),
    },
    {
      key: 'model',
      label: getUiText('modelLabel'),
      placeholder: getUiText('modelPlaceholder'),
      description: getUiText('modelDescription'),
    },
  ]
}

function findInitialFieldIndex(
  values: Record<FieldKey, string>,
  fields: FieldDefinition[],
): number {
  const firstEmpty = fields.findIndex(field => !values[field.key].trim())
  return firstEmpty === -1 ? 0 : firstEmpty
}

function maskValue(field: FieldDefinition, value: string): string {
  if (!value) {
    return getUiText('notSet')
  }
  if (field.key === 'apiFormat') {
    return value
  }
  if (!field.mask) {
    return value
  }
  if (value.length <= 8) {
    return '*'.repeat(value.length)
  }
  return `${value.slice(0, 4)}${'*'.repeat(Math.max(0, value.length - 8))}${value.slice(-4)}`
}

export function AprilApiConfigSetup({ onDone }: Props): React.ReactNode {
  const fields = getFields()
  const existing = useMemo(() => getAprilApiConfig(), [])
  const initialValues: Record<FieldKey, string> = {
    apiFormat: existing.apiFormat,
    apiKey: existing.apiKey ?? '',
    baseUrl: existing.baseUrl ?? '',
    model: existing.model ?? '',
  }
  const [values, setValues] = useState<Record<FieldKey, string>>(initialValues)
  const [fieldIndex, setFieldIndex] = useState(() =>
    findInitialFieldIndex(initialValues, fields),
  )
  const [cursorOffset, setCursorOffset] = useState(
    () => values[fields[findInitialFieldIndex(initialValues, fields)]?.key ?? 'apiKey'].length,
  )
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const currentField = fields[fieldIndex] ?? fields[0]

  const handleChange = (value: string): void => {
    setValues(current => ({
      ...current,
      [currentField.key]: value,
    }))
    setCursorOffset(value.length)
    if (error) {
      setError(null)
    }
  }

  const handleSubmit = async (rawValue: string): Promise<void> => {
    const nextValues = {
      ...values,
      [currentField.key]: rawValue.trim(),
    }

    let validationError: string | null = null
    switch (currentField.key) {
      case 'apiFormat':
        validationError = validateAprilApiFormat(nextValues.apiFormat)
        break
      case 'apiKey':
        validationError = validateAprilApiKey(nextValues.apiKey)
        break
      case 'baseUrl':
        validationError = validateAprilBaseUrl(nextValues.baseUrl)
        break
      case 'model':
        validationError = validateAprilModel(nextValues.model)
        break
    }

    if (validationError) {
      setValues(nextValues)
      setCursorOffset(nextValues[currentField.key].length)
      setError(validationError)
      return
    }

    setValues(nextValues)
    setError(null)

    if (fieldIndex < fields.length - 1) {
      const nextField = fields[fieldIndex + 1]
      setFieldIndex(fieldIndex + 1)
      setCursorOffset(nextValues[nextField.key].length)
      return
    }

    setIsSaving(true)
    try {
      await saveAprilApiConfig({
        apiFormat: nextValues.apiFormat,
        apiKey: nextValues.apiKey,
        baseUrl: nextValues.baseUrl,
        model: nextValues.model,
      })
      onDone()
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : String(saveError))
      setIsSaving(false)
    }
  }

  return (
    <Box flexDirection="column" gap={1} paddingLeft={1} width={76}>
      <Text dimColor>{getUiText('apiSetupSummary')}</Text>
      <Box flexDirection="column">
        {fields.map((field, index) => (
          <Text key={field.key} dimColor={index !== fieldIndex}>
            {index + 1}. {field.label}: {maskValue(field, values[field.key])}
          </Text>
        ))}
      </Box>
      <Text bold>
        {fieldIndex + 1}/{fields.length} {currentField.label}
      </Text>
      <Text dimColor>{currentField.description}</Text>
      {isSaving ? (
        <Text>{getUiText('savingConfig')}</Text>
      ) : (
        <TextInput
          value={values[currentField.key]}
          onChange={handleChange}
          onSubmit={value => {
            void handleSubmit(value)
          }}
          placeholder={currentField.placeholder}
          columns={72}
          cursorOffset={cursorOffset}
          onChangeCursorOffset={setCursorOffset}
          focus
          showCursor
          mask={currentField.mask}
        />
      )}
      {error ? <Text color="error">{error}</Text> : null}
      <Text dimColor>{getUiText('setupContinueCancel')}</Text>
    </Box>
  )
}
