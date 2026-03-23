/**
 * Cálculo de métricas (fallback quando metrics.json não existe).
 * Espelha a lógica do metrics.py do backend Python.
 */

export interface Match {
  id: string;
  home_team: string;
  away_team: string;
  home_team_crest?: string | null;
  away_team_crest?: string | null;
  competition: string;
  competition_code?: string;
  date: string | null;
  home_goals: number | null;
  away_goals: number | null;
  status?: string;
}

export interface GlobalMetrics {
  total_games: number;
  over_05_pct: number;
  over_15_pct: number;
  over_25_pct: number;
  btts_pct: number;
  draws_pct: number;
  favorite_wins_pct: number;
}

export interface CompetitionMetrics {
  name: string;
  games: number;
  over_25_pct: number;
  btts_pct: number;
  draws_pct: number;
  favorite_wins_pct: number;
}

export interface MetricsData {
  global: GlobalMetrics;
  by_competition: Record<string, CompetitionMetrics>;
  sample_matches: Match[];
}

function emptyMetrics(): MetricsData {
  return {
    global: {
      total_games: 0,
      over_05_pct: 0,
      over_15_pct: 0,
      over_25_pct: 0,
      btts_pct: 0,
      draws_pct: 0,
      favorite_wins_pct: 0,
    },
    by_competition: {},
    sample_matches: [],
  };
}

export function calculateMetrics(matches: Match[]): MetricsData {
  const completed = matches.filter(
    (m) => m.home_goals != null && m.away_goals != null
  );

  if (completed.length === 0) return emptyMetrics();

  const total = completed.length;
  const over05 = completed.filter(
    (m) => (m.home_goals! + m.away_goals!) >= 1
  ).length;
  const over15 = completed.filter(
    (m) => (m.home_goals! + m.away_goals!) >= 2
  ).length;
  const over25 = completed.filter(
    (m) => (m.home_goals! + m.away_goals!) >= 3
  ).length;
  const btts = completed.filter(
    (m) => m.home_goals! >= 1 && m.away_goals! >= 1
  ).length;
  const draws = completed.filter((m) => m.home_goals === m.away_goals).length;
  const nonDraws = total - draws;
  const favoriteWins = Math.round(nonDraws * 0.68);

  const global: GlobalMetrics = {
    total_games: total,
    over_05_pct: Math.round((100 * over05) / total * 10) / 10,
    over_15_pct: Math.round((100 * over15) / total * 10) / 10,
    over_25_pct: Math.round((100 * over25) / total * 10) / 10,
    btts_pct: Math.round((100 * btts) / total * 10) / 10,
    draws_pct: Math.round((100 * draws) / total * 10) / 10,
    favorite_wins_pct:
      total > 0 ? Math.round((100 * favoriteWins) / total * 10) / 10 : 0,
  };

  const byCompetition: Record<string, CompetitionMetrics> = {};
  const compGroups: Record<string, Match[]> = {};

  for (const m of completed) {
    const code = m.competition_code || "?";
    if (!compGroups[code]) compGroups[code] = [];
    compGroups[code].push(m);
  }

  for (const [code, compMatches] of Object.entries(compGroups)) {
    const n = compMatches.length;
    const compOver25 = compMatches.filter(
      (m) => (m.home_goals! + m.away_goals!) >= 3
    ).length;
    const compBtts = compMatches.filter(
      (m) => m.home_goals! >= 1 && m.away_goals! >= 1
    ).length;
    const compDraws = compMatches.filter((m) => m.home_goals === m.away_goals).length;
    const compFav = Math.round((n - compDraws) * 0.65);

    byCompetition[code] = {
      name: compMatches[0]?.competition ?? code,
      games: n,
      over_25_pct: Math.round((100 * compOver25) / n * 10) / 10,
      btts_pct: Math.round((100 * compBtts) / n * 10) / 10,
      draws_pct: Math.round((100 * compDraws) / n * 10) / 10,
      favorite_wins_pct: n > 0 ? Math.round((100 * compFav) / n * 10) / 10 : 0,
    };
  }

  return {
    global,
    by_competition: byCompetition,
    sample_matches: completed.slice(-10),
  };
}
