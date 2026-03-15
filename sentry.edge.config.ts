import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://953c04718d8385a95e8fbb145c8d8f55@o4511048304754688.ingest.us.sentry.io/4511048306786304",
  tracesSampleRate: 1.0,
});
