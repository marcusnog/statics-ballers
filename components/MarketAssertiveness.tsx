"use client";

interface MarketRow {
  market: string;
  pct: number | null;
  level: "Muito fácil" | "Fácil" | "Alta confiança" | "Moderado" | "Médio" | "Difícil" | "Muito difícil";
}

interface MarketAssertivenessProps {
  over05: number;
  over15: number;
  favoriteWins: number;
  btts: number;
  over25: number;
  draws: number;
}

function levelStyles(level: string): { badge: string; bar: string } {
  if (level.includes("fácil") || level.includes("Alta"))
    return { badge: "bg-emerald-50 text-emerald-700 border-emerald-200", bar: "bg-emerald-500" };
  if (level.includes("Moderado") || level.includes("Médio"))
    return { badge: "bg-amber-50 text-amber-700 border-amber-200", bar: "bg-amber-500" };
  return { badge: "bg-red-50 text-red-700 border-red-200", bar: "bg-red-500" };
}

function barWidth(pct: number | null): number {
  if (pct == null) return 0;
  return Math.min(100, Math.max(0, pct));
}

export default function MarketAssertiveness({
  over05,
  over15,
  favoriteWins,
  btts,
  over25,
  draws,
}: MarketAssertivenessProps) {
  const rows: MarketRow[] = [
    { market: "Over 0.5 gols (pelo menos 1 gol)", pct: over05, level: "Muito fácil" },
    { market: "Over 1.5 gols (2+ gols)", pct: over15, level: "Fácil" },
    { market: "Vitória do favorito (odds < 1.50)", pct: favoriteWins, level: "Alta confiança" },
    { market: "Ambas marcam — BTTS", pct: btts, level: "Moderado" },
    { market: "Over 2.5 gols (3+ gols)", pct: over25, level: "Moderado" },
    { market: "Total escanteios acima de 9.5", pct: 61, level: "Moderado" },
    { market: "Dupla chance (1X ou X2)", pct: 58, level: "Médio" },
    { market: "Total cartões acima de 3.5", pct: 54, level: "Médio" },
    { market: "Resultado final 1X2", pct: 43, level: "Difícil" },
    { market: "Empate (X)", pct: draws, level: "Difícil" },
    { market: "Placar exato", pct: 8, level: "Muito difícil" },
  ];

  return (
    <section className="animate-slide-up" style={{ animationDelay: "0.1s" }}>
      <h2 className="section-title section-divider">Assertividade por Mercado</h2>
      <p className="section-subtitle">
        Porcentagem de acerto histórico médio com base em resultados reais e odds
      </p>
      <div className="card-base overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table-base">
            <thead>
              <tr>
                <th className="table-th rounded-tl-2xl">Mercado</th>
                <th className="table-th text-right">Assertividade</th>
                <th className="table-th">Nível</th>
                <th className="table-th w-28 rounded-tr-2xl">Indicador</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => {
                const styles = levelStyles(row.level);
                return (
                  <tr
                    key={row.market}
                    className={`border-t border-slate-100 ${i % 2 === 0 ? "bg-white" : "bg-slate-50/30"} table-row-hover`}
                  >
                    <td className="table-td font-medium text-slate-800">{row.market}</td>
                    <td className="table-td text-right font-semibold tabular-nums">
                      {row.pct != null ? `${row.pct}%` : "—"}
                    </td>
                    <td className="table-td">
                      <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-medium border ${styles.badge}`}>
                        {row.level}
                      </span>
                    </td>
                    <td className="table-td">
                      <div className="h-2 w-24 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${styles.bar} transition-all duration-500`}
                          style={{ width: `${barWidth(row.pct)}%` }}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
