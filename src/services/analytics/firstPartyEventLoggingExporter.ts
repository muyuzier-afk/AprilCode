import { ExportResultCode } from '@opentelemetry/core'
import type {
  LogRecordExporter,
  ReadableLogRecord,
} from '@opentelemetry/sdk-logs'

export class FirstPartyEventLoggingExporter implements LogRecordExporter {
  export(
    _logs: ReadableLogRecord[],
    resultCallback: (result: { code: ExportResultCode }) => void,
  ): void {
    resultCallback({ code: ExportResultCode.SUCCESS })
  }

  async forceFlush(): Promise<void> {}

  async shutdown(): Promise<void> {}
}
