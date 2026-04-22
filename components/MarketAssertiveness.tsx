"use client";

interface MarketRow {
  market: string;
  icon: string;
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

function levelConfig(level: string): {
  badge: string;
  bar: string;
  dot: string;
} {
  if (level.includes("fácil") || level.includes("Alta"))
    return {
      badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
      bar: "from-emerald-400 to-emerald-600",
      dot: "bg-emerald-500",
    };
  if (level.includes("Moderado") || level.includes("Médio"))
    return {
      badge: "bg-amber-50 text-amber-700 border-amber-200",
      bar: "from-amber-400 to-amber-500",
      dot: "bg-amber-500",
    };
  return {
    badge: "bg-red-50 text-red-600 border-red-200",
    bar: "from-red-400 to-rose-500",
    dot: "bg-red-400",
  };
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
    { market: "Over 0.5 gols (pelo menos 1 gol)", icon: "⚽", pct: over05, level: "Muito fácil" },
    { market: "Over 1.5 gols (2+ gols)", icon: "📈", pct: over15, level: "Fácil" },
    { market: "Vitória do favorito (odds < 1.50)", icon: "🏆", pct: favoriteWins, level: "Alta confiança" },
    { market: "Ambas marcam — BTTS", icon: "🎯", pct: btts, level: "Moderado" },
    { market: "Over 2.5 gols (3+ gols)", icon: "🔥", pct: over25, level: "Moderado" },
    { market: "Total escanteios acima de 9.5", icon: "🚩", pct: 61, level: "Moderado" },
    { market: "Dupla chance (1X ou X2)", icon: "🛡️", pct: 58, level: "Médio" },
    { market: "Total cartões acima de 3.5", icon: "🟨", pct: 54, level: "Médio" },
    { market: "Resultado final 1X2", icon: "📊", pct: 43, level: "Difícil" },
    { market: "Empate (X)", icon: "🤝", pct: draws, level: "Difícil" },
    { market: "Placar exato", icon: "🎲", pct: 8, level: "Muito difícil" },
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
                <th className="table-th text-right w-20">Acerto</th>
                <th className="table-th w-32">Nível</th>
                <th className="table-th w-36 rounded-tr-2xl">Indicador</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => {
                const cfg = levelConfig(row.level);
                const width = row.pct != null ? Math.min(100, Math.max(0, row.pct)) : 0;
                return (
                  <tr
                    key={row.market}
                    className={`border-t border-slate-100 ${i % 2 === 0 ? "bg-white" : "bg-slate-50/40"} table-row-hover`}
                  >
                    <td className="table-td">
                      <div className="flex items-center gap-2.5">
                        <span className="text-base shrink-0 select-none" aria-hidden>{row.icon}</span>
                        <span className="font-medium text-slate-800">{row.market}</span>
                      </div>
                    </td>
                    <td className="table-td text-right">
                      <span className="font-bold text-slate-900 tabular-nums text-base">
                        {row.pct != null ? `${row.pct}%` : "—"}
                      </span>
                    </td>
                    <td className="table-td">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.badge}`}>
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot}`} />
                        {row.level}
                      </span>
                    </td>
                    <td className="table-td">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2.5 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className={`h-full rounded-full bg-gradient-to-r ${cfg.bar} animate-bar-grow`}
                            style={{ width: `${width}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium tabular-nums w-6 shrink-0">
                          {width}
                        </span>
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
