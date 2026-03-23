"""Armazenamento de dados - janela móvel (config.METRICS_WINDOW_DAYS)."""
import json
import os
import unicodedata
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any

from config import DATA_DIR, METRICS_WINDOW_DAYS

MATCHES_FILE = DATA_DIR / "matches.json"


def _match_key(m: dict[str, Any]) -> tuple[str, str, str]:
    """Chave para deduplicação: (home_normalized, away_normalized, date_iso)."""
    home = (m.get("home_team") or "?").lower().strip()
    away = (m.get("away_team") or "?").lower().strip()
    date_str = (m.get("date") or "")[:10]
    home = unicodedata.normalize("NFD", home)
    away = unicodedata.normalize("NFD", away)
    home = "".join(c for c in home if unicodedata.category(c) != "Mn")
    away = "".join(c for c in away if unicodedata.category(c) != "Mn")
    return (home, away, date_str)


CREST_FD_PREFIX = "https://crests.football-data.org/"


def _is_fd_crest(url: str | None) -> bool:
    """Indica se o crest é do football-data (mais estável)."""
    return bool(url and CREST_FD_PREFIX in str(url))


def _enrich_record(winner: dict[str, Any], other: dict[str, Any]) -> None:
    """
    Enriquece winner com dados de other.
    Crests do football-data sempre sobrescrevem (mais confiáveis).
    Senão, enriquece só quando winner não tem.
    """
    if _is_fd_crest(other.get("home_team_crest")):
        winner["home_team_crest"] = other["home_team_crest"]
    elif winner.get("home_team_crest") is None and other.get("home_team_crest"):
        winner["home_team_crest"] = other["home_team_crest"]

    if _is_fd_crest(other.get("away_team_crest")):
        winner["away_team_crest"] = other["away_team_crest"]
    elif winner.get("away_team_crest") is None and other.get("away_team_crest"):
        winner["away_team_crest"] = other["away_team_crest"]

    if winner.get("home_goals") is None and other.get("home_goals") is not None:
        winner["home_goals"] = other["home_goals"]
    if winner.get("away_goals") is None and other.get("away_goals") is not None:
        winner["away_goals"] = other["away_goals"]
    if winner.get("total_goals") is None and other.get("total_goals") is not None:
        winner["total_goals"] = other["total_goals"]


def _ensure_fd_crests(record: dict[str, Any]) -> None:
    """
    Se o registro tem team_id do football-data (id fd_) e crest ausente,
    constrói URL a partir do ID.
    """
    mid = record.get("id") or ""
    if not mid.startswith("fd_"):
        return
    hid = record.get("home_team_id")
    aid = record.get("away_team_id")
    if hid is not None and not _is_fd_crest(record.get("home_team_crest")):
        try:
            record["home_team_crest"] = f"{CREST_FD_PREFIX}{int(hid)}.png"
        except (TypeError, ValueError):
            pass
    if aid is not None and not _is_fd_crest(record.get("away_team_crest")):
        try:
            record["away_team_crest"] = f"{CREST_FD_PREFIX}{int(aid)}.png"
        except (TypeError, ValueError):
            pass


def merge_from_multiple_sources(
    list_of_match_lists: list[list[dict[str, Any]]],
    existing: list[dict[str, Any]],
    window_days: int = METRICS_WINDOW_DAYS,
) -> list[dict[str, Any]]:
    """
    Mescla partidas de múltiplas fontes com deduplicação e enriquecimento.
    Ordem da lista = prioridade (primeiro tem prioridade em duplicatas).
    Quando duplicata: enriquece crests e goals se o vencedor não tiver.
    """
    by_key: dict[tuple[str, str, str], dict[str, Any]] = {}
    for m in existing:
        k = _match_key(m)
        by_key[k] = dict(m)

    for matches in list_of_match_lists:
        for m in matches:
            key = _match_key(m)
            dt_str = m.get("date")
            if dt_str:
                try:
                    dt = datetime.fromisoformat(dt_str.replace("Z", "+00:00"))
                    cutoff = (datetime.now(timezone.utc) - timedelta(days=window_days)).replace(tzinfo=None)
                    if dt.replace(tzinfo=None) < cutoff:
                        continue
                except (ValueError, TypeError):
                    pass

            if key in by_key:
                _enrich_record(by_key[key], m)
            else:
                by_key[key] = dict(m)

    merged = list(by_key.values())
    merged.sort(key=lambda x: x.get("date") or "")

    cutoff = (datetime.now(timezone.utc) - timedelta(days=window_days)).replace(tzinfo=None)
    trimmed = []
    for m in merged:
        dt_str = m.get("date")
        if not dt_str:
            trimmed.append(m)
            continue
        try:
            dt = datetime.fromisoformat(dt_str.replace("Z", "+00:00"))
            if dt.replace(tzinfo=None) >= cutoff:
                trimmed.append(m)
        except (ValueError, TypeError):
            trimmed.append(m)

    for m in trimmed:
        _ensure_fd_crests(m)

    return trimmed


def ensure_dirs() -> None:
    """Garante que os diretórios existam."""
    DATA_DIR.mkdir(parents=True, exist_ok=True)


SEED_FILE = DATA_DIR / "seed.json"


def load_matches() -> list[dict[str, Any]]:
    """Carrega partidas do disco. Usa seed se não houver dados."""
    ensure_dirs()
    if MATCHES_FILE.exists():
        try:
            with open(MATCHES_FILE, encoding="utf-8") as f:
                data = json.load(f)
            return data.get("matches", [])
        except (json.JSONDecodeError, IOError):
            pass
    # Fallback: dados de exemplo para primeira execução
    if SEED_FILE.exists():
        try:
            with open(SEED_FILE, encoding="utf-8") as f:
                return json.load(f).get("matches", [])
        except (json.JSONDecodeError, IOError):
            pass
    return []


def save_matches(matches: list[dict[str, Any]]) -> None:
    """Salva partidas no disco (escrita atômica via tmp)."""
    ensure_dirs()
    data = {
        "updated_at": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
        "matches": matches,
    }
    tmp_path = MATCHES_FILE.with_suffix(".json.tmp")
    with open(tmp_path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    os.replace(tmp_path, MATCHES_FILE)


def save_fixtures(path: Path, fixtures: list[dict[str, Any]]) -> None:
    """Salva fixtures no disco (escrita atômica via tmp)."""
    ensure_dirs()
    data = {
        "updated_at": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
        "fixtures": fixtures,
    }
    tmp_path = path.with_name(path.name + ".tmp")
    with open(tmp_path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    os.replace(tmp_path, path)


def merge_and_trim_matches(
    existing: list[dict[str, Any]],
    new_matches: list[dict[str, Any]],
    window_days: int = METRICS_WINDOW_DAYS,
) -> list[dict[str, Any]]:
    """
    Mescla novas partidas com existentes e remove as mais antigas
    que ultrapassam a janela de window_days.
    """
    cutoff = (datetime.now(timezone.utc) - timedelta(days=window_days)).replace(tzinfo=None)
    seen_ids = {m["id"] for m in existing}

    merged = list(existing)

    for m in new_matches:
        mid = m.get("id")
        if not mid or mid in seen_ids:
            continue
        seen_ids.add(mid)

        dt_str = m.get("date")
        if dt_str:
            try:
                dt = datetime.fromisoformat(
                    dt_str.replace("Z", "+00:00")
                )
                if dt.replace(tzinfo=None) < cutoff:
                    continue
            except (ValueError, TypeError):
                pass

        merged.append(m)

    # Ordenar por data e filtrar fora da janela
    def _key(x):
        d = x.get("date") or ""
        return d

    merged.sort(key=_key)

    trimmed = []
    for m in merged:
        dt_str = m.get("date")
        if not dt_str:
            trimmed.append(m)
            continue
        try:
            dt = datetime.fromisoformat(dt_str.replace("Z", "+00:00"))
            if dt.replace(tzinfo=None) >= cutoff:
                trimmed.append(m)
        except (ValueError, TypeError):
            trimmed.append(m)

    return trimmed
