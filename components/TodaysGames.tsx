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
  return (
    name
      .split(/\s+/)
      .map((w) => w[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "?"
  );
}

function TeamCrest({ src, alt, size = 10 }: { src?: string | null; alt: string; size?: number }) {
  const [failed, setFailed] = useState(false);
  const sizeClass = size === 10 ? "h-10 w-10 text-[11px]" : "h-8 w-8 text-[10px]";
  if (!src || failed) {
    return (
      <span
        className={`flex ${sizeClass} shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-slate-100 to-slate-200 font-bold text-slate-500 border border-slate-200`}
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
      className={`${sizeClass} shrink-0 rounded-full object-contain bg-white border border-slate-100 p-0.5`}
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
    return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
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
  const diff = Math.floor((fixtureDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
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
    suggestions.push({ label: "Over 2.5", confidence: "alta", pct: league.over_25_pct });
  } else if (league.over_25_pct >= 50) {
    suggestions.push({ label: "Over 2.5", confidence: "média", pct: league.over_25_pct });
  }

  if (league.btts_pct >= 55) {
    suggestions.push({ label: "BTTS", confidence: "alta", pct: league.btts_pct });
  } else if (league.btts_pct >= 45) {
    suggestions.push({ label: "BTTS", confidence: "média", pct: league.btts_pct });
  }

  if (league.favorite_wins_pct >= 68 && suggestions.length < 3) {
    suggestions.push({
      label: "Fav. vence",
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
  const cutoff = new Date(now.getTime() + 72 * 60 * 60 * 1000);
  const excludedStatuses = new Set(["FINISHED", "CANCELLED", "POSTPONED", "SUSPENDED", "AWARDED"]);
  const matchDurationMs = 3 * 60 * 60 * 1000;

  const upcoming = fixtures.filter((f) => {
    if (!f.date) return false;
    if (excludedStatuses.has(f.status || "")) return false;
    const d = new Date(f.date);
    const likelyEnded = new Date(d.getTime() + matchDurationMs);
    if (likelyEnded < now) return false;
    return d >= now && d <= cutoff;
  });

  if (upcoming.length === 0) {
    return (
      <section id="jogos-do-dia" className="scroll-mt-24 animate-slide-up" style={{ animationDelay: "0.25s" }}>
        <h2 className="section-title section-divider">Jogos do dia</h2>
        <p className="section-subtitle">Próximos jogos com sugestões de apostas</p>
        <div className="card-base p-10 text-center">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-slate-100 flex items-center justify-center text-2xl">
            📅
          </div>
          <p className="text-slate-600 font-medium">Nenhum jogo programado para as próximas 72h.</p>
          <p className="text-sm text-slate-400 mt-2">
            Execute <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs">python main.py</code> para buscar jogos reais.
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
      <div className="space-y-3">
        {upcoming.map((f) => {
          const suggestions = getSuggestions(f.competition_code, byCompetition);
          const dateLabel = formatDateLabel(f.date);
          const isToday = dateLabel === "Hoje";

          return (
            <div
              key={f.id}
              className={`card-base p-4 sm:p-5 transition-all duration-200 hover:border-emerald-200/80 hover:shadow-[0_4px_16px_rgba(16,185,129,0.08)] ${isToday ? "border-l-2 border-l-emerald-500" : ""}`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">

                {/* Match layout: time + teams in VS format */}
                <div className="flex-1 flex items-center gap-4 min-w-0">

                  {/* Date/time block */}
                  <div className="flex shrink-0 flex-col items-center justify-center w-16 text-center">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full mb-1 ${isToday ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-500"}`}>
                      {dateLabel}
                    </span>
                    <span className="text-xl font-bold text-slate-900 tabular-nums leading-none">
                      {formatTime(f.date)}
                    </span>
                  </div>

                  {/* VS match layout */}
                  <div className="flex-1 flex items-center gap-2 min-w-0">
                    {/* Home team */}
                    <div className="flex flex-col items-center gap-1.5 flex-1 min-w-0 text-center">
                      <TeamCrest src={f.home_team_crest} alt={f.home_team} size={10} />
                      <span className="text-xs font-semibold text-slate-700 leading-tight line-clamp-2">
                        {f.home_team}
                      </span>
                    </div>

                    {/* VS badge */}
                    <div className="flex flex-col items-center shrink-0">
                      <span className="text-[10px] font-black text-slate-400 bg-slate-100 rounded-full w-8 h-8 flex items-center justify-center select-none">
                        VS
                      </span>
                    </div>

                    {/* Away team */}
                    <div className="flex flex-col items-center gap-1.5 flex-1 min-w-0 text-center">
                      <TeamCrest src={f.away_team_crest} alt={f.away_team} size={10} />
                      <span className="text-xs font-semibold text-slate-700 leading-tight line-clamp-2">
                        {f.away_team}
                      </span>
                    </div>
                  </div>

                  {/* Competition */}
                  <div className="hidden sm:flex items-center gap-1.5 shrink-0 px-2 py-1 bg-slate-50 rounded-lg border border-slate-100">
                    <LeagueEmblem code={f.competition_code} />
                    <span className="text-xs text-slate-500 font-medium max-w-[80px] truncate">
                      {f.competition}
                    </span>
                  </div>
                </div>

                {/* Suggestions */}
                {suggestions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 sm:border-l sm:border-slate-200 sm:pl-4 shrink-0">
                    {suggestions.map((s) => (
                      <span
                        key={s.label}
                        title={s.pct ? `${s.pct}% nesta liga` : undefined}
                        className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                          s.confidence === "alta"
                            ? "bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 border border-emerald-200"
                            : "bg-slate-50 text-slate-600 border border-slate-200"
                        }`}
                      >
                        {s.confidence === "alta" && (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                        )}
                        {s.label}
                        {s.pct != null && (
                          <span className={`${s.confidence === "alta" ? "text-emerald-500" : "text-slate-400"} font-bold`}>
                            {s.pct}%
                          </span>
                        )}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {updatedAt && (
        <p className="text-xs text-slate-400 mt-3 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          Jogos atualizados automaticamente pelo backend.
        </p>
      )}
    </section>
  );
}
