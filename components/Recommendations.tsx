"use client";

const RECOMMENDATIONS = [
  {
    title: "Para iniciantes",
    items: [
      "Over 0.5 / Over 1.5 gols — alta frequência de acerto, boa relação risco/retorno",
      "Vitória do favorito em jogos com odds abaixo de 1.50 (UCL e Bundesliga)",
      "Ambas marcam (BTTS) — especialmente em Premier League e Bundesliga",
    ],
    color: "emerald",
  },
  {
    title: "Para experientes",
    items: [
      "Handicap asiático — menor margem da casa, exige análise aprofundada",
      "Escanteios por liga — La Liga e Libertadores têm médias altas e consistentes",
    ],
    color: "blue",
  },
  {
    title: "Evitar",
    items: [
      "Placar exato — margem de 15–25%, probabilidade de acerto abaixo de 10%",
      "Empate isolado — apenas ~26% de frequência, raramente justifica o risco",
    ],
    color: "red",
  },
];

const COLOR_MAP = {
  emerald: {
    bg: "bg-emerald-50/80",
    border: "border-emerald-200",
    title: "text-emerald-800",
    icon: "bg-emerald-500",
    list: "text-emerald-700",
  },
  blue: {
    bg: "bg-blue-50/80",
    border: "border-blue-200",
    title: "text-blue-800",
    icon: "bg-blue-500",
    list: "text-blue-700",
  },
  red: {
    bg: "bg-red-50/80",
    border: "border-red-200",
    title: "text-red-800",
    icon: "bg-red-500",
    list: "text-red-700",
  },
};

export default function Recommendations() {
  return (
    <section id="recomendacoes" className="scroll-mt-24 animate-slide-up" style={{ animationDelay: "0.3s" }}>
      <h2 className="section-title section-divider">Recomendações Estratégicas</h2>
      <p className="section-subtitle">
        Mercados indicados por perfil de apostador
      </p>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {RECOMMENDATIONS.map((rec) => {
          const c = COLOR_MAP[rec.color as keyof typeof COLOR_MAP];
          return (
            <div
              key={rec.title}
              className={`card-base p-5 border ${c.border} ${c.bg}`}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-2 h-8 rounded-full ${c.icon}`} />
                <h3 className={`font-semibold ${c.title}`}>{rec.title}</h3>
              </div>
              <ul className={`space-y-2 text-sm ${c.list}`}>
                {rec.items.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="text-slate-400 mt-1.5">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </section>
  );
}
