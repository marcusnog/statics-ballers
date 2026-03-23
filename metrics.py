"""Cálculo de métricas para estatísticas de apostas."""
from collections import defaultdict
from typing import Any


def calculate_metrics(matches: list[dict[str, Any]]) -> dict[str, Any]:
    """
    Calcula métricas agregadas a partir das partidas.
    Partidas devem ter: home_goals, away_goals, competition, competition_code.
    """
    if not matches:
        return _empty_metrics()

    # Filtrar partidas com resultado
    completed = [
        m
        for m in matches
        if m.get("home_goals") is not None and m.get("away_goals") is not None
    ]

    if not completed:
        return _empty_metrics()

    total = len(completed)

    # Métricas globais
    over_05 = sum(1 for m in completed if (m["home_goals"] + m["away_goals"]) >= 1)
    over_15 = sum(1 for m in completed if (m["home_goals"] + m["away_goals"]) >= 2)
    over_25 = sum(1 for m in completed if (m["home_goals"] + m["away_goals"]) >= 3)
    btts = sum(
        1
        for m in completed
        if m["home_goals"] >= 1 and m["away_goals"] >= 1
    )
    draws = sum(1 for m in completed if m["home_goals"] == m["away_goals"])

    # Favorito venceu: requer odds históricas. Sem odds, usamos baseline do documento (65-78% por liga)
    # Placeholder até integrar the-odds-api com dados históricos
    non_draws = total - draws
    favorite_wins = int(non_draws * 0.68) if non_draws else 0

    global_metrics = {
        "total_games": total,
        "over_05_pct": round(100 * over_05 / total, 1),
        "over_15_pct": round(100 * over_15 / total, 1),
        "over_25_pct": round(100 * over_25 / total, 1),
        "btts_pct": round(100 * btts / total, 1),
        "draws_pct": round(100 * draws / total, 1),
        "favorite_wins_pct": round(100 * favorite_wins / total, 1) if total else 0,
    }

    # Por competição
    by_competition: dict[str, list] = defaultdict(list)
    for m in completed:
        by_competition[m.get("competition_code", "?")].append(m)

    comp_metrics = {}
    for comp_code, comp_matches in by_competition.items():
        n = len(comp_matches)
        comp_over_25 = sum(
            1
            for m in comp_matches
            if (m["home_goals"] + m["away_goals"]) >= 3
        )
        comp_btts = sum(
            1
            for m in comp_matches
            if m["home_goals"] >= 1 and m["away_goals"] >= 1
        )
        comp_draws = sum(1 for m in comp_matches if m["home_goals"] == m["away_goals"])
        comp_fav = int((n - comp_draws) * 0.65) if (n - comp_draws) else 0

        comp_metrics[comp_code] = {
            "name": comp_matches[0].get("competition", comp_code) if comp_matches else comp_code,
            "games": n,
            "over_25_pct": round(100 * comp_over_25 / n, 1),
            "btts_pct": round(100 * comp_btts / n, 1),
            "draws_pct": round(100 * comp_draws / n, 1),
            "favorite_wins_pct": round(100 * comp_fav / n, 1) if n else 0,
        }

    return {
        "global": global_metrics,
        "by_competition": comp_metrics,
        "sample_matches": completed[-10:],  # últimas 10 para destaques
    }


def _empty_metrics() -> dict[str, Any]:
    return {
        "global": {
            "total_games": 0,
            "over_05_pct": 0,
            "over_15_pct": 0,
            "over_25_pct": 0,
            "btts_pct": 0,
            "draws_pct": 0,
            "favorite_wins_pct": 0,
        },
        "by_competition": {},
        "sample_matches": [],
    }
