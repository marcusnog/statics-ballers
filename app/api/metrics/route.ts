import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";
import { calculateMetrics, type Match } from "@/lib/metrics";

export async function GET() {
  try {
    const dataDir = join(process.cwd(), "data");
    const metricsPath = join(dataDir, "metrics.json");

    if (existsSync(metricsPath)) {
      const content = await readFile(metricsPath, "utf-8");
      const data = JSON.parse(content);
      return NextResponse.json(data);
    }

    const matchesPath = join(dataDir, "matches.json");
    const seedPath = join(dataDir, "seed.json");
    let matches: Match[] = [];

    if (existsSync(matchesPath)) {
      const content = await readFile(matchesPath, "utf-8");
      const data = JSON.parse(content);
      matches = data.matches ?? [];
    } else if (existsSync(seedPath)) {
      const content = await readFile(seedPath, "utf-8");
      const data = JSON.parse(content);
      matches = data.matches ?? [];
    }

    const metrics = calculateMetrics(matches);
    return NextResponse.json({
      updated_at: new Date().toISOString(),
      metrics,
    });
  } catch (err) {
    console.error("API metrics error:", err);
    return NextResponse.json(
      { error: "Failed to load metrics" },
      { status: 500 }
    );
  }
}
