import React, { useCallback, useEffect, useState } from 'react'
import { setupTerminal, shouldOfferTerminalSetup } from '../commands/terminalSetup/terminalSetup.js'
import { useExitOnCtrlCDWithKeybindings } from '../hooks/useExitOnCtrlCDWithKeybindings.js'
import { Box, Link, Newline, Text, useTheme } from '../ink.js'
import { useKeybindings } from '../keybindings/useKeybinding.js'
import { env } from '../utils/env.js'
import type { ThemeSetting } from '../utils/theme.js'
import { hasAprilApiConfig } from '../utils/april.js'
import { AprilApiConfigSetup } from './AprilApiConfigSetup.js'
import { Select } from './CustomSelect/select.js'
import { WelcomeV2 } from './LogoV2/WelcomeV2.js'
import { PressEnterToContinue } from './PressEnterToContinue.js'
import { ThemePicker } from './ThemePicker.js'
import { OrderedList } from './ui/OrderedList.js'

type StepId = 'theme' | 'api-config' | 'security' | 'terminal-setup'

type OnboardingStep = {
  id: StepId
  component: React.ReactNode
}

type Props = {
  onDone(): void
}

export function Onboarding({ onDone }: Props): React.ReactNode {
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [theme, setTheme] = useTheme()
  const exitState = useExitOnCtrlCDWithKeybindings()

  const goToNextStep = useCallback(() => {
    setCurrentStepIndex(index => index + 1)
  }, [])

  const handleThemeSelection = useCallback(
    (newTheme: ThemeSetting) => {
      setTheme(newTheme)
      goToNextStep()
    },
    [goToNextStep, setTheme],
  )

  const themeStep = (
    <Box marginX={1}>
      <ThemePicker
        onThemeSelect={handleThemeSelection}
        showIntroText
        helpText="To change this later, run /theme"
        hideEscToCancel
        skipExitHandling
      />
    </Box>
  )

  const apiConfigStep = <AprilApiConfigSetup onDone={goToNextStep} />

  const securityStep = (
    <Box flexDirection="column" gap={1} paddingLeft={1}>
      <Text bold>Security notes:</Text>
      <Box flexDirection="column" width={70}>
        <OrderedList>
          <OrderedList.Item>
            <Text>April Code can make mistakes</Text>
            <Text dimColor wrap="wrap">
              You should always review model output, especially before
              <Newline />
              executing code or applying file edits.
              <Newline />
            </Text>
          </OrderedList.Item>
          <OrderedList.Item>
            <Text>Only use it with repositories and prompts you trust</Text>
            <Text dimColor wrap="wrap">
              Prompt injection and hostile tool output are still risks.
              <Newline />
              Review generated commands before running them.
            </Text>
          </OrderedList.Item>
          <OrderedList.Item>
            <Text>Telemetry is disabled by default</Text>
            <Text dimColor wrap="wrap">
              Set <Text bold>APRIL_TELEMETRY_ENABLED=1</Text> only if you later add
              your own telemetry pipeline.
            </Text>
          </OrderedList.Item>
        </OrderedList>
      </Box>
      <PressEnterToContinue />
    </Box>
  )

  const steps: OnboardingStep[] = [
  ]

  if (!hasAprilApiConfig()) {
    steps.push({
      id: 'api-config',
      component: apiConfigStep,
    })
  }

  steps.push({
    id: 'theme',
    component: themeStep,
  })

  steps.push({
    id: 'security',
    component: securityStep,
  })

  if (shouldOfferTerminalSetup()) {
    steps.push({
      id: 'terminal-setup',
      component: (
        <Box flexDirection="column" gap={1} paddingLeft={1}>
          <Text bold>Use April Code's terminal setup?</Text>
          <Box flexDirection="column" width={70} gap={1}>
            <Text>
              For the optimal coding experience, enable the recommended settings
              <Newline />
              for your terminal:{' '}
              {env.terminal === 'Apple_Terminal'
                ? 'Option+Enter for newlines and visual bell'
                : 'Shift+Enter for newlines'}
            </Text>
            <Select
              options={[
                {
                  label: 'Yes, use recommended settings',
                  value: 'install',
                },
                {
                  label: 'No, maybe later with /terminal-setup',
                  value: 'no',
                },
              ]}
              onChange={value => {
                if (value === 'install') {
                  void setupTerminal(theme).catch(() => {}).finally(goToNextStep)
                } else {
                  goToNextStep()
                }
              }}
              onCancel={goToNextStep}
            />
            <Text dimColor>
              {exitState.pending ? (
                <>Press {exitState.keyName} again to exit</>
              ) : (
                <>Enter to confirm · Esc to skip</>
              )}
            </Text>
          </Box>
        </Box>
      ),
    })
  }

  const currentStep = steps[currentStepIndex]

  const handleSecurityContinue = useCallback(() => {
    if (currentStepIndex === steps.length - 1) {
      onDone()
      return
    }
    goToNextStep()
  }, [currentStepIndex, goToNextStep, onDone, steps.length])

  const handleTerminalSetupSkip = useCallback(() => {
    goToNextStep()
  }, [goToNextStep])

  useKeybindings(
    {
      'confirm:yes': handleSecurityContinue,
    },
    {
      context: 'Confirmation',
      isActive: currentStep?.id === 'security',
    },
  )

  useKeybindings(
    {
      'confirm:no': handleTerminalSetupSkip,
    },
    {
      context: 'Confirmation',
      isActive: currentStep?.id === 'terminal-setup',
    },
  )

  useEffect(() => {
    if (!currentStep) {
      onDone()
    }
  }, [currentStep, onDone])

  if (!currentStep) {
    return null
  }

  return (
    <Box flexDirection="column">
      <WelcomeV2 />
      <Box flexDirection="column" marginTop={1}>
        {currentStep.component}
        {exitState.pending ? (
          <Box padding={1}>
            <Text dimColor>Press {exitState.keyName} again to exit</Text>
          </Box>
        ) : null}
      </Box>
    </Box>
  )
}
