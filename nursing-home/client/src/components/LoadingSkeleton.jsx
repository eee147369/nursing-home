export function TableSkeleton({ rows = 5, cols = 4 }) {
  return (
    <div className="card overflow-hidden" aria-busy="true" aria-label="加载中">
      <div className="p-4 space-y-3">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="flex gap-4">
            {Array.from({ length: cols }).map((_, c) => (
              <div key={c} className="skeleton h-5 rounded flex-1" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function CardSkeleton({ count = 4 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" aria-busy="true" aria-label="加载中">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card p-5 space-y-3">
          <div className="skeleton h-4 w-1/2 rounded" />
          <div className="skeleton h-8 w-2/3 rounded" />
          <div className="skeleton h-3 w-1/3 rounded" />
        </div>
      ))}
    </div>
  );
}
