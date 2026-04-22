"use client";

import { useState } from "react";
import { getLeagueEmblem } from "@/lib/leagues";

interface Match {
  id: string;
  home_team: string;
  away_team: string;
  home_team_crest?: string | null;
  away_team_crest?: string | null;
  competition: string;
  competition_code?: string;
  home_goals: number | null;
  away_goals: number | null;
}

interface RecentMatchesProps {
  matches: Match[];
}

function getMarketsHit(m: Match): { label: string; color: "green" | "blue" | "slate" }[] {
  const h = m.home_goals ?? 0;
  const a = m.away_goals ?? 0;
  const total = h + a;
  const hits: { label: string; color: "green" | "blue" | "slate" }[] = [];
  if (total >= 3) hits.push({ label: "Over 2.5 ✓", color: "green" });
  if (h >= 1 && a >= 1) hits.push({ label: "BTTS ✓", color: "blue" });
  if (total === 0) hits.push({ label: "Under 0.5 ✓", color: "slate" });
  return hits;
}

function initials(name: string): string {
  return (
    name
      .split(/\s+/)
      .map((w) => w[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "?"
  );
}

function TeamCrest({ src, alt }: { src?: string | null; alt: string }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return (
      <span
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[9px] font-bold text-slate-500 border border-slate-200"
        title={alt}
      >
        {initials(alt)}
      </span>
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      className="h-7 w-7 shrink-0 rounded-full object-contain bg-white border border-slate-100 p-0.5"
      onError={() => setFailed(true)}
    />
  );
}

function LeagueEmblem({ code }: { code?: string }) {
  const src = code ? getLeagueEmblem(code) : undefined;
  const [failed, setFailed] = useState(false);
  if (!src || failed) return null;
  return (
    <img
      src={src}
      alt=""
      className="h-4 w-4 shrink-0 object-contain opacity-80"
      onError={() => setFailed(true)}
    />
  );
}

const COMP_SHORT: Record<string, string> = {
  "Champions League (UCL)": "UCL",
  "Premier League": "PL",
  "La Liga": "LaLiga",
  "Europa League": "UEL",
  "Eredivisie": "DED",
  "Brasileirão": "BSA",
  "Libertadores": "CLI",
  "Bundesliga": "BL1",
  "Serie A": "SA",
  "Ligue 1": "FL1",
  "Primeira Liga": "PPL",
  "Championship": "ELC",
};

const HIT_COLORS = {
  green: "bg-emerald-50 text-emerald-700 border-emerald-200",
  blue: "bg-blue-50 text-blue-700 border-blue-200",
  slate: "bg-slate-100 text-slate-600 border-slate-200",
};

export default function RecentMatches({ matches }: RecentMatchesProps) {
  if (!matches || matches.length === 0) {
    return (
      <section id="jogos" className="scroll-mt-24">
        <h2 className="section-title section-divider">Jogos Recentes</h2>
        <p className="text-slate-500">Nenhum jogo recente disponível.</p>
      </section>
    );
  }

  const displayed = [...matches].reverse().slice(0, 12);

  return (
    <section id="jogos" className="scroll-mt-24 animate-slide-up" style={{ animationDelay: "0.2s" }}>
      <h2 className="section-title section-divider">Jogos Recentes</h2>
      <p className="section-subtitle">
        Destaques com mercados acertados derivados dos placares
      </p>
      <div className="card-base overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table-base">
            <thead>
              <tr>
                <th className="table-th">Jogo</th>
                <th className="table-th">Competição</th>
                <th className="table-th text-center">Placar</th>
                <th className="table-th">Mercados acertados</th>
              </tr>
            </thead>
            <tbody>
              {displayed.map((m, i) => {
                const hits = getMarketsHit(m);
                const h = m.home_goals ?? null;
                const a = m.away_goals ?? null;
                const score = h != null && a != null ? `${h} – ${a}` : "—";
                const totalGoals = (h ?? 0) + (a ?? 0);

                return (
                  <tr
                    key={m.id}
                    className={`border-t border-slate-100 ${i % 2 === 0 ? "bg-white" : "bg-slate-50/40"} table-row-hover`}
                  >
                    <td className="table-td">
                      <div className="flex items-center gap-2">
                        <TeamCrest src={m.home_team_crest} alt={m.home_team} />
                        <span className="font-medium text-slate-800 text-sm">{m.home_team}</span>
                        <span className="text-slate-300 text-xs shrink-0">×</span>
                        <span className="font-medium text-slate-800 text-sm">{m.away_team}</span>
                        <TeamCrest src={m.away_team_crest} alt={m.away_team} />
                      </div>
                    </td>
                    <td className="table-td">
                      <div className="flex items-center gap-1.5">
                        <LeagueEmblem code={m.competition_code} />
                        <span className="inline-flex px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-xs font-semibold">
                          {COMP_SHORT[m.competition] ?? m.competition.slice(0, 8)}
                        </span>
                      </div>
                    </td>
                    <td className="table-td text-center">
                      <span className={`font-black text-base tabular-nums px-3 py-1 rounded-lg inline-block ${
                        totalGoals >= 3
                          ? "text-emerald-700 bg-emerald-50"
                          : totalGoals === 0
                          ? "text-slate-500 bg-slate-100"
                          : "text-slate-800 bg-slate-50"
                      }`}>
                        {score}
                      </span>
                    </td>
                    <td className="table-td">
                      {hits.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {hits.map((hit) => (
                            <span
                              key={hit.label}
                              className={`inline-flex px-2 py-0.5 rounded-md text-xs font-semibold border ${HIT_COLORS[hit.color]}`}
                            >
                              {hit.label}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-400 text-sm">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
