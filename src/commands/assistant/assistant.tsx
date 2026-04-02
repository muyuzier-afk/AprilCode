import { join } from 'path'
import React, { useCallback, useMemo } from 'react'
import type { OptionWithDescription } from '../../components/CustomSelect/select.js'
import { Select } from '../../components/CustomSelect/select.js'
import { Dialog } from '../../components/design-system/Dialog.js'
import { Box, Text } from '../../ink.js'

type WizardSelection = 'cancel' | 'report-missing-installer'

type NewInstallWizardProps = {
  defaultDir: string
  onInstalled: (dir: string) => void
  onCancel: () => void
  onError: (message: string) => void
}

export async function computeDefaultInstallDir(): Promise<string> {
  return join(process.cwd(), '.claude', 'assistant-placeholder')
}

export function NewInstallWizard({
  defaultDir,
  onCancel,
  onError,
}: NewInstallWizardProps): React.ReactNode {
  const handleSelect = useCallback(
    (value: WizardSelection): void => {
      if (value === 'cancel') {
        onCancel()
        return
      }

      onError(
        `Recovered build 未还原 assistant 安装器实现，默认目标目录仅供参考：${defaultDir}`,
      )
    },
    [defaultDir, onCancel, onError],
  )

  const options = useMemo<OptionWithDescription<WizardSelection>[]>(
    () => [
      {
        label: 'Close',
        description: '关闭向导，不执行任何安装动作。',
        value: 'cancel',
      },
      {
        label: 'Report missing installer',
        description: '返回一个明确错误，而不是让流程空白卡住。',
        value: 'report-missing-installer',
      },
    ],
    [],
  )

  return (
    <Dialog
      title="Assistant installer 不可用"
      subtitle="Recovered placeholder wizard"
      onCancel={onCancel}
      color="permission"
    >
      <Box flexDirection="column">
        <Text>
          当前恢复版缺少原始 assistant 安装器源码，因此这里只提供最小 fallback，
          用来避免空白 UI 或 Promise 卡死。
        </Text>
        <Text>默认目标目录：{defaultDir}</Text>
        <Text dimColor>
          注意：这里不会执行真实安装，也不会启动 daemon。
        </Text>
        <Box marginTop={1}>
          <Select
            options={options}
            onChange={handleSelect}
            onCancel={onCancel}
            defaultValue="cancel"
          />
        </Box>
      </Box>
    </Dialog>
  )
}
