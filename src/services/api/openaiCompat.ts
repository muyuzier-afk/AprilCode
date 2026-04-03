import type Anthropic from '@anthropic-ai/sdk'
import type { ClientOptions } from '@anthropic-ai/sdk'
import type {
  BetaContentBlock,
  BetaMessage,
  BetaMessageStreamParams,
  BetaRawMessageStreamEvent,
  BetaToolUnion,
  BetaUsage,
} from '@anthropic-ai/sdk/resources/beta/messages/messages.mjs'
import { randomUUID } from 'crypto'
import {
  getAprilApiFormat,
  isOpenAIResponsesApiFormat,
  type AprilApiFormat,
} from '../../utils/april.js'
import { logForDebugging } from '../../utils/debug.js'
import { getProxyFetchOptions } from '../../utils/proxy.js'

type FetchLike = NonNullable<ClientOptions['fetch']>

type OpenAICompatClientOptions = {
  baseUrl: string
  defaultHeaders: Record<string, string>
  fetch: FetchLike
  source?: string
}

type RequestOptions = {
  signal?: AbortSignal
  timeout?: number
  headers?: Record<string, string>
}

type OpenAIChatMessage =
  | {
      role: 'system' | 'user'
      content: string | Array<Record<string, unknown>>
    }
  | {
      role: 'assistant'
      content?: string | Array<Record<string, unknown>> | null
      tool_calls?: Array<{
        id: string
        type: 'function'
        function: {
          name: string
          arguments: string
        }
      }>
    }
  | {
      role: 'tool'
      tool_call_id: string
      content: string
    }

type OpenAIResponseInputItem =
  | {
      role: 'user'
      content: Array<Record<string, unknown>>
    }
  | {
      type: 'message'
      role: 'assistant'
      content: Array<Record<string, unknown>>
    }
  | {
      type: 'function_call'
      call_id: string
      name: string
      arguments: string
    }
  | {
      type: 'function_call_output'
      call_id: string
      output: string
    }

type OpenAICompatCreateResult = Promise<BetaMessage> | OpenAICompatStreamRequest

type OpenAICompatStreamRequest = {
  withResponse(): Promise<{
    data: AsyncIterable<BetaRawMessageStreamEvent> & {
      controller: AbortController
    }
    request_id?: string
    response: Response
  }>
}

type UsageLike = {
  input_tokens?: number
  output_tokens?: number
  prompt_tokens?: number
  completion_tokens?: number
}

function joinSystemText(
  system: BetaMessageStreamParams['system'],
): string | undefined {
  if (!system) {
    return undefined
  }
  if (typeof system === 'string') {
    return system
  }

  const parts = system
    .map(block => {
      if (
        block &&
        typeof block === 'object' &&
        'type' in block &&
        block.type === 'text' &&
        'text' in block &&
        typeof block.text === 'string'
      ) {
        return block.text
      }
      return ''
    })
    .filter(Boolean)

  return parts.length > 0 ? parts.join('\n\n') : undefined
}

function serializeUnknown(value: unknown): string {
  if (typeof value === 'string') {
    return value
  }
  if (value === undefined) {
    return ''
  }
  try {
    return JSON.stringify(value)
  } catch {
    return String(value)
  }
}

function parseJSONValue(value: string): unknown {
  if (!value.trim()) {
    return {}
  }
  try {
    return JSON.parse(value)
  } catch {
    return {}
  }
}

function encodeDataUrl(source: Record<string, unknown>): string | null {
  const mediaType =
    typeof source.media_type === 'string'
      ? source.media_type
      : typeof source.mime_type === 'string'
        ? source.mime_type
        : null
  const data = typeof source.data === 'string' ? source.data : null
  if (!mediaType || !data) {
    return null
  }
  return `data:${mediaType};base64,${data}`
}

function anthropicUserBlocksToChatMessages(
  content: unknown,
  out: OpenAIChatMessage[],
): void {
  if (typeof content === 'string') {
    out.push({ role: 'user', content })
    return
  }

  if (!Array.isArray(content)) {
    return
  }

  let pending: Array<Record<string, unknown>> = []
  const flushPending = (): void => {
    if (pending.length === 0) {
      return
    }
    const nextContent =
      pending.length === 1 && pending[0]?.type === 'text'
        ? (pending[0].text as string)
        : pending
    out.push({ role: 'user', content: nextContent })
    pending = []
  }

  for (const block of content) {
    if (!block || typeof block !== 'object' || !('type' in block)) {
      continue
    }

    switch (block.type) {
      case 'text':
        if (typeof block.text === 'string') {
          pending.push({ type: 'text', text: block.text })
        }
        break
      case 'image': {
        const source =
          'source' in block && block.source && typeof block.source === 'object'
            ? (block.source as Record<string, unknown>)
            : null
        const url = source ? encodeDataUrl(source) : null
        if (url) {
          pending.push({
            type: 'image_url',
            image_url: { url },
          })
        }
        break
      }
      case 'document': {
        const name =
          'title' in block && typeof block.title === 'string'
            ? block.title
            : 'document'
        pending.push({
          type: 'text',
          text: `[Document omitted in OpenAI compatibility mode: ${name}]`,
        })
        break
      }
      case 'tool_result':
        flushPending()
        if (
          'tool_use_id' in block &&
          typeof block.tool_use_id === 'string'
        ) {
          out.push({
            role: 'tool',
            tool_call_id: block.tool_use_id,
            content: serializeUnknown(
              'content' in block ? block.content : undefined,
            ),
          })
        }
        break
      default:
        if ('text' in block && typeof block.text === 'string') {
          pending.push({ type: 'text', text: block.text })
        }
        break
    }
  }

  flushPending()
}

function anthropicAssistantBlocksToChatMessages(
  content: unknown,
  out: OpenAIChatMessage[],
): void {
  if (typeof content === 'string') {
    out.push({ role: 'assistant', content })
    return
  }

  if (!Array.isArray(content)) {
    return
  }

  const textParts: string[] = []
  const toolCalls: NonNullable<
    Extract<OpenAIChatMessage, { role: 'assistant' }>['tool_calls']
  > = []

  for (const block of content) {
    if (!block || typeof block !== 'object' || !('type' in block)) {
      continue
    }

    switch (block.type) {
      case 'text':
        if (typeof block.text === 'string' && block.text.length > 0) {
          textParts.push(block.text)
        }
        break
      case 'tool_use':
        toolCalls.push({
          id:
            'id' in block && typeof block.id === 'string'
              ? block.id
              : randomUUID(),
          type: 'function',
          function: {
            name:
              'name' in block && typeof block.name === 'string'
                ? block.name
                : 'tool',
            arguments: serializeUnknown('input' in block ? block.input : {}),
          },
        })
        break
      default:
        break
    }
  }

  if (textParts.length === 0 && toolCalls.length === 0) {
    return
  }

  out.push({
    role: 'assistant',
    content: textParts.length > 0 ? textParts.join('\n') : null,
    ...(toolCalls.length > 0 && { tool_calls: toolCalls }),
  })
}

function anthropicMessagesToChatCompletions(
  params: BetaMessageStreamParams,
): OpenAIChatMessage[] {
  const messages: OpenAIChatMessage[] = []
  const system = joinSystemText(params.system)
  if (system) {
    messages.push({ role: 'system', content: system })
  }

  for (const message of params.messages) {
    if (message.role === 'user') {
      anthropicUserBlocksToChatMessages(message.content, messages)
      continue
    }
    if (message.role === 'assistant') {
      anthropicAssistantBlocksToChatMessages(message.content, messages)
    }
  }

  return messages
}

function anthropicMessagesToResponsesInput(
  params: BetaMessageStreamParams,
): OpenAIResponseInputItem[] {
  const items: OpenAIResponseInputItem[] = []

  for (const message of params.messages) {
    if (message.role === 'user') {
      if (typeof message.content === 'string') {
        items.push({
          role: 'user',
          content: [{ type: 'input_text', text: message.content }],
        })
        continue
      }

      if (!Array.isArray(message.content)) {
        continue
      }

      let pending: Array<Record<string, unknown>> = []
      const flushPending = (): void => {
        if (pending.length === 0) {
          return
        }
        items.push({ role: 'user', content: pending })
        pending = []
      }

      for (const block of message.content) {
        if (!block || typeof block !== 'object' || !('type' in block)) {
          continue
        }

        switch (block.type) {
          case 'text':
            if (typeof block.text === 'string') {
              pending.push({ type: 'input_text', text: block.text })
            }
            break
          case 'image': {
            const source =
              'source' in block &&
              block.source &&
              typeof block.source === 'object'
                ? (block.source as Record<string, unknown>)
                : null
            const url = source ? encodeDataUrl(source) : null
            if (url) {
              pending.push({ type: 'input_image', image_url: url })
            }
            break
          }
          case 'document': {
            const name =
              'title' in block && typeof block.title === 'string'
                ? block.title
                : 'document'
            pending.push({
              type: 'input_text',
              text: `[Document omitted in OpenAI compatibility mode: ${name}]`,
            })
            break
          }
          case 'tool_result':
            flushPending()
            if (
              'tool_use_id' in block &&
              typeof block.tool_use_id === 'string'
            ) {
              items.push({
                type: 'function_call_output',
                call_id: block.tool_use_id,
                output: serializeUnknown(
                  'content' in block ? block.content : undefined,
                ),
              })
            }
            break
          default:
            break
        }
      }

      flushPending()
      continue
    }

    if (message.role === 'assistant') {
      if (typeof message.content === 'string') {
        items.push({
          type: 'message',
          role: 'assistant',
          content: [{ type: 'output_text', text: message.content }],
        })
        continue
      }

      if (!Array.isArray(message.content)) {
        continue
      }

      let pendingAssistantText: Array<Record<string, unknown>> = []
      const flushAssistantText = (): void => {
        if (pendingAssistantText.length === 0) {
          return
        }
        items.push({
          type: 'message',
          role: 'assistant',
          content: pendingAssistantText,
        })
        pendingAssistantText = []
      }

      for (const block of message.content) {
        if (!block || typeof block !== 'object' || !('type' in block)) {
          continue
        }

        switch (block.type) {
          case 'text':
            if (typeof block.text === 'string') {
              pendingAssistantText.push({
                type: 'output_text',
                text: block.text,
              })
            }
            break
          case 'tool_use':
            flushAssistantText()
            items.push({
              type: 'function_call',
              call_id:
                'id' in block && typeof block.id === 'string'
                  ? block.id
                  : randomUUID(),
              name:
                'name' in block && typeof block.name === 'string'
                  ? block.name
                  : 'tool',
              arguments: serializeUnknown('input' in block ? block.input : {}),
            })
            break
          default:
            break
        }
      }

      flushAssistantText()
    }
  }

  return items
}

function anthropicToolsToOpenAITools(
  tools: BetaToolUnion[] | undefined,
): Array<Record<string, unknown>> | undefined {
  if (!tools || tools.length === 0) {
    return undefined
  }

  const mapped = tools.flatMap(tool => {
    if (
      !tool ||
      typeof tool !== 'object' ||
      !('name' in tool) ||
      typeof tool.name !== 'string' ||
      !('input_schema' in tool)
    ) {
      return []
    }

    const inputSchema =
      tool.input_schema && typeof tool.input_schema === 'object'
        ? tool.input_schema
        : { type: 'object', properties: {} }

    return [
      {
        type: 'function',
        function: {
          name: tool.name,
          description:
            'description' in tool && typeof tool.description === 'string'
              ? tool.description
              : '',
          parameters: inputSchema,
          ...('strict' in tool && tool.strict === true ? { strict: true } : {}),
        },
      },
    ]
  })

  return mapped.length > 0 ? mapped : undefined
}

function mapToolChoiceForChat(
  toolChoice: BetaMessageStreamParams['tool_choice'],
): Record<string, unknown> | string | undefined {
  if (!toolChoice) {
    return undefined
  }
  if (toolChoice.type === 'tool' && toolChoice.name) {
    return {
      type: 'function',
      function: {
        name: toolChoice.name,
      },
    }
  }
  return 'auto'
}

function mapToolChoiceForResponses(
  toolChoice: BetaMessageStreamParams['tool_choice'],
): Record<string, unknown> | string | undefined {
  if (!toolChoice) {
    return undefined
  }
  if (toolChoice.type === 'tool' && toolChoice.name) {
    return {
      type: 'function',
      name: toolChoice.name,
    }
  }
  return 'auto'
}

function mapStructuredOutputForChat(
  params: BetaMessageStreamParams,
): Record<string, unknown> | undefined {
  const format =
    params.output_config &&
    typeof params.output_config === 'object' &&
    'format' in params.output_config
      ? (params.output_config.format as Record<string, unknown>)
      : null

  if (!format || format.type !== 'json_schema' || !format.schema) {
    return undefined
  }

  return {
    type: 'json_schema',
    json_schema: {
      name: 'structured_output',
      schema: format.schema,
      strict: true,
    },
  }
}

function mapStructuredOutputForResponses(
  params: BetaMessageStreamParams,
): Record<string, unknown> | undefined {
  const format =
    params.output_config &&
    typeof params.output_config === 'object' &&
    'format' in params.output_config
      ? (params.output_config.format as Record<string, unknown>)
      : null

  if (!format || format.type !== 'json_schema' || !format.schema) {
    return undefined
  }

  return {
    format: {
      type: 'json_schema',
      name: 'structured_output',
      schema: format.schema,
      strict: true,
    },
  }
}

function toBetaUsage(usage: UsageLike | undefined): BetaUsage {
  return {
    input_tokens: usage?.input_tokens ?? usage?.prompt_tokens ?? 0,
    cache_creation_input_tokens: 0,
    cache_read_input_tokens: 0,
    output_tokens: usage?.output_tokens ?? usage?.completion_tokens ?? 0,
    server_tool_use: {
      web_search_requests: 0,
      web_fetch_requests: 0,
    },
    cache_creation: {
      ephemeral_1h_input_tokens: 0,
      ephemeral_5m_input_tokens: 0,
    },
  } as BetaUsage
}

function betaMessageBase(args: {
  id?: string
  model?: string
  usage?: UsageLike
  content: BetaContentBlock[]
  stopReason: BetaMessage['stop_reason']
  requestId?: string
}): BetaMessage {
  const message = {
    id: args.id || randomUUID(),
    type: 'message',
    role: 'assistant',
    content: args.content,
    model: args.model || 'unknown',
    stop_reason: args.stopReason,
    stop_sequence: null,
    usage: toBetaUsage(args.usage),
  } as BetaMessage & { _request_id?: string | null }

  if (args.requestId) {
    message._request_id = args.requestId
  }

  return message
}

function chatResponseToBetaMessage(
  data: Record<string, unknown>,
  model: string,
  requestId?: string,
): BetaMessage {
  const choices = Array.isArray(data.choices) ? data.choices : []
  const choice =
    choices[0] && typeof choices[0] === 'object'
      ? (choices[0] as Record<string, unknown>)
      : {}
  const message =
    choice.message && typeof choice.message === 'object'
      ? (choice.message as Record<string, unknown>)
      : {}
  const content: BetaContentBlock[] = []

  const textParts: string[] = []
  if (typeof message.content === 'string' && message.content.length > 0) {
    textParts.push(message.content)
  } else if (Array.isArray(message.content)) {
    for (const part of message.content) {
      if (!part || typeof part !== 'object') {
        continue
      }
      if ('text' in part && typeof part.text === 'string') {
        textParts.push(part.text)
        continue
      }
      if ('refusal' in part && typeof part.refusal === 'string') {
        textParts.push(part.refusal)
      }
    }
  }

  for (const text of textParts) {
    content.push({ type: 'text', text } as BetaContentBlock)
  }

  const toolCalls = Array.isArray(message.tool_calls) ? message.tool_calls : []
  for (const toolCall of toolCalls) {
    if (!toolCall || typeof toolCall !== 'object') {
      continue
    }
    const fn =
      'function' in toolCall && toolCall.function && typeof toolCall.function === 'object'
        ? (toolCall.function as Record<string, unknown>)
        : {}
    content.push({
      type: 'tool_use',
      id:
        'id' in toolCall && typeof toolCall.id === 'string'
          ? toolCall.id
          : randomUUID(),
      name:
        typeof fn.name === 'string' && fn.name.length > 0 ? fn.name : 'tool',
      input: parseJSONValue(
        typeof fn.arguments === 'string' ? fn.arguments : '{}',
      ),
    } as BetaContentBlock)
  }

  if (content.length === 0) {
    content.push({ type: 'text', text: '' } as BetaContentBlock)
  }

  const finishReason =
    typeof choice.finish_reason === 'string' ? choice.finish_reason : undefined
  const stopReason =
    toolCalls.length > 0
      ? 'tool_use'
      : finishReason === 'length'
        ? 'max_tokens'
        : 'end_turn'

  return betaMessageBase({
    id: typeof data.id === 'string' ? data.id : undefined,
    model: typeof data.model === 'string' ? data.model : model,
    usage:
      data.usage && typeof data.usage === 'object'
        ? (data.usage as UsageLike)
        : undefined,
    content,
    stopReason,
    requestId,
  })
}

function responsesOutputTextParts(item: Record<string, unknown>): string[] {
  const content = Array.isArray(item.content) ? item.content : []
  const textParts: string[] = []

  for (const part of content) {
    if (!part || typeof part !== 'object' || !('type' in part)) {
      continue
    }
    if (
      (part.type === 'output_text' || part.type === 'text') &&
      'text' in part &&
      typeof part.text === 'string'
    ) {
      textParts.push(part.text)
      continue
    }
    if ('refusal' in part && typeof part.refusal === 'string') {
      textParts.push(part.refusal)
    }
  }

  return textParts
}

function responsesResponseToBetaMessage(
  data: Record<string, unknown>,
  model: string,
  requestId?: string,
): BetaMessage {
  const output = Array.isArray(data.output) ? data.output : []
  const content: BetaContentBlock[] = []

  for (const item of output) {
    if (!item || typeof item !== 'object' || !('type' in item)) {
      continue
    }

    if (item.type === 'message') {
      const textParts = responsesOutputTextParts(item)
      for (const text of textParts) {
        content.push({ type: 'text', text } as BetaContentBlock)
      }
      continue
    }

    if (item.type === 'function_call') {
      content.push({
        type: 'tool_use',
        id:
          'call_id' in item && typeof item.call_id === 'string'
            ? item.call_id
            : 'id' in item && typeof item.id === 'string'
              ? item.id
              : randomUUID(),
        name:
          'name' in item && typeof item.name === 'string'
            ? item.name
            : 'tool',
        input: parseJSONValue(
          'arguments' in item && typeof item.arguments === 'string'
            ? item.arguments
            : '{}',
        ),
      } as BetaContentBlock)
    }
  }

  if (content.length === 0) {
    content.push({ type: 'text', text: '' } as BetaContentBlock)
  }

  const stopReason = content.some(block => block.type === 'tool_use')
    ? 'tool_use'
    : data.status === 'incomplete' &&
        data.incomplete_details &&
        typeof data.incomplete_details === 'object' &&
        'reason' in data.incomplete_details &&
        data.incomplete_details.reason === 'max_output_tokens'
      ? 'max_tokens'
      : 'end_turn'

  return betaMessageBase({
    id: typeof data.id === 'string' ? data.id : undefined,
    model: model,
    usage:
      data.usage && typeof data.usage === 'object'
        ? (data.usage as UsageLike)
        : undefined,
    content,
    stopReason,
    requestId,
  })
}

function syntheticMessageStart(message: BetaMessage): BetaRawMessageStreamEvent {
  return {
    type: 'message_start',
    message: {
      ...message,
      content: [],
      stop_reason: null,
      usage: {
        ...message.usage,
        output_tokens: 0,
      },
    },
  } as BetaRawMessageStreamEvent
}

function createSyntheticEvents(
  message: BetaMessage,
): BetaRawMessageStreamEvent[] {
  const events: BetaRawMessageStreamEvent[] = [syntheticMessageStart(message)]

  message.content.forEach((block, index) => {
    if (block.type === 'text') {
      events.push({
        type: 'content_block_start',
        index,
        content_block: {
          type: 'text',
          text: '',
        },
      } as BetaRawMessageStreamEvent)
      if (block.text.length > 0) {
        events.push({
          type: 'content_block_delta',
          index,
          delta: {
            type: 'text_delta',
            text: block.text,
          },
        } as BetaRawMessageStreamEvent)
      }
      events.push({
        type: 'content_block_stop',
        index,
      } as BetaRawMessageStreamEvent)
      return
    }

    if (block.type === 'tool_use') {
      events.push({
        type: 'content_block_start',
        index,
        content_block: {
          type: 'tool_use',
          id: block.id,
          name: block.name,
          input: {},
        },
      } as BetaRawMessageStreamEvent)

      const serializedInput = serializeUnknown(block.input)
      if (serializedInput && serializedInput !== '{}') {
        events.push({
          type: 'content_block_delta',
          index,
          delta: {
            type: 'input_json_delta',
            partial_json: serializedInput,
          },
        } as BetaRawMessageStreamEvent)
      }

      events.push({
        type: 'content_block_stop',
        index,
      } as BetaRawMessageStreamEvent)
    }
  })

  events.push({
    type: 'message_delta',
    delta: {
      stop_reason: message.stop_reason,
      stop_sequence: null,
    },
    usage: message.usage,
  } as BetaRawMessageStreamEvent)
  events.push({
    type: 'message_stop',
  } as BetaRawMessageStreamEvent)

  return events
}

function createSyntheticStream(
  message: BetaMessage,
  upstreamSignal?: AbortSignal,
): AsyncIterable<BetaRawMessageStreamEvent> & { controller: AbortController } {
  const controller = new AbortController()

  if (upstreamSignal) {
    if (upstreamSignal.aborted) {
      controller.abort(upstreamSignal.reason)
    } else {
      upstreamSignal.addEventListener(
        'abort',
        () => {
          controller.abort(upstreamSignal.reason)
        },
        { once: true },
      )
    }
  }

  return {
    controller,
    async *[Symbol.asyncIterator]() {
      for (const event of createSyntheticEvents(message)) {
        if (controller.signal.aborted) {
          return
        }
        yield event
      }
    },
  }
}

function getRequestId(response: Response): string | undefined {
  return (
    response.headers.get('x-request-id') ||
    response.headers.get('request-id') ||
    response.headers.get('openai-request-id') ||
    undefined
  )
}

function endpointUrl(baseUrl: string, path: string): string {
  const trimmedBase = baseUrl.replace(/\/+$/, '')
  const trimmedPath = path.replace(/^\/+/, '')
  return `${trimmedBase}/${trimmedPath}`
}

function formatErrorMessage(
  status: number,
  payload: unknown,
  fallback: string,
): string {
  if (payload && typeof payload === 'object' && 'error' in payload) {
    const error = payload.error
    if (
      error &&
      typeof error === 'object' &&
      'message' in error &&
      typeof error.message === 'string'
    ) {
      return `${error.message} (HTTP ${status})`
    }
  }

  if (typeof payload === 'string' && payload.trim()) {
    return `${payload} (HTTP ${status})`
  }

  return `${fallback} (HTTP ${status})`
}

async function requestJSON(args: {
  url: string
  method?: 'GET' | 'POST'
  body?: Record<string, unknown>
  fetch: FetchLike
  defaultHeaders: Record<string, string>
  options?: RequestOptions
  source?: string
}): Promise<{ data: Record<string, unknown>; response: Response }> {
  const controller = new AbortController()
  const timeout = args.options?.timeout
  let timeoutHandle: ReturnType<typeof setTimeout> | undefined

  if (args.options?.signal) {
    if (args.options.signal.aborted) {
      controller.abort(args.options.signal.reason)
    } else {
      args.options.signal.addEventListener(
        'abort',
        () => {
          controller.abort(args.options?.signal?.reason)
        },
        { once: true },
      )
    }
  }

  if (timeout && timeout > 0) {
    timeoutHandle = setTimeout(() => {
      controller.abort(new Error(`OpenAI-compatible request timed out after ${timeout}ms`))
    }, timeout)
  }

  const headers = {
    'Content-Type': 'application/json',
    ...args.defaultHeaders,
    ...(args.options?.headers ?? {}),
  }

  try {
    logForDebugging(
      `[OpenAICompat] ${args.method ?? 'POST'} ${args.url} source=${args.source ?? 'unknown'}`,
    )

    const response = await args.fetch(args.url, {
      method: args.method ?? 'POST',
      headers,
      signal: controller.signal,
      ...(args.body ? { body: JSON.stringify(args.body) } : {}),
      ...getProxyFetchOptions(),
    })

    const rawText = await response.text()
    let parsed: unknown = {}
    if (rawText) {
      try {
        parsed = JSON.parse(rawText)
      } catch {
        parsed = rawText
      }
    }

    if (!response.ok) {
      throw new Error(
        formatErrorMessage(
          response.status,
          parsed,
          'OpenAI-compatible request failed',
        ),
      )
    }

    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      throw new Error('OpenAI-compatible API returned a non-object JSON payload')
    }

    return {
      data: parsed as Record<string, unknown>,
      response,
    }
  } finally {
    if (timeoutHandle) {
      clearTimeout(timeoutHandle)
    }
  }
}

function buildChatBody(params: BetaMessageStreamParams): Record<string, unknown> {
  const body: Record<string, unknown> = {
    model: params.model,
    messages: anthropicMessagesToChatCompletions(params),
  }

  const tools = anthropicToolsToOpenAITools(params.tools)
  if (tools) {
    body.tools = tools
  }

  const toolChoice = mapToolChoiceForChat(params.tool_choice)
  if (toolChoice) {
    body.tool_choice = toolChoice
  }

  if (typeof params.max_tokens === 'number') {
    body.max_tokens = params.max_tokens
  }
  if (typeof params.temperature === 'number') {
    body.temperature = params.temperature
  }
  if (Array.isArray(params.stop_sequences) && params.stop_sequences.length > 0) {
    body.stop = params.stop_sequences
  }

  const responseFormat = mapStructuredOutputForChat(params)
  if (responseFormat) {
    body.response_format = responseFormat
  }

  if (
    params.output_config &&
    typeof params.output_config === 'object' &&
    'effort' in params.output_config &&
    typeof params.output_config.effort === 'string'
  ) {
    body.reasoning_effort = params.output_config.effort
  }

  return body
}

function buildResponsesBody(
  params: BetaMessageStreamParams,
): Record<string, unknown> {
  const body: Record<string, unknown> = {
    model: params.model,
    input: anthropicMessagesToResponsesInput(params),
  }

  const instructions = joinSystemText(params.system)
  if (instructions) {
    body.instructions = instructions
  }

  const tools = anthropicToolsToOpenAITools(params.tools)
  if (tools) {
    body.tools = tools
  }

  const toolChoice = mapToolChoiceForResponses(params.tool_choice)
  if (toolChoice) {
    body.tool_choice = toolChoice
  }

  if (typeof params.max_tokens === 'number') {
    body.max_output_tokens = params.max_tokens
  }
  if (typeof params.temperature === 'number') {
    body.temperature = params.temperature
  }
  if (Array.isArray(params.stop_sequences) && params.stop_sequences.length > 0) {
    body.stop = params.stop_sequences
  }

  const text = mapStructuredOutputForResponses(params)
  if (text) {
    body.text = text
  }

  if (
    params.output_config &&
    typeof params.output_config === 'object' &&
    'effort' in params.output_config &&
    typeof params.output_config.effort === 'string'
  ) {
    body.reasoning = {
      effort: params.output_config.effort,
    }
  }

  return body
}

async function createChatCompletion(args: {
  params: BetaMessageStreamParams
  requestOptions?: RequestOptions
  client: OpenAICompatClientOptions
}): Promise<{ message: BetaMessage; response: Response; requestId?: string }> {
  const body = buildChatBody(args.params)
  const { data, response } = await requestJSON({
    url: endpointUrl(args.client.baseUrl, '/chat/completions'),
    body,
    fetch: args.client.fetch,
    defaultHeaders: args.client.defaultHeaders,
    options: args.requestOptions,
    source: args.client.source,
  })
  const requestId = getRequestId(response)
  return {
    message: chatResponseToBetaMessage(data, args.params.model, requestId),
    response,
    requestId,
  }
}

async function createResponsesCompletion(args: {
  params: BetaMessageStreamParams
  requestOptions?: RequestOptions
  client: OpenAICompatClientOptions
}): Promise<{ message: BetaMessage; response: Response; requestId?: string }> {
  const body = buildResponsesBody(args.params)
  const { data, response } = await requestJSON({
    url: endpointUrl(args.client.baseUrl, '/responses'),
    body,
    fetch: args.client.fetch,
    defaultHeaders: args.client.defaultHeaders,
    options: args.requestOptions,
    source: args.client.source,
  })
  const requestId = getRequestId(response)
  return {
    message: responsesResponseToBetaMessage(data, args.params.model, requestId),
    response,
    requestId,
  }
}

async function executeOpenAICompatibleCreate(args: {
  params: BetaMessageStreamParams
  requestOptions?: RequestOptions
  client: OpenAICompatClientOptions
  apiFormat: AprilApiFormat
}): Promise<{ message: BetaMessage; response: Response; requestId?: string }> {
  if (isOpenAIResponsesApiFormat(args.apiFormat)) {
    return createResponsesCompletion(args)
  }

  return createChatCompletion(args)
}

export function createOpenAICompatibleClient(
  options: OpenAICompatClientOptions,
): Anthropic {
  const apiFormat = getAprilApiFormat()

  const create = (
    params: BetaMessageStreamParams,
    requestOptions?: RequestOptions,
  ): OpenAICompatCreateResult => {
    if (params.stream) {
      return {
        async withResponse() {
          const result = await executeOpenAICompatibleCreate({
            params: {
              ...params,
              stream: false,
            },
            requestOptions,
            client: options,
            apiFormat,
          })

          return {
            data: createSyntheticStream(result.message, requestOptions?.signal),
            request_id: result.requestId,
            response: result.response,
          }
        },
      }
    }

    return executeOpenAICompatibleCreate({
      params,
      requestOptions,
      client: options,
      apiFormat,
    }).then(result => result.message)
  }

  const client = {
    beta: {
      messages: {
        create,
        async countTokens() {
          throw new Error(
            'countTokens is not implemented for OpenAI-compatible providers',
          )
        },
      },
    },
    models: {
      async *list() {
        try {
          const { data } = await requestJSON({
            url: endpointUrl(options.baseUrl, '/models'),
            method: 'GET',
            fetch: options.fetch,
            defaultHeaders: options.defaultHeaders,
            source: options.source,
          })

          const models = Array.isArray(data.data) ? data.data : []
          for (const entry of models) {
            if (entry && typeof entry === 'object') {
              yield entry
            }
          }
        } catch {
          return
        }
      },
    },
  }

  return client as unknown as Anthropic
}
