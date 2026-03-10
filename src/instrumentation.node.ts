import { registerOTel } from "@vercel/otel";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";

export function register() {
  const endpoint =
    process.env.OTEL_EXPORTER_OTLP_ENDPOINT ?? "http://otel-collector:4318";

  registerOTel({
    serviceName: process.env.OTEL_SERVICE_NAME ?? "sistema-4.0",
    traceExporter: new OTLPTraceExporter({
      url: `${endpoint}/v1/traces`,
    }),
    attributes: {
      "deployment.environment": process.env.NODE_ENV ?? "production",
    },
  });
}
