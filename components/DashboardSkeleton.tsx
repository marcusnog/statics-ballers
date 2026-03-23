"use client";

export default function DashboardSkeleton() {
  return (
    <div className="animate-pulse space-y-10">
      <section>
        <div className="h-6 w-48 bg-slate-200 rounded-lg mb-6" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card-base p-6">
              <div className="h-10 w-10 bg-slate-200 rounded-lg mb-4" />
              <div className="h-4 w-24 bg-slate-200 rounded mb-2" />
              <div className="h-8 w-16 bg-slate-200 rounded" />
            </div>
          ))}
        </div>
      </section>
      <section>
        <div className="h-6 w-64 bg-slate-200 rounded-lg mb-6" />
        <div className="card-base overflow-hidden">
          <div className="h-12 bg-slate-100" />
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-14 border-t border-slate-100 flex items-center px-5 gap-4">
              <div className="h-4 flex-1 bg-slate-100 rounded" />
              <div className="h-4 w-12 bg-slate-100 rounded" />
              <div className="h-6 w-16 bg-slate-100 rounded-full" />
            </div>
          ))}
        </div>
      </section>
      <section>
        <div className="h-6 w-48 bg-slate-200 rounded-lg mb-6" />
        <div className="card-base p-8">
          <div className="h-4 bg-slate-100 rounded mb-4" />
          <div className="h-4 bg-slate-100 rounded mb-4 w-3/4" />
          <div className="h-4 bg-slate-100 rounded w-1/2" />
        </div>
      </section>
    </div>
  );
}
