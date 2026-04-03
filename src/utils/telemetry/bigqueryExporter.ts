import { ExportResultCode } from '@opentelemetry/core'
import {
  AggregationTemporality,
  type MetricData,
  type PushMetricExporter,
  type ResourceMetrics,
} from '@opentelemetry/sdk-metrics'

export class BigQueryMetricsExporter implements PushMetricExporter {
  export(
    _metrics: ResourceMetrics,
    resultCallback: (result: { code: ExportResultCode }) => void,
  ): void {
    resultCallback({ code: ExportResultCode.SUCCESS })
  }

  forceFlush(): Promise<void> {
    return Promise.resolve()
  }

  shutdown(): Promise<void> {
    return Promise.resolve()
  }

  selectAggregationTemporality(_instrumentType: MetricData['descriptor']['type']): AggregationTemporality {
    return AggregationTemporality.CUMULATIVE
  }
}
