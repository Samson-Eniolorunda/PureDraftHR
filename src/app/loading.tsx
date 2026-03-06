export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Title skeleton */}
      <div className="space-y-2">
        <div className="h-8 w-64 bg-muted rounded-lg" />
        <div className="h-4 w-96 bg-muted rounded" />
      </div>

      {/* Card skeleton */}
      <div className="rounded-xl border bg-card p-6 space-y-4">
        <div className="h-5 w-40 bg-muted rounded" />
        <div className="space-y-3">
          <div className="h-10 bg-muted rounded-lg" />
          <div className="h-10 bg-muted rounded-lg" />
          <div className="h-32 bg-muted rounded-lg" />
        </div>
        <div className="h-10 w-32 bg-muted rounded-lg" />
      </div>
    </div>
  );
}
