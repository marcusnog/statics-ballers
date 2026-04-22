"use client";

const SOURCES = ["football-data.org", "the-odds-api.com", "SportRadar", "bet365"];

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-slate-200/80 bg-white/60 backdrop-blur-sm">
      {/* Green top accent */}
      <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-emerald-400/40 to-transparent" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-8">

          {/* Brand block */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-[0_2px_6px_rgba(16,185,129,0.3)]">
                <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2}>
                  <circle cx="12" cy="12" r="9" />
                  <path d="M3 12h18M12 3c0 0-3 4-3 9s3 9 3 9" strokeLinecap="round" />
                </svg>
              </div>
              <span className="font-bold text-slate-800">Estatics Ballers</span>
            </div>
            <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
              Análise estatística de apostas esportivas em futebol europeu e sul-americano.
            </p>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {SOURCES.map((s) => (
                <span key={s} className="text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* Legal notice */}
          <div className="sm:max-w-xs">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-4 h-4 text-amber-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span className="text-sm font-semibold text-slate-700">Aviso Legal</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              As estatísticas são tendências históricas. Apostas envolvem risco financeiro real.
              Passado não garante resultados futuros.{" "}
              <span className="font-semibold text-slate-600">Jogue com responsabilidade.</span>
            </p>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <p className="text-xs text-slate-400">
            © {new Date().getFullYear()} Estatics Ballers. Dados para fins informativos.
          </p>
          <p className="text-xs text-slate-400">
            Janela móvel de 30 dias · Atualizado automaticamente
          </p>
        </div>
      </div>
    </footer>
  );
}
