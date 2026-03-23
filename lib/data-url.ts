/**
 * URLs para carregar dados.
 * Em dev: usa rotas de API (/api/*).
 * Em build estático (GitHub Pages): usa JSON estático (/data/*).
 */
const base = process.env.NEXT_PUBLIC_BASE_PATH || "";
const useStatic = process.env.NEXT_PUBLIC_DATA_SOURCE === "static";

export function metricsUrl(): string {
  return useStatic ? `${base}/data/metrics.json` : "/api/metrics";
}

export function fixturesUrl(): string {
  return useStatic ? `${base}/data/fixtures.json` : "/api/fixtures";
}

export function reportsUrl(): string {
  return useStatic ? `${base}/data/reports.json` : "/api/reports/latest";
}
