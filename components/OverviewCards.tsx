"use client";

interface OverviewCardsProps {
  totalGames: number;
  over05Pct: number;
  bttsPct: number;
  favoriteWinsByLeague: { name: string; pct: number }[];
}

const ICONS = {
  games: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  over: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  ),
  btts: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  trophy: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
    </svg>
  ),
};

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
        <div className="card-interactive p-6 group">
          <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center mb-4 text-slate-500 group-hover:bg-slate-200/80 transition-colors">
            {ICONS.games}
          </div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">
            Jogos analisados
          </p>
          <p className="text-2xl font-bold text-slate-900 tabular-nums">{totalGames}</p>
        </div>
        <div className="card-interactive p-6 group">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center mb-4 text-emerald-600 group-hover:bg-emerald-100 transition-colors">
            {ICONS.over}
          </div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">
            Mercado mais assertivo
          </p>
          <p className="text-2xl font-bold text-emerald-600 tabular-nums">
            Over 0.5 ({over05Pct}%)
          </p>
        </div>
        <div className="card-interactive p-6 group">
          <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center mb-4 text-blue-600 group-hover:bg-blue-100 transition-colors">
            {ICONS.btts}
          </div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">
            Mercado mais seguro
          </p>
          <p className="text-2xl font-bold text-blue-600 tabular-nums">
            BTTS ({bttsPct}%)
          </p>
        </div>
        {mostPredictable && (
          <div className="card-interactive p-6 group sm:col-span-2 lg:col-span-1">
            <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center mb-4 text-amber-600 group-hover:bg-amber-100 transition-colors">
              {ICONS.trophy}
            </div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">
              Liga mais previsível
            </p>
            <p className="text-lg font-semibold text-slate-900">{mostPredictable.name}</p>
            <p className="text-sm text-slate-600 mt-0.5">
              Favoritos: {mostPredictable.pct}% vitórias
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
