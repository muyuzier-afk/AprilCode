import * as React from 'react'
import { resetCostState } from '../../bootstrap/state.js'
import type { LocalJSXCommandContext } from '../../commands.js'
import { AprilApiConfigSetup } from '../../components/AprilApiConfigSetup.js'
import { ConfigurableShortcutHint } from '../../components/ConfigurableShortcutHint.js'
import { Dialog } from '../../components/design-system/Dialog.js'
import { getUiText } from '../../i18n/ui.js'
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
          onDone(getUiText('providerConfigurationSaved'))
          return
        }

        onDone(getUiText('providerConfigurationInterrupted'))
      }}
    />
  )
}

function ProviderDialog(props: {
  onDone: (success: boolean) => void
}): React.ReactNode {
  return (
    <Dialog
      title={getUiText('providerSettingsTitle')}
      onCancel={() => props.onDone(false)}
      color="permission"
      inputGuide={exitState =>
        exitState.pending ? (
          <Text>{getUiText('pressAgainToExit', { key: exitState.keyName })}</Text>
        ) : (
          <ConfigurableShortcutHint
            action="confirm:no"
            context="Confirmation"
            fallback="Esc"
            description={getUiText('cancelAction')}
          />
        )
      }
    >
      <AprilApiConfigSetup onDone={() => props.onDone(true)} />
    </Dialog>
  )
}
