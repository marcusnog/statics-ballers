"use client";

export default function LegalNotice() {
  return (
    <section className="mb-8">
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 text-sm text-slate-600">
        <h3 className="font-semibold text-slate-800 mb-2">Aviso Legal</h3>
        <p>
          As estatísticas apresentadas são tendências históricas baseadas em dados públicos de resultados
          e odds de casas de apostas.{" "}
          <strong>Apostas esportivas envolvem risco financeiro real.</strong> Passado não garante
          resultados futuros. Jogue com responsabilidade.
        </p>
        <p className="mt-2 text-slate-500">
          Fontes: SportRadar · Betano · bet365 · Betclic · football-data.org · the-odds-api.com
        </p>
      </div>
    </section>
  );
}
