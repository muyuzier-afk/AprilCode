import React, { useCallback, useEffect, useState } from 'react'
import { setupTerminal, shouldOfferTerminalSetup } from '../commands/terminalSetup/terminalSetup.js'
import { useExitOnCtrlCDWithKeybindings } from '../hooks/useExitOnCtrlCDWithKeybindings.js'
import { Box, Newline, Text, useTheme } from '../ink.js'
import { getStoredUiLanguage, getUiText, getUiLanguage, setUiLanguage } from '../i18n/ui.js'
import { useKeybindings } from '../keybindings/useKeybinding.js'
import { env } from '../utils/env.js'
import type { ThemeSetting } from '../utils/theme.js'
import { hasAprilApiConfig } from '../utils/april.js'
import { AprilApiConfigSetup } from './AprilApiConfigSetup.js'
import { Select } from './CustomSelect/select.js'
import { WelcomeV2 } from './LogoV2/WelcomeV2.js'
import { PressEnterToContinue } from './PressEnterToContinue.js'
import { ThemePicker } from './ThemePicker.js'
import { UiLanguageSetup } from './UiLanguageSetup.js'
import { OrderedList } from './ui/OrderedList.js'

type StepId = 'ui-language' | 'theme' | 'api-config' | 'security' | 'terminal-setup'

type OnboardingStep = {
  id: StepId
  component: React.ReactNode
}

type Props = {
  onDone(): void
}

export function Onboarding({ onDone }: Props): React.ReactNode {
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [uiLanguage, setUiLanguageState] = useState(() => getUiLanguage())
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
        helpText={getUiText('themeHelpText')}
        hideEscToCancel
        skipExitHandling
      />
    </Box>
  )

  const apiConfigStep = <AprilApiConfigSetup onDone={goToNextStep} />

  const securityStep = (
    <Box flexDirection="column" gap={1} paddingLeft={1}>
      <Text bold>{getUiText('securityTitle')}</Text>
      <Box flexDirection="column" width={70}>
        <OrderedList>
          <OrderedList.Item>
            <Text>{getUiText('securityItem1Title')}</Text>
            <Text dimColor wrap="wrap">
              {getUiText('securityItem1Body')}
              <Newline />
            </Text>
          </OrderedList.Item>
          <OrderedList.Item>
            <Text>{getUiText('securityItem2Title')}</Text>
            <Text dimColor wrap="wrap">
              {getUiText('securityItem2Body')}
            </Text>
          </OrderedList.Item>
          <OrderedList.Item>
            <Text>{getUiText('securityItem3Title')}</Text>
            <Text dimColor wrap="wrap">
              {getUiText('securityItem3Body').split('APRIL_TELEMETRY_ENABLED=1')[0]}
              <Text bold>APRIL_TELEMETRY_ENABLED=1</Text>
              {getUiText('securityItem3Body').split('APRIL_TELEMETRY_ENABLED=1')[1] ?? ''}
            </Text>
          </OrderedList.Item>
        </OrderedList>
      </Box>
      <PressEnterToContinue />
    </Box>
  )

  const steps: OnboardingStep[] = [
  ]

  if (!getStoredUiLanguage()) {
    steps.push({
      id: 'ui-language',
      component: (
        <UiLanguageSetup
          initialLanguage={uiLanguage}
          onDone={language => {
            setUiLanguage(language)
            setUiLanguageState(language)
            goToNextStep()
          }}
        />
      ),
    })
  }

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
          <Text bold>{getUiText('terminalSetupTitle')}</Text>
          <Box flexDirection="column" width={70} gap={1}>
            <Text>
              {getUiText('terminalSetupIntro')}
              <Newline />
              {env.terminal === 'Apple_Terminal'
                ? getUiText('terminalSetupAppleMode')
                : getUiText('terminalSetupOtherMode')}
            </Text>
            <Select
              options={[
                {
                  label: getUiText('terminalSetupYes'),
                  value: 'install',
                },
                {
                  label: getUiText('terminalSetupNo'),
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
                <>{getUiText('pressAgainToExit', { key: exitState.keyName })}</>
              ) : (
                <>{getUiText('enterToConfirmEscToSkip')}</>
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
            <Text dimColor>
              {getUiText('pressAgainToExit', { key: exitState.keyName })}
            </Text>
          </Box>
        ) : null}
      </Box>
    </Box>
  )
}
