"use client";

function ShimmerBox({ className }: { className: string }) {
  return (
    <div className={`shimmer rounded-xl ${className}`} />
  );
}

export default function DashboardSkeleton() {
  return (
    <div className="space-y-12">
      {/* Overview cards skeleton */}
      <section>
        <ShimmerBox className="h-7 w-44 mb-2" />
        <ShimmerBox className="h-4 w-72 mb-6" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            "border-t-slate-300",
            "border-t-emerald-300",
            "border-t-blue-300",
            "border-t-amber-300",
          ].map((border, i) => (
            <div key={i} className={`card-base border-t-2 ${border} p-6`}>
              <div className="flex items-start justify-between mb-4">
                <ShimmerBox className="h-11 w-11 rounded-xl" />
                <ShimmerBox className="h-5 w-14 rounded-full" />
              </div>
              <ShimmerBox className="h-3 w-28 mb-2" />
              <ShimmerBox className="h-8 w-20" />
              <ShimmerBox className="h-4 w-24 mt-1.5" />
            </div>
          ))}
        </div>
      </section>

      {/* Market assertiveness skeleton */}
      <section>
        <ShimmerBox className="h-7 w-64 mb-2" />
        <ShimmerBox className="h-4 w-96 mb-6" />
        <div className="card-base overflow-hidden">
          <div className="h-12 bg-slate-50 border-b border-slate-100 flex items-center px-5 gap-8">
            <ShimmerBox className="h-3 w-24" />
            <ShimmerBox className="h-3 w-14 ml-auto" />
            <ShimmerBox className="h-3 w-20" />
            <ShimmerBox className="h-3 w-20" />
          </div>
          {[95, 85, 78, 65, 60, 55, 48, 42, 35, 28, 15].map((w, i) => (
            <div key={i} className={`h-14 border-t border-slate-100 flex items-center px-5 gap-4 ${i % 2 === 0 ? "bg-white" : "bg-slate-50/40"}`}>
              <ShimmerBox className="h-5 w-5 rounded-full" />
              <ShimmerBox className="h-3 flex-1" />
              <ShimmerBox className="h-6 w-14 rounded-full" />
              <div className="flex items-center gap-2 w-36">
                <div className="flex-1 h-2.5 rounded-full bg-slate-100 overflow-hidden">
                  <div className="shimmer h-full rounded-full bg-emerald-200" style={{ width: `${w}%` }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* League comparison skeleton */}
      <section>
        <ShimmerBox className="h-7 w-52 mb-2" />
        <ShimmerBox className="h-4 w-80 mb-6" />
        <div className="card-base overflow-hidden">
          <div className="h-12 bg-slate-50 border-b border-slate-100" />
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-14 border-t border-slate-100 flex items-center px-5 gap-4">
              <ShimmerBox className="h-6 w-6 rounded-full" />
              <ShimmerBox className="h-3 w-32" />
              <ShimmerBox className="h-3 w-10 ml-auto" />
              <ShimmerBox className="h-3 w-10" />
              <ShimmerBox className="h-3 w-10" />
              <ShimmerBox className="h-3 w-10" />
            </div>
          ))}
        </div>
      </section>

      {/* Today's games skeleton */}
      <section>
        <ShimmerBox className="h-7 w-40 mb-2" />
        <ShimmerBox className="h-4 w-64 mb-6" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card-base p-5">
              <div className="flex items-center gap-4">
                <div className="flex flex-col items-center w-16 gap-1.5">
                  <ShimmerBox className="h-4 w-12 rounded-full" />
                  <ShimmerBox className="h-6 w-14" />
                </div>
                <div className="flex-1 flex items-center gap-2">
                  <div className="flex flex-col items-center gap-1.5 flex-1">
                    <ShimmerBox className="h-10 w-10 rounded-full" />
                    <ShimmerBox className="h-3 w-20" />
                  </div>
                  <ShimmerBox className="h-8 w-8 rounded-full" />
                  <div className="flex flex-col items-center gap-1.5 flex-1">
                    <ShimmerBox className="h-10 w-10 rounded-full" />
                    <ShimmerBox className="h-3 w-20" />
                  </div>
                </div>
                <div className="flex gap-1.5">
                  <ShimmerBox className="h-8 w-20 rounded-xl" />
                  <ShimmerBox className="h-8 w-16 rounded-xl" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
