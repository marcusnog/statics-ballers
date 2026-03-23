"""Notificações opcionais (Telegram)."""
from pathlib import Path

import requests

from config import TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID, OUTPUT_DIR


def send_telegram(message: str) -> bool:
    """Envia mensagem via Telegram."""
    if not TELEGRAM_BOT_TOKEN or not TELEGRAM_CHAT_ID:
        return False

    url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
    payload = {
        "chat_id": TELEGRAM_CHAT_ID,
        "text": message,
        "parse_mode": "Markdown",
        "disable_web_page_preview": True,
    }

    try:
        resp = requests.post(url, json=payload, timeout=10)
        resp.raise_for_status()
        return True
    except requests.RequestException:
        return False


def notify_report_generated(
    report_path: Path,
    games_count: int,
) -> None:
    """Notifica que o relatório foi gerado."""
    msg = (
        "📊 *Estatísticas de Apostas* — Relatório diário gerado\n\n"
        f"• Jogos analisados: {games_count}\n"
        f"• Arquivo: `{report_path.name}`"
    )
    send_telegram(msg)
