import React, { useCallback, useMemo } from 'react'
import type { OptionWithDescription } from '../CustomSelect/select.js'
import { Select } from '../CustomSelect/select.js'
import { Dialog } from '../design-system/Dialog.js'
import { Box, Text } from '../../ink.js'
import type { AgentMemoryScope } from '../../tools/AgentTool/agentMemory.js'

type SnapshotAction = 'merge' | 'keep' | 'replace'

type Props = {
  agentType: string
  scope: AgentMemoryScope
  snapshotTimestamp: string
  onComplete: (action: SnapshotAction) => void
  onCancel: () => void
}

function formatScope(scope: AgentMemoryScope): string {
  switch (scope) {
    case 'user':
      return '用户级'
    case 'project':
      return '项目级'
    case 'local':
      return '本地级'
  }
}

export function SnapshotUpdateDialog({
  agentType,
  scope,
  snapshotTimestamp,
  onComplete,
  onCancel,
}: Props): React.ReactNode {
  const handleSelect = useCallback(
    (value: SnapshotAction): void => {
      onComplete(value)
    },
    [onComplete],
  )

  const options = useMemo<OptionWithDescription<SnapshotAction>[]>(
    () => [
      {
        label: 'Merge',
        description: '保留现有内容，并把快照内容合并进当前记忆。',
        value: 'merge',
      },
      {
        label: 'Keep current',
        description: '保持当前记忆不变，忽略这份快照。',
        value: 'keep',
      },
      {
        label: 'Replace',
        description: '用快照内容覆盖当前记忆。',
        value: 'replace',
      },
    ],
    [],
  )

  return (
    <Dialog
      title="检测到已保存的 Agent Memory 快照"
      subtitle={`Recovered placeholder dialog · ${formatScope(scope)} · ${agentType}`}
      onCancel={onCancel}
      color="permission"
    >
      <Box flexDirection="column">
        <Text>
          已发现 {agentType} 的记忆快照，时间：{snapshotTimestamp}
        </Text>
        <Text dimColor>
          当前恢复版缺少原始对话框源码，这里提供最小可交互 fallback，
          防止流程卡死。
        </Text>
        <Box marginTop={1}>
          <Select
            options={options}
            onChange={handleSelect}
            onCancel={onCancel}
            defaultValue="keep"
          />
        </Box>
      </Box>
    </Dialog>
  )
}
