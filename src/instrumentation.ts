import * as Sentry from "@sentry/nextjs";
import { registerOTel } from "@vercel/otel";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";

export async function register() {
  // OTel PRIMEIRO, antes do Sentry
  const endpoint =
    process.env.OTEL_EXPORTER_OTLP_ENDPOINT ?? "http://otel-collector:4318";

  registerOTel({
    serviceName: "sistema-4.0",
    traceExporter: new OTLPTraceExporter({
      url: `${endpoint}/v1/traces`,
    }),
  });

  // Sentry depois
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("../sentry.server.config");
  }
  if (process.env.NEXT_RUNTIME === "edge") {
    await import("../sentry.edge.config");
  }
}

export const onRequestError = Sentry.captureRequestError;
