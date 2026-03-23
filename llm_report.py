"""Geração de relatório Markdown via LLM (OpenAI ou Anthropic)."""
from datetime import datetime
from typing import Any

from config import (
    LLM_PROVIDER,
    OPENAI_API_KEY,
    ANTHROPIC_API_KEY,
    GROQ_API_KEY,
)

SYSTEM_PROMPT = """Você é um analista especializado em estatísticas de apostas esportivas de futebol.
Seu papel é processar os dados fornecidos e apresentar um relatório atualizado no formato especificado.

CAMPEONATOS MONITORADOS: Premier League, La Liga, Bundesliga, Serie A, Ligue 1, Champions League.

FORMATO DE SAÍDA OBRIGATÓRIO (Markdown):
a) Resumo executivo (3–5 bullets)
b) Tabela de assertividade por mercado (baseada nos dados)
c) Comparativo por liga (tabela)
d) Top 5 partidas do dia/amanhã com melhor relação risco/retorno (se houver fixtures)
e) Mercados em tendência (alta ou queda vs. média histórica)
f) Alertas (zebras recentes, anomalias)
g) Aviso legal ao final

REGRAS:
- Nunca recomendar apostas como certeza
- Apresentar percentuais como base estatística, não previsão garantida
- Incluir aviso de jogo responsável
- Data de atualização no topo
- Fontes citadas"""


def _build_user_prompt(data: dict[str, Any]) -> str:
    hoje = datetime.now().strftime("%d/%m/%Y")
    metrics = data.get("metrics", {})
    fixtures = data.get("fixtures", [])
    sample = metrics.get("sample_matches", [])
    global_m = metrics.get("global", {})
    by_comp = metrics.get("by_competition", {})

    parts = [
        f"Execute a análise diária. DATA DE HOJE: {hoje}\n",
        "## Dados coletados (janela móvel 30 dias)\n",
        f"- Total de jogos com resultado: {global_m.get('total_games', 0)}",
        f"- Over 0.5 gols: {global_m.get('over_05_pct', 0)}%",
        f"- Over 1.5 gols: {global_m.get('over_15_pct', 0)}%",
        f"- Over 2.5 gols: {global_m.get('over_25_pct', 0)}%",
        f"- Ambas marcam (BTTS): {global_m.get('btts_pct', 0)}%",
        f"- Empates: {global_m.get('draws_pct', 0)}%",
        "",
        "### Por competição:",
    ]

    for code, c in by_comp.items():
        parts.append(
            f"- {c.get('name', code)}: Over 2.5={c.get('over_25_pct')}%, "
            f"BTTS={c.get('btts_pct')}%, Favorito={c.get('favorite_wins_pct')}%"
        )

    if sample:
        parts.extend(["", "### Últimos jogos (destaques):"])
        for m in sample[-5:]:
            h = m.get("home_team", "?")
            a = m.get("away_team", "?")
            hg = m.get("home_goals", "-")
            ag = m.get("away_goals", "-")
            comp = m.get("competition", "")
            parts.append(f"- {h} {hg}-{ag} {a} ({comp})")

    if fixtures:
        parts.extend(["", "### Próximos jogos (fixtures):"])
        for f in fixtures[:15]:
            ht = f.get("home_team", "?")
            at = f.get("away_team", "?")
            comp = f.get("competition", "")
            dt = f.get("date", "")[:16] if f.get("date") else ""
            parts.append(f"- {ht} vs {at} ({comp}) - {dt}")

    parts.extend([
        "",
        "---",
        "Gere o relatório completo em Markdown seguindo o formato definido. "
        "Use os percentuais históricos do documento original como referência quando os dados "
        "coletados forem insuficientes. Destaque partidas com melhor encaixe estatístico."
    ])

    return "\n".join(parts)


def generate_report(data: dict[str, Any]) -> str:
    """Gera relatório Markdown via LLM."""
    user_prompt = _build_user_prompt(data)

    if LLM_PROVIDER == "groq" and GROQ_API_KEY:
        return _call_groq(user_prompt)
    if LLM_PROVIDER == "anthropic" and ANTHROPIC_API_KEY:
        return _call_anthropic(user_prompt)
    if OPENAI_API_KEY:
        return _call_openai(user_prompt)

    # Fallback: relatório básico sem LLM
    return _fallback_report(data)


def _call_groq(user_prompt: str) -> str:
    """Chama Groq via API compatível com OpenAI."""
    from openai import OpenAI

    client = OpenAI(
        base_url="https://api.groq.com/openai/v1",
        api_key=GROQ_API_KEY,
    )
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt},
        ],
        temperature=0.3,
    )
    return response.choices[0].message.content or ""


def _call_openai(user_prompt: str) -> str:
    from openai import OpenAI

    client = OpenAI(api_key=OPENAI_API_KEY)
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt},
        ],
        temperature=0.3,
    )
    return response.choices[0].message.content or ""


def _call_anthropic(user_prompt: str) -> str:
    from anthropic import Anthropic

    client = Anthropic(api_key=ANTHROPIC_API_KEY)
    message = client.messages.create(
        model="claude-3-5-haiku-20241022",
        max_tokens=4096,
        system=SYSTEM_PROMPT,
        messages=[{"role": "user", "content": user_prompt}],
    )
    return message.content[0].text if message.content else ""


def _fallback_report(data: dict[str, Any]) -> str:
    """Relatório básico quando não há API de LLM configurada."""
    hoje = datetime.now().strftime("%d/%m/%Y")
    m = data.get("metrics", {}).get("global", {})
    by_comp = data.get("metrics", {}).get("by_competition", {})

    lines = [
        "# Estatísticas de Apostas — Relatório Diário",
        f"> **Atualizado em:** {hoje}",
        "",
        "## Visão Geral",
        "",
        "| Indicador | Valor |",
        "|---|---|",
        f"| Jogos analisados | {m.get('total_games', 0)} |",
        f"| Over 0.5 gols | {m.get('over_05_pct', 0)}% |",
        f"| Over 2.5 gols | {m.get('over_25_pct', 0)}% |",
        f"| Ambas marcam (BTTS) | {m.get('btts_pct', 0)}% |",
        "",
        "## Por Liga",
        "",
        "| Liga | Over 2.5 | BTTS |",
        "|---|---|---|",
    ]

    for code, c in by_comp.items():
        lines.append(f"| {c.get('name', code)} | {c.get('over_25_pct')}% | {c.get('btts_pct')}% |")

    lines.extend([
        "",
        "---",
        "",
        "> **Aviso:** Configure GROQ_API_KEY, OPENAI_API_KEY ou ANTHROPIC_API_KEY no .env para gerar relatórios completos com IA.",
        "",
        "> As estatísticas são tendências históricas. Apostas envolvem risco. Jogue com responsabilidade.",
    ])

    return "\n".join(lines)
