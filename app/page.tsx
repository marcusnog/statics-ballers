"use client";

import useSWR from "swr";
import { metricsUrl, reportsUrl } from "@/lib/data-url";
import OverviewCards from "@/components/OverviewCards";
import MarketAssertiveness from "@/components/MarketAssertiveness";
import LeagueComparison from "@/components/LeagueComparison";
import TodaysGames from "@/components/TodaysGames";
import RecentMatches from "@/components/RecentMatches";
import ReportViewer from "@/components/ReportViewer";
import Recommendations from "@/components/Recommendations";
import DashboardSkeleton from "@/components/DashboardSkeleton";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function Dashboard() {
  const { data: metricsData, error: metricsError } = useSWR(metricsUrl(), fetcher);
  const { data: reportData } = useSWR(reportsUrl(), fetcher);

  if (metricsError) {
    return (
      <div className="card-base p-8 max-w-lg mx-auto text-center animate-fade-in">
        <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-slate-800 mb-2">Erro ao carregar dados</h3>
        <p className="text-sm text-slate-600 mb-4">
          Verifique se os arquivos existem em <code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded">data/</code> e{" "}
          <code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded">reports/</code>. Execute{" "}
          <code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded">python main.py</code> para gerar.
        </p>
      </div>
    );
  }

  if (!metricsData) {
    return <DashboardSkeleton />;
  }

  const metrics = metricsData.metrics ?? metricsData;
  const global = metrics.global ?? {};
  const byCompetition = metrics.by_competition ?? {};
  const sampleMatches = metrics.sample_matches ?? [];

  const favoriteWinsByLeague = Object.entries(byCompetition).map(([code, m]) => {
    const league = m as { name?: string; favorite_wins_pct?: number };
    return { name: league.name ?? code, pct: league.favorite_wins_pct ?? 0 };
  });

  return (
    <div className="space-y-12 sm:space-y-16">
      <OverviewCards
        totalGames={global.total_games ?? 0}
        over05Pct={global.over_05_pct ?? 0}
        bttsPct={global.btts_pct ?? 0}
        favoriteWinsByLeague={favoriteWinsByLeague}
      />

      <MarketAssertiveness
        over05={global.over_05_pct ?? 0}
        over15={global.over_15_pct ?? 0}
        favoriteWins={global.favorite_wins_pct ?? 0}
        btts={global.btts_pct ?? 0}
        over25={global.over_25_pct ?? 0}
        draws={global.draws_pct ?? 0}
      />

      <LeagueComparison byCompetition={byCompetition} />

      <TodaysGames byCompetition={byCompetition} />

      <RecentMatches matches={sampleMatches} />

      <ReportViewer
        content={reportData?.content ?? null}
        date={reportData?.date ?? null}
        message={reportData?.message}
      />

      <Recommendations />
    </div>
  );
}
