import type { AssistantMessage, UserMessage } from '../types/message.js'

export const FINGERPRINT_SALT = 'april-disabled'

export function extractFirstMessageText(
  messages: (UserMessage | AssistantMessage)[],
): string {
  const firstUserMessage = messages.find(msg => msg.type === 'user')
  if (!firstUserMessage) {
    return ''
  }

  const content = firstUserMessage.message.content
  if (typeof content === 'string') {
    return content
  }

  if (Array.isArray(content)) {
    const textBlock = content.find(block => block.type === 'text')
    if (textBlock && textBlock.type === 'text') {
      return textBlock.text
    }
  }

  return ''
}

export function computeFingerprint(
  _messageText: string,
  _version: string,
): string {
  return ''
}

export function computeFingerprintFromMessages(
  _messages: (UserMessage | AssistantMessage)[],
): string {
  return ''
}
