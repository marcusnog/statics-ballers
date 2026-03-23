"""Coletor de dados do FlashScore (fs-football-fork)."""
import time
from datetime import datetime, timezone
from typing import Any

from config import FLASHSCORE_ENABLED


def fetch_matches(
    date_from: datetime,
    date_to: datetime,
) -> list[dict[str, Any]]:
    """
    Busca partidas no período via FlashScore.
    Retorna lista de dicts no formato interno.
    fs-football-fork expõe get_today_matches(); para range de datas
    requer iteração por ligas - implementação futura.
    """
    if not FLASHSCORE_ENABLED:
        return []

    try:
        from flashscore import FlashscoreApi
    except ImportError:
        return []

    try:
        api = FlashscoreApi()
        today_matches = api.get_today_matches()
    except Exception:
        return []

    normalized = []
    for match in today_matches:
        try:
            if hasattr(match, "load_content"):
                match.load_content()
                time.sleep(1)  # rate limiting
            n = _normalize_flashscore_match(match, date_from, date_to)
            if n:
                normalized.append(n)
        except Exception:
            continue
    return normalized


def fetch_fixtures(
    date_from: datetime,
    date_to: datetime,
) -> list[dict[str, Any]]:
    """Busca jogos agendados (fixtures) no período."""
    if not FLASHSCORE_ENABLED:
        return []

    matches = fetch_matches(date_from, date_to)
    scheduled = {"SCHEDULED", "TIMED", "NOT_STARTED"}
    return [m for m in matches if (m.get("status") or "").upper() in scheduled]


def _normalize_flashscore_match(match: Any, date_from: datetime, date_to: datetime) -> dict[str, Any] | None:
    """Converte objeto Match do FlashScore para formato interno."""
    try:
        home_team = getattr(match, "home_team", None) or getattr(match, "homeTeam", None) or "?"
        away_team = getattr(match, "away_team", None) or getattr(match, "awayTeam", None) or "?"
        if callable(home_team):
            home_team = home_team() if callable(home_team) else "?"
        if callable(away_team):
            away_team = away_team() if callable(away_team) else "?"

        date_val = getattr(match, "date", None) or getattr(match, "start_time", None)
        if date_val:
            if hasattr(date_val, "isoformat"):
                date_iso = date_val.isoformat()
            elif isinstance(date_val, (int, float)):
                dt = datetime.fromtimestamp(date_val, tz=timezone.utc)
                date_iso = dt.isoformat().replace("+00:00", "Z")
            else:
                date_iso = str(date_val)
        else:
            return None

        try:
            dt = datetime.fromisoformat(date_iso.replace("Z", "+00:00"))
        except (ValueError, TypeError):
            return None
        if dt < date_from or dt > date_to:
            return None

        home_goals = getattr(match, "home_score", None) or getattr(match, "homeScore", None)
        away_goals = getattr(match, "away_score", None) or getattr(match, "awayScore", None)
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

        mid = getattr(match, "id", None) or getattr(match, "match_id", None) or hash((home_team, away_team, date_iso))
        comp = getattr(match, "competition", None) or getattr(match, "league", None) or ""
        if hasattr(comp, "name"):
            comp = comp.name
        comp_code = getattr(match, "competition_code", None) or ""

        status = getattr(match, "status", None) or "SCHEDULED"
        if isinstance(status, str) and status.upper() in ("FINISHED", "FT", "ENDED"):
            status = "FINISHED"
        elif isinstance(status, str) and status.upper() in ("LIVE", "IN_PLAY"):
            status = "IN_PLAY"
        else:
            status = "SCHEDULED"

        return {
            "id": f"fs_{mid}",
            "home_team": str(home_team),
            "away_team": str(away_team),
            "home_team_id": None,
            "away_team_id": None,
            "home_team_crest": None,
            "away_team_crest": None,
            "competition": str(comp),
            "competition_code": str(comp_code) or "?",
            "date": date_iso,
            "home_goals": home_goals,
            "away_goals": away_goals,
            "status": status,
            "total_goals": (home_goals + away_goals) if home_goals is not None and away_goals is not None else None,
        }
    except Exception:
        return None
