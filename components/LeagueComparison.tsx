"use client";

import { useState } from "react";
import { getRegion, getLeagueEmblem } from "@/lib/leagues";

interface LeagueMetrics {
  name: string;
  games: number;
  over_25_pct: number;
  btts_pct: number;
  draws_pct?: number;
  favorite_wins_pct: number;
}

interface LeagueComparisonProps {
  byCompetition: Record<string, LeagueMetrics>;
}

function LeagueEmblem({ code }: { code: string }) {
  const src = getLeagueEmblem(code);
  const [failed, setFailed] = useState(false);
  if (!src || failed) return null;
  return (
    <img
      src={src}
      alt=""
      className="h-6 w-6 shrink-0 object-contain opacity-90"
      onError={() => setFailed(true)}
    />
  );
}

export default function LeagueComparison({ byCompetition }: LeagueComparisonProps) {
  const leagues = Object.entries(byCompetition).map(([code, m]) => ({ code, ...m }));

  const byRegion = leagues.reduce<Record<string, typeof leagues>>((acc, league) => {
    const region = getRegion(league.code);
    if (!acc[region]) acc[region] = [];
    acc[region].push(league);
    return acc;
  }, {});

  const regionOrder = ["Europa", "América do Sul", "Outras"];

  if (leagues.length === 0) {
    return (
      <section id="ligas" className="scroll-mt-24">
        <h2 className="section-title section-divider">Comparativo por Liga</h2>
        <p className="text-slate-500">Nenhum dado de liga disponível.</p>
      </section>
    );
  }

  return (
    <section id="ligas" className="scroll-mt-24 animate-slide-up" style={{ animationDelay: "0.15s" }}>
      <h2 className="section-title section-divider">Comparativo por Liga</h2>
      <p className="section-subtitle">
        % vitória favorito · % over 2.5 · % ambas marcam · escanteios +9.5
      </p>
      <div className="space-y-6">
        {regionOrder.map((region) => {
          const regionLeagues = byRegion[region];
          if (!regionLeagues?.length) return null;
          return (
            <div key={region}>
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                <span className="w-1 h-4 rounded-full bg-emerald-500" />
                {region}
              </h3>
              <div className="card-base overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="table-base">
                    <thead>
                      <tr>
                        <th className="table-th">Liga</th>
                        <th className="table-th text-right">Jogos</th>
                        <th className="table-th text-right">Vitória fav.</th>
                        <th className="table-th text-right">Over 2.5</th>
                        <th className="table-th text-right">BTTS</th>
                        <th className="table-th text-right">Esc. +9.5</th>
                      </tr>
                    </thead>
                    <tbody>
                      {regionLeagues.map((league, i) => (
                        <tr
                          key={league.code}
                          className={`border-t border-slate-100 ${i % 2 === 0 ? "bg-white" : "bg-slate-50/30"} table-row-hover`}
                        >
                          <td className="table-td font-medium text-slate-800">
                            <div className="flex items-center gap-2">
                              <LeagueEmblem code={league.code} />
                              {league.name}
                            </div>
                          </td>
                          <td className="table-td text-right text-slate-600 tabular-nums">{league.games}</td>
                          <td className="table-td text-right font-medium tabular-nums">{league.favorite_wins_pct}%</td>
                          <td className="table-td text-right font-medium tabular-nums">{league.over_25_pct}%</td>
                          <td className="table-td text-right font-medium tabular-nums">{league.btts_pct}%</td>
                          <td className="table-td text-right text-slate-400">—</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
