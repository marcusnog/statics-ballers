import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

export async function GET() {
  try {
    const dataDir = join(process.cwd(), "data");
    const fixturesPath = join(dataDir, "fixtures.json");
    const seedPath = join(dataDir, "fixtures_seed.json");

    if (existsSync(fixturesPath)) {
      const content = await readFile(fixturesPath, "utf-8");
      const data = JSON.parse(content);
      return NextResponse.json(data);
    }

    if (existsSync(seedPath)) {
      const content = await readFile(seedPath, "utf-8");
      const data = JSON.parse(content);
      return NextResponse.json({
        fixtures: data.fixtures ?? [],
        updated_at: null,
      });
    }

    return NextResponse.json({ fixtures: [], updated_at: null });
  } catch (err) {
    console.error("API fixtures error:", err);
    return NextResponse.json(
      { error: "Failed to load fixtures" },
      { status: 500 }
    );
  }
}
