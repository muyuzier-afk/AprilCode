import * as React from 'react'
import { resetCostState } from '../../bootstrap/state.js'
import type { LocalJSXCommandContext } from '../../commands.js'
import { AprilApiConfigSetup } from '../../components/AprilApiConfigSetup.js'
import { ConfigurableShortcutHint } from '../../components/ConfigurableShortcutHint.js'
import { Dialog } from '../../components/design-system/Dialog.js'
import { Text } from '../../ink.js'
import type { LocalJSXCommandOnDone } from '../../types/command.js'
import { stripSignatureBlocks } from '../../utils/messages.js'

export async function call(
  onDone: LocalJSXCommandOnDone,
  context: LocalJSXCommandContext,
): Promise<React.ReactNode> {
  return (
    <ProviderDialog
      onDone={success => {
        context.onChangeAPIKey()
        context.setMessages(stripSignatureBlocks)

        if (success) {
          resetCostState()
          context.setAppState(prev => ({
            ...prev,
            authVersion: prev.authVersion + 1,
          }))
          onDone('Provider configuration saved')
          return
        }

        onDone('Provider configuration interrupted')
      }}
    />
  )
}

function ProviderDialog(props: {
  onDone: (success: boolean) => void
}): React.ReactNode {
  return (
    <Dialog
      title="Provider Settings"
      onCancel={() => props.onDone(false)}
      color="permission"
      inputGuide={exitState =>
        exitState.pending ? (
          <Text>Press {exitState.keyName} again to exit</Text>
        ) : (
          <ConfigurableShortcutHint
            action="confirm:no"
            context="Confirmation"
            fallback="Esc"
            description="cancel"
          />
        )
      }
    >
      <AprilApiConfigSetup onDone={() => props.onDone(true)} />
    </Dialog>
  )
}
