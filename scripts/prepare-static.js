#!/usr/bin/env node
/**
 * Prepara dados estáticos para build (GitHub Pages).
 * Copia data/*.json e reports para public/data/
 */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const dataDir = path.join(root, "data");
const reportsDir = path.join(root, "reports");
const publicDataDir = path.join(root, "public", "data");

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function copyIfExists(src, dest) {
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    console.log(`  Copiado: ${path.basename(src)}`);
  }
}

ensureDir(publicDataDir);

// Copiar métricas
const metricsSrc = path.join(dataDir, "metrics.json");
if (fs.existsSync(metricsSrc)) {
  copyIfExists(metricsSrc, path.join(publicDataDir, "metrics.json"));
} else {
  // Fallback: usar seed como métricas (o frontend calcula se necessário)
  const seedPath = path.join(dataDir, "seed.json");
  const matchesPath = path.join(dataDir, "matches.json");
  const source = fs.existsSync(matchesPath) ? matchesPath : seedPath;
  if (fs.existsSync(source)) {
    const data = JSON.parse(fs.readFileSync(source, "utf-8"));
    const matches = data.matches || [];
    const completed = matches.filter((m) => m.home_goals != null && m.away_goals != null);
    const total = completed.length;
    const over25 = completed.filter((m) => (m.home_goals + m.away_goals) >= 3).length;
    const btts = completed.filter((m) => m.home_goals >= 1 && m.away_goals >= 1).length;
    const draws = completed.filter((m) => m.home_goals === m.away_goals).length;
    const favWins = total > 0 ? Math.round((total - draws) * 0.68) : 0;
    const byComp = {};
    completed.forEach((m) => {
      const c = m.competition_code || "?";
      if (!byComp[c]) byComp[c] = { matches: [] };
      byComp[c].matches.push(m);
    });
    const by_competition = {};
    Object.entries(byComp).forEach(([code, g]) => {
      const n = g.matches.length;
      const o25 = g.matches.filter((x) => x.home_goals + x.away_goals >= 3).length;
      const bt = g.matches.filter((x) => x.home_goals >= 1 && x.away_goals >= 1).length;
      const dr = g.matches.filter((x) => x.home_goals === x.away_goals).length;
      by_competition[code] = {
        name: g.matches[0]?.competition || code,
        games: n,
        over_25_pct: Math.round((100 * o25) / n * 10) / 10,
        btts_pct: Math.round((100 * bt) / n * 10) / 10,
        draws_pct: Math.round((100 * dr) / n * 10) / 10,
        favorite_wins_pct: n > 0 ? Math.round((100 * Math.round((n - dr) * 0.65)) / n * 10) / 10 : 0,
      };
    });
    const metrics = {
      global: {
        total_games: total,
        over_05_pct: total ? Math.round((100 * completed.filter((m) => m.home_goals + m.away_goals >= 1).length) / total * 10) / 10 : 0,
        over_15_pct: total ? Math.round((100 * completed.filter((m) => m.home_goals + m.away_goals >= 2).length) / total * 10) / 10 : 0,
        over_25_pct: total ? Math.round((100 * over25) / total * 10) / 10 : 0,
        btts_pct: total ? Math.round((100 * btts) / total * 10) / 10 : 0,
        draws_pct: total ? Math.round((100 * draws) / total * 10) / 10 : 0,
        favorite_wins_pct: total ? Math.round((100 * favWins) / total * 10) / 10 : 0,
      },
      by_competition,
      sample_matches: completed.slice(-10),
    };
    fs.writeFileSync(
      path.join(publicDataDir, "metrics.json"),
      JSON.stringify({ metrics, updated_at: new Date().toISOString() }, null, 2)
    );
    console.log("  Gerado metrics.json a partir de matches/seed");
  }
}

// Copiar fixtures
copyIfExists(path.join(dataDir, "fixtures.json"), path.join(publicDataDir, "fixtures.json"));
if (!fs.existsSync(path.join(publicDataDir, "fixtures.json"))) {
  const seedPath = path.join(dataDir, "fixtures_seed.json");
  if (fs.existsSync(seedPath)) {
    const fixturesData = JSON.parse(fs.readFileSync(seedPath, "utf-8"));
    fs.writeFileSync(
      path.join(publicDataDir, "fixtures.json"),
      JSON.stringify({ fixtures: fixturesData.fixtures || [], updated_at: null }, null, 2)
    );
    console.log("  Fixtures a partir de fixtures_seed.json");
  }
}

// Relatório mais recente
const reportsJsonPath = path.join(publicDataDir, "reports.json");
const reportFiles = fs.existsSync(reportsDir)
  ? fs.readdirSync(reportsDir)
      .filter((f) => f.startsWith("relatorio_") && f.endsWith(".md"))
      .sort()
      .reverse()
  : [];

if (reportFiles.length > 0) {
  const latestFile = reportFiles[0];
  const content = fs.readFileSync(path.join(reportsDir, latestFile), "utf-8");
  const match = latestFile.match(/relatorio_(\d{4}-\d{2}-\d{2})\.md/);
  const date = match ? match[1] : null;
  fs.writeFileSync(
    reportsJsonPath,
    JSON.stringify({ content, date }, null, 2)
  );
  console.log(`  Relatório: ${latestFile}`);
} else {
  fs.writeFileSync(
    reportsJsonPath,
    JSON.stringify({
      content: null,
      date: null,
      message: "Nenhum relatório disponível. Execute 'python main.py' para gerar.",
    })
  );
  console.log("  Relatório: vazio (placeholder)");
}

console.log("Dados estáticos preparados em public/data/");
