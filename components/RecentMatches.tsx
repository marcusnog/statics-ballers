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

function getMarketsHit(m: Match): string[] {
  const h = m.home_goals ?? 0;
  const a = m.away_goals ?? 0;
  const total = h + a;
  const hits: string[] = [];

  if (total >= 3) hits.push("Over 2.5");
  if (h >= 1 && a >= 1) hits.push("BTTS");
  if (total === 0) hits.push("Under 0.5");

  return hits;
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "?";
}

function TeamCrest({ src, alt }: { src?: string | null; alt: string }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return (
      <span
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-200 text-[10px] font-bold text-slate-500"
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
      className="h-8 w-8 shrink-0 rounded-full object-contain"
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
      className="h-5 w-5 shrink-0 object-contain opacity-80"
      onError={() => setFailed(true)}
    />
  );
}

function competitionChip(comp: string): string {
  const short: Record<string, string> = {
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
  return short[comp] ?? comp.slice(0, 8);
}

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
                const score =
                  m.home_goals != null && m.away_goals != null
                    ? `${m.home_goals}–${m.away_goals}`
                    : "—";
                return (
                  <tr
                    key={m.id}
                    className={`border-t border-slate-100 ${i % 2 === 0 ? "bg-white" : "bg-slate-50/30"} table-row-hover`}
                  >
                    <td className="table-td font-medium text-slate-800">
                      <div className="flex items-center gap-2">
                        <TeamCrest src={m.home_team_crest} alt={m.home_team} />
                        <span>{m.home_team} × {m.away_team}</span>
                        <TeamCrest src={m.away_team_crest} alt={m.away_team} />
                      </div>
                    </td>
                    <td className="table-td">
                      <div className="flex items-center gap-2">
                        <LeagueEmblem code={m.competition_code} />
                        <span className="inline-flex px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 text-xs font-medium">
                          {competitionChip(m.competition)}
                        </span>
                      </div>
                    </td>
                    <td className="table-td text-center">
                      <span className="font-bold text-slate-900 tabular-nums text-base">{score}</span>
                    </td>
                    <td className="table-td text-emerald-600 font-medium">
                      {hits.length > 0 ? hits.join(", ") : "—"}
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
