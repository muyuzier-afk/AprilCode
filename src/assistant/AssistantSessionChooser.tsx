import React, { useCallback, useMemo } from 'react'
import type { OptionWithDescription } from '../components/CustomSelect/select.js'
import { Select } from '../components/CustomSelect/select.js'
import { Dialog } from '../components/design-system/Dialog.js'
import { Box, Text } from '../ink.js'
import type { AssistantSession } from './sessionDiscovery.js'

type Props = {
  sessions: AssistantSession[]
  onSelect: (sessionId: string) => void
  onCancel: () => void
}

function getSessionLabel(session: AssistantSession, index: number): string {
  return (
    session.title ??
    session.name ??
    session.label ??
    session.projectName ??
    `Session ${index + 1}`
  )
}

function getSessionDescription(session: AssistantSession): string | undefined {
  const parts = [
    session.id ? `id=${session.id}` : undefined,
    session.status ? `status=${session.status}` : undefined,
    session.updatedAt ? `updated=${session.updatedAt}` : undefined,
    session.repo ? `repo=${session.repo}` : undefined,
    session.description,
  ].filter(Boolean)

  return parts.length > 0 ? parts.join(' · ') : undefined
}

export function AssistantSessionChooser({
  sessions,
  onSelect,
  onCancel,
}: Props): React.ReactNode {
  const handleSelect = useCallback(
    (sessionId: string): void => {
      onSelect(sessionId)
    },
    [onSelect],
  )

  const options = useMemo<OptionWithDescription<string>[]>(
    () =>
      sessions.map((session, index) => ({
        label: getSessionLabel(session, index),
        description: getSessionDescription(session),
        value: session.id,
      })),
    [sessions],
  )

  return (
    <Dialog
      title="选择 Assistant 会话"
      subtitle="Recovered placeholder chooser · 仅保留最小选择流程"
      onCancel={onCancel}
      color="permission"
    >
      <Box flexDirection="column">
        <Text>
          发现多个 Assistant 会话。请选择一个要附着的 session。
        </Text>
        <Text dimColor>
          当前恢复版没有还原原始 chooser 组件，这里只保留最小可用选择逻辑。
        </Text>
        <Box marginTop={1}>
          <Select options={options} onChange={handleSelect} onCancel={onCancel} />
        </Box>
      </Box>
    </Dialog>
  )
}
