export function LoadingSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="animate-pulse space-y-3" aria-hidden>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 rounded-2xl bg-surface-container p-4"
        >
          <div className="h-12 w-12 rounded-full bg-surface-container-high" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-2/3 rounded bg-surface-container-high" />
            <div className="h-3 w-1/3 rounded bg-surface-container-high" />
          </div>
          <div className="h-4 w-16 rounded bg-surface-container-high" />
        </div>
      ))}
    </div>
  );
}
