"use client";

import { useState } from "react";
import useSWR from "swr";
import { fixturesUrl } from "@/lib/data-url";
import { getLeagueEmblem } from "@/lib/leagues";

interface Fixture {
  id: string;
  home_team: string;
  away_team: string;
  home_team_crest?: string | null;
  away_team_crest?: string | null;
  competition: string;
  competition_code?: string;
  date: string | null;
  status?: string;
}

interface LeagueMetrics {
  over_25_pct: number;
  btts_pct: number;
  favorite_wins_pct: number;
}

interface TodaysGamesProps {
  byCompetition: Record<string, LeagueMetrics>;
}

const fetcher = (url: string) => fetch(url).then((r) => r.json());

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
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-200 text-[10px] font-bold text-slate-500"
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
      className="h-9 w-9 shrink-0 rounded-full object-contain"
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

function formatTime(dateStr: string | null): string {
  if (!dateStr) return "—";
  try {
    const d = new Date(dateStr);
    return d.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}

function formatDateLabel(dateStr: string | null): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const fixtureDate = new Date(d);
  fixtureDate.setHours(0, 0, 0, 0);
  const diff = Math.floor(
    (fixtureDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );
  if (diff === 0) return "Hoje";
  if (diff === 1) return "Amanhã";
  if (diff === -1) return "Ontem";
  if (diff >= -7 && diff < 0) return d.toLocaleDateString("pt-BR", { weekday: "short" });
  return d.toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit" });
}

function getSuggestions(
  code: string | undefined,
  byCompetition: Record<string, LeagueMetrics>
): { label: string; confidence: "alta" | "média"; pct?: number }[] {
  const league = code ? byCompetition[code] : null;
  const suggestions: { label: string; confidence: "alta" | "média"; pct?: number }[] = [];

  if (!league) {
    suggestions.push({ label: "Over 2.5 gols", confidence: "média" });
    suggestions.push({ label: "BTTS", confidence: "média" });
    return suggestions.slice(0, 3);
  }

  if (league.over_25_pct >= 60) {
    suggestions.push({
      label: "Over 2.5 gols",
      confidence: "alta",
      pct: league.over_25_pct,
    });
  } else if (league.over_25_pct >= 50) {
    suggestions.push({
      label: "Over 2.5 gols",
      confidence: "média",
      pct: league.over_25_pct,
    });
  }

  if (league.btts_pct >= 55) {
    suggestions.push({
      label: "Ambas marcam",
      confidence: "alta",
      pct: league.btts_pct,
    });
  } else if (league.btts_pct >= 45) {
    suggestions.push({
      label: "Ambas marcam",
      confidence: "média",
      pct: league.btts_pct,
    });
  }

  if (league.favorite_wins_pct >= 68 && suggestions.length < 3) {
    suggestions.push({
      label: "Vitória do favorito",
      confidence: league.favorite_wins_pct >= 72 ? "alta" : "média",
      pct: league.favorite_wins_pct,
    });
  }

  return suggestions.slice(0, 3);
}

export default function TodaysGames({ byCompetition }: TodaysGamesProps) {
  const { data: fixturesData } = useSWR(fixturesUrl(), fetcher);
  const fixtures: Fixture[] = fixturesData?.fixtures ?? [];
  const updatedAt = fixturesData?.updated_at;

  const now = new Date();
  const cutoff = new Date(now.getTime() + 72 * 60 * 60 * 1000); // próximas 72h
  const excludedStatuses = new Set(["FINISHED", "CANCELLED", "POSTPONED", "SUSPENDED", "AWARDED"]);
  const upcoming = fixtures.filter((f) => {
    if (!f.date) return false;
    if (excludedStatuses.has(f.status || "")) return false;
    const d = new Date(f.date);
    return d >= now && d <= cutoff;
  });

  if (upcoming.length === 0) {
    return (
      <section id="jogos-do-dia" className="scroll-mt-24 animate-slide-up" style={{ animationDelay: "0.25s" }}>
        <h2 className="section-title section-divider">Jogos do dia</h2>
        <p className="section-subtitle">Próximos jogos com sugestões de apostas</p>
        <div className="card-base p-8 text-center">
          <p className="text-slate-500">
            Nenhum jogo programado para as próximas 48h.
          </p>
          <p className="text-sm text-slate-400 mt-2">
            Execute <code className="bg-slate-100 px-1.5 py-0.5 rounded">python main.py</code> com FOOTBALL_DATA_API_KEY para buscar jogos reais.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section id="jogos-do-dia" className="scroll-mt-24 animate-slide-up" style={{ animationDelay: "0.25s" }}>
      <h2 className="section-title section-divider">Jogos do dia</h2>
      <p className="section-subtitle">
        Próximos jogos com sugestões baseadas nas estatísticas da liga
      </p>
      <div className="space-y-4">
        {upcoming.map((f) => {
          const suggestions = getSuggestions(f.competition_code, byCompetition);
          const dateLabel = formatDateLabel(f.date);
          return (
            <div
              key={f.id}
              className="card-base p-4 sm:p-5 hover:border-emerald-200 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1 flex items-center gap-3 min-w-0">
                  <div className="flex shrink-0 flex-col items-center w-14">
                    <span className="text-xs font-medium text-slate-500 uppercase">
                      {dateLabel}
                    </span>
                    <span className="text-lg font-bold text-slate-800 tabular-nums mt-0.5">
                      {formatTime(f.date)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                    <TeamCrest src={f.home_team_crest} alt={f.home_team} />
                    <span className="font-medium text-slate-800 truncate">
                      {f.home_team}
                    </span>
                    <span className="text-slate-400 shrink-0">×</span>
                    <span className="font-medium text-slate-800 truncate">
                      {f.away_team}
                    </span>
                    <TeamCrest src={f.away_team_crest} alt={f.away_team} />
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <LeagueEmblem code={f.competition_code} />
                    <span className="text-xs text-slate-500 hidden sm:inline">
                      {f.competition}
                    </span>
                  </div>
                </div>
                <div className="sm:border-l sm:border-slate-200 sm:pl-4 flex flex-wrap gap-2">
                  {suggestions.map((s) => (
                    <span
                      key={s.label}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium ${
                        s.confidence === "alta"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-slate-50 text-slate-600 border border-slate-200"
                      }`}
                      title={s.pct ? `${s.pct}% na liga` : undefined}
                    >
                      {s.label}
                      {s.pct != null && (
                        <span className="text-slate-400">({s.pct}%)</span>
                      )}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {updatedAt && (
        <p className="text-xs text-slate-400 mt-3">
          Próximos jogos atualizados automaticamente pelo backend.
        </p>
      )}
    </section>
  );
}
