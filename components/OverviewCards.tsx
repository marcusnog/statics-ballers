"use client";

interface OverviewCardsProps {
  totalGames: number;
  over05Pct: number;
  bttsPct: number;
  favoriteWinsByLeague: { name: string; pct: number }[];
}

export default function OverviewCards({
  totalGames,
  over05Pct,
  bttsPct,
  favoriteWinsByLeague,
}: OverviewCardsProps) {
  const mostPredictable = [...favoriteWinsByLeague].sort((a, b) => b.pct - a.pct)[0];

  return (
    <section id="visao-geral" className="scroll-mt-24 animate-slide-up">
      <h2 className="section-title section-divider">Visão Geral</h2>
      <p className="section-subtitle">
        Métricas principais com base na janela móvel de 30 dias
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        {/* Total games */}
        <div className="card-accent-slate p-6 group">
          <div className="flex items-start justify-between mb-4">
            <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-slate-200/80 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
              30 dias
            </span>
          </div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Jogos analisados
          </p>
          <p className="text-3xl font-bold text-slate-900 tabular-nums tracking-tight">{totalGames}</p>
        </div>

        {/* Best market */}
        <div className="card-accent-green p-6 group">
          <div className="flex items-start justify-between mb-4">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white shadow-[0_2px_8px_rgba(16,185,129,0.3)] group-hover:shadow-[0_4px_12px_rgba(16,185,129,0.4)] transition-shadow">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
              #{1}
            </span>
          </div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Mercado mais assertivo
          </p>
          <p className="text-2xl font-bold text-emerald-600 tabular-nums tracking-tight">
            Over 0.5
          </p>
          <p className="text-sm text-slate-500 mt-0.5 font-medium">{over05Pct}% de acerto</p>
        </div>

        {/* BTTS */}
        <div className="card-accent-blue p-6 group">
          <div className="flex items-start justify-between mb-4">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white shadow-[0_2px_8px_rgba(59,130,246,0.3)] group-hover:shadow-[0_4px_12px_rgba(59,130,246,0.4)] transition-shadow">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full">
              Seguro
            </span>
          </div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Mercado mais seguro
          </p>
          <p className="text-2xl font-bold text-blue-600 tabular-nums tracking-tight">
            BTTS
          </p>
          <p className="text-sm text-slate-500 mt-0.5 font-medium">{bttsPct}% de acerto</p>
        </div>

        {/* Most predictable league */}
        {mostPredictable && (
          <div className="card-accent-amber p-6 group sm:col-span-2 lg:col-span-1">
            <div className="flex items-start justify-between mb-4">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white shadow-[0_2px_8px_rgba(245,158,11,0.3)] group-hover:shadow-[0_4px_12px_rgba(245,158,11,0.4)] transition-shadow">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <span className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-full">
                Top Liga
              </span>
            </div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Liga mais previsível
            </p>
            <p className="text-lg font-bold text-slate-900 leading-tight">{mostPredictable.name}</p>
            <p className="text-sm text-amber-600 font-semibold mt-0.5">
              {mostPredictable.pct}% vitórias favorito
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
