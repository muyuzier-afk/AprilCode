import React, { useMemo, useState } from 'react'
import { Box, Text } from '../ink.js'
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

const FIELDS: FieldDefinition[] = [
  {
    key: 'apiFormat',
    label: 'API Type',
    placeholder: 'anthropic / openai-responses / openai-chat',
    description:
      '可选 anthropic、openai-responses、openai-chat（三选一）。',
  },
  {
    key: 'apiKey',
    label: 'API Key',
    placeholder: 'sk-...',
    description: '输入所选 API 的密钥。',
    mask: '*',
  },
  {
    key: 'baseUrl',
    label: 'Base URL',
    placeholder: 'https://example.com/v1',
    description:
      '输入 API 基础地址。OpenAI Like 通常是 https://example.com/v1，Anthropic 可用 https://api.anthropic.com 。',
  },
  {
    key: 'model',
    label: 'Model',
    placeholder: 'claude-sonnet-4-5 / gpt-4.1 / qwen-max',
    description: '输入默认模型名称。',
  },
]

function findInitialFieldIndex(values: Record<FieldKey, string>): number {
  const firstEmpty = FIELDS.findIndex(field => !values[field.key].trim())
  return firstEmpty === -1 ? 0 : firstEmpty
}

function maskValue(field: FieldDefinition, value: string): string {
  if (!value) {
    return '未设置'
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
  const existing = useMemo(() => getAprilApiConfig(), [])
  const [values, setValues] = useState<Record<FieldKey, string>>({
    apiFormat: existing.apiFormat,
    apiKey: existing.apiKey ?? '',
    baseUrl: existing.baseUrl ?? '',
    model: existing.model ?? '',
  })
  const [fieldIndex, setFieldIndex] = useState(() =>
    findInitialFieldIndex({
      apiFormat: existing.apiFormat,
      apiKey: existing.apiKey ?? '',
      baseUrl: existing.baseUrl ?? '',
      model: existing.model ?? '',
    }),
  )
  const [cursorOffset, setCursorOffset] = useState(
    () => values[FIELDS[findInitialFieldIndex(values)]?.key ?? 'apiKey'].length,
  )
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const currentField = FIELDS[fieldIndex] ?? FIELDS[0]

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

    if (fieldIndex < FIELDS.length - 1) {
      const nextField = FIELDS[fieldIndex + 1]
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
      <Text dimColor>
        April Code 使用固定的 API Type / Key / URL / Model 配置，OAuth 已禁用，关键值会加密存储。后续可用 /provider 修改。
      </Text>
      <Box flexDirection="column">
        {FIELDS.map((field, index) => (
          <Text key={field.key} dimColor={index !== fieldIndex}>
            {index + 1}. {field.label}: {maskValue(field, values[field.key])}
          </Text>
        ))}
      </Box>
      <Text bold>
        {fieldIndex + 1}/{FIELDS.length} {currentField.label}
      </Text>
      <Text dimColor>{currentField.description}</Text>
      {isSaving ? (
        <Text>正在保存配置...</Text>
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
      <Text dimColor>Enter 继续，Esc 取消。</Text>
    </Box>
  )
}
