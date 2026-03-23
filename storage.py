"""Armazenamento de dados - janela móvel (config.METRICS_WINDOW_DAYS)."""
import json
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


def merge_from_multiple_sources(
    list_of_match_lists: list[list[dict[str, Any]]],
    existing: list[dict[str, Any]],
    window_days: int = METRICS_WINDOW_DAYS,
) -> list[dict[str, Any]]:
    """
    Mescla partidas de múltiplas fontes com deduplicação.
    Ordem da lista = prioridade (primeiro tem prioridade em duplicatas).
    """
    seen_keys: set[tuple[str, str, str]] = set()
    merged = list(existing)
    for m in existing:
        seen_keys.add(_match_key(m))

    for matches in list_of_match_lists:
        for m in matches:
            key = _match_key(m)
            if key in seen_keys:
                continue
            seen_keys.add(key)
            dt_str = m.get("date")
            if dt_str:
                try:
                    dt = datetime.fromisoformat(dt_str.replace("Z", "+00:00"))
                    cutoff = (datetime.now(timezone.utc) - timedelta(days=window_days)).replace(tzinfo=None)
                    if dt.replace(tzinfo=None) < cutoff:
                        continue
                except (ValueError, TypeError):
                    pass
            merged.append(m)

    def _key(x):
        return x.get("date") or ""

    merged.sort(key=_key)

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
    """Salva partidas no disco."""
    ensure_dirs()
    data = {
        "updated_at": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
        "matches": matches,
    }
    with open(MATCHES_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


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
