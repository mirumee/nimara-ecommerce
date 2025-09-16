export async function register() {
  if (process.env.OTEL_SERVICE_NAME) {
    // By making this path dynamic, we ensure that bundler
    // does not include the OpenTelemetry package in the bundle.
    const otelPath = "@vercel/otel";
    const { registerOTel } = await import(otelPath);

    registerOTel({
      serviceName: process.env.OTEL_SERVICE_NAME,
    });
    console.log("OpenTelemetry registered.");
  }

  if (process.env.SENTRY_DSN) {
    // By making this path dynamic, we ensure that bundler
    // does not include the OpenTelemetry package in the bundle.
    let sentryPath;

    if (process.env.NEXT_RUNTIME === "nodejs") {
      sentryPath = "../sentry.server.config";
    } else if (process.env.NEXT_RUNTIME === "edge") {
      sentryPath = "../sentry.edge.config";
    }

    if (sentryPath) {
      await import(sentryPath);
      console.log(`Sentry registered for ${process.env.NEXT_RUNTIME} runtime.`);
    }
  }
}
