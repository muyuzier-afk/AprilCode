/* eslint-disable custom-rules/no-process-exit -- CLI subcommand handlers intentionally exit */

import { cwd } from 'process'
import React from 'react'
import { useManagePlugins } from '../../hooks/useManagePlugins.js'
import type { Root } from '../../ink.js'
import { KeybindingSetup } from '../../keybindings/KeybindingProviderSetup.js'
import { logEvent } from '../../services/analytics/index.js'
import { MCPConnectionManager } from '../../services/mcp/MCPConnectionManager.js'
import { AppStateProvider } from '../../state/AppState.js'
import { onChangeAppState } from '../../state/onChangeAppState.js'

export async function setupTokenHandler(root: Root): Promise<void> {
  root.unmount()
  process.stderr.write(
    'setup-token has been removed from April Code. Use /login for initial setup, or /provider to update API Type, Key, Base URL, and Model.\n',
  )
  process.exit(1)
}

const DoctorLazy = React.lazy(() =>
  import('../../screens/Doctor.js').then(module => ({ default: module.Doctor })),
)

function DoctorWithPlugins(props: { onDone: () => void }): React.ReactNode {
  useManagePlugins()

  return (
    <React.Suspense fallback={null}>
      <DoctorLazy onDone={props.onDone} />
    </React.Suspense>
  )
}

export async function doctorHandler(root: Root): Promise<void> {
  logEvent('tengu_doctor_command', {})

  await new Promise<void>(resolve => {
    root.render(
      <AppStateProvider>
        <KeybindingSetup>
          <MCPConnectionManager
            dynamicMcpConfig={undefined}
            isStrictMcpConfig={false}
          >
            <DoctorWithPlugins onDone={() => resolve()} />
          </MCPConnectionManager>
        </KeybindingSetup>
      </AppStateProvider>,
    )
  })

  root.unmount()
  process.exit(0)
}

export async function installHandler(
  target: string | undefined,
  options: { force?: boolean },
): Promise<void> {
  const { setup } = await import('../../setup.js')
  await setup(cwd(), 'default', false, false, undefined, false)

  const { install } = await import('../../commands/install.js')
  await new Promise<void>(resolve => {
    const args: string[] = []
    if (target) args.push(target)
    if (options.force) args.push('--force')

    void install.call(
      result => {
        resolve()
        process.exit(result.includes('failed') ? 1 : 0)
      },
      {},
      args,
    )
  })
}
