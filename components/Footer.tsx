"use client";

export default function Footer() {
  return (
    <footer className="border-t border-slate-200/80 bg-white/60 backdrop-blur-sm mt-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-slate-700">
              Estatics Ballers — Estatísticas de Apostas
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Fontes: SportRadar · Betano · bet365 · football-data.org · the-odds-api.com
            </p>
          </div>
          <div className="text-sm text-slate-600 max-w-md">
            <p className="font-medium text-slate-700 mb-1">Aviso Legal</p>
            <p>
              As estatísticas são tendências históricas. Apostas envolvem risco financeiro real.
              Passado não garante resultados futuros. Jogue com responsabilidade.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
