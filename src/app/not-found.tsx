import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
        <span className="text-3xl">🔍</span>
      </div>
      <h1 className="text-4xl font-bold tracking-tight mb-2">404</h1>
      <h2 className="text-xl font-semibold text-muted-foreground mb-4">
        Page not found
      </h2>
      <p className="text-muted-foreground max-w-md mb-8">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
        Let&apos;s get you back on track.
      </p>
      <div className="flex gap-3">
        <Link
          href="/assistant"
          className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Go to Assistant
        </Link>
        <Link
          href="/builder"
          className="inline-flex items-center justify-center rounded-lg border border-input bg-background px-6 py-2.5 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          Go to Builder
        </Link>
      </div>
    </div>
  );
}
