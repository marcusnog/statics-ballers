"""Coletor de dados do SofaScore via ScraperFC."""
import time
from datetime import datetime, timezone
from typing import Any

from config import (
    SOFASCORE_ENABLED,
    SOFASCORE_LEAGUES,
    COMPETITION_NAMES,
)


def fetch_matches(
    date_from: datetime,
    date_to: datetime,
) -> list[dict[str, Any]]:
    """
    Busca partidas no período via SofaScore (ScraperFC).
    Retorna lista de dicts no formato interno após normalização.
    """
    if not SOFASCORE_ENABLED:
        return []

    try:
        from ScraperFC import Sofascore
    except ImportError:
        return []

    ss = Sofascore()
    all_matches = []
    now = datetime.now(timezone.utc)
    year_candidates = [
        f"{now.year - 1}/{now.year}",
        str(now.year),
        f"{now.year}/{now.year + 1}",
    ]

    for league_slug, comp_code in SOFASCORE_LEAGUES.items():
        matches_raw = []
        for year_str in year_candidates:
            try:
                matches_raw = ss.get_match_dicts(year_str, league_slug)
                break
            except Exception:
                continue
        if not matches_raw:
            continue
        try:
            comp_name = COMPETITION_NAMES.get(comp_code, comp_code)
            for m in matches_raw:
                m["_competition_code"] = comp_code
                m["_competition_name"] = comp_name
                all_matches.append(m)
            time.sleep(2)
        except Exception:
            pass

    normalized = []
    for m in all_matches:
        n = normalize_match(m)
        if not n:
            continue
        dt = _parse_date(n.get("date"))
        if dt and date_from <= dt <= date_to:
            normalized.append(n)
    return normalized


def fetch_fixtures(
    date_from: datetime,
    date_to: datetime,
) -> list[dict[str, Any]]:
    """Busca jogos agendados (fixtures) no período."""
    if not SOFASCORE_ENABLED:
        return []

    matches = fetch_matches(date_from, date_to)
    scheduled = {"SCHEDULED", "TIMED"}
    return [m for m in matches if (m.get("status") or "").upper() in scheduled]


def normalize_match(match: dict[str, Any]) -> dict[str, Any] | None:
    """Converte formato SofaScore para o formato interno."""
    try:
        mid = match.get("id")
        ht = match.get("homeTeam") or {}
        at = match.get("awayTeam") or {}
        home_team = ht.get("name") or ht.get("shortName") or "?"
        away_team = at.get("name") or at.get("shortName") or "?"

        ts = match.get("startTimestamp")
        if ts:
            dt = datetime.fromtimestamp(ts / 1000, tz=timezone.utc)
            date_iso = dt.isoformat().replace("+00:00", "Z")
        else:
            date_iso = None

        home_score = match.get("homeScore")
        away_score = match.get("awayScore")
        if isinstance(home_score, dict):
            home_goals = home_score.get("current") or home_score.get("display")
        else:
            home_goals = home_score
        if isinstance(away_score, dict):
            away_goals = away_score.get("current") or away_score.get("display")
        else:
            away_goals = away_score

        if home_goals is not None:
            try:
                home_goals = int(home_goals)
            except (TypeError, ValueError):
                home_goals = None
        if away_goals is not None:
            try:
                away_goals = int(away_goals)
            except (TypeError, ValueError):
                away_goals = None

        status_obj = match.get("status") or {}
        if isinstance(status_obj, dict):
            status = str(status_obj.get("code", status_obj.get("type", "")))
        else:
            status = str(status_obj)

        home_crest = ht.get("imageUrl") or ht.get("logo")
        away_crest = at.get("imageUrl") or at.get("logo")

        return {
            "id": f"ss_{mid}" if mid else f"ss_{hash((home_team, away_team, date_iso))}",
            "home_team": home_team,
            "away_team": away_team,
            "home_team_id": ht.get("id"),
            "away_team_id": at.get("id"),
            "home_team_crest": home_crest,
            "away_team_crest": away_crest,
            "competition": match.get("_competition_name", ""),
            "competition_code": match.get("_competition_code", ""),
            "date": date_iso,
            "home_goals": home_goals,
            "away_goals": away_goals,
            "status": _map_status(status),
            "total_goals": (home_goals + away_goals) if home_goals is not None and away_goals is not None else None,
        }
    except Exception:
        return None


def _parse_date(date_str: str | None) -> datetime | None:
    if not date_str:
        return None
    try:
        return datetime.fromisoformat(date_str.replace("Z", "+00:00"))
    except (ValueError, TypeError):
        return None


def _map_status(code: str) -> str:
    code_map = {
        "0": "SCHEDULED",
        "1": "TIMED",
        "6": "IN_PLAY",
        "7": "IN_PLAY",
        "31": "FINISHED",
        "50": "FINISHED",
        "60": "FINISHED",
        "70": "FINISHED",
        "100": "FINISHED",
        "110": "FINISHED",
        "120": "FINISHED",
    }
    try:
        c = int(code)
        return code_map.get(str(code), "FINISHED" if c >= 50 else "SCHEDULED")
    except (ValueError, TypeError):
        return "SCHEDULED"
