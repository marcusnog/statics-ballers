import { NextResponse } from "next/server";
import { readdir } from "fs/promises";
import { join } from "path";

export async function GET() {
  try {
    const reportsDir = join(process.cwd(), "reports");
    const files = await readdir(reportsDir).catch(() => []);

    const reports = files
      .filter((f) => f.startsWith("relatorio_") && f.endsWith(".md"))
      .map((f) => {
        const match = f.match(/relatorio_(\d{4}-\d{2}-\d{2})\.md/);
        return {
          filename: f,
          date: match ? match[1] : null,
        };
      })
      .filter((r) => r.date)
      .sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""));

    return NextResponse.json({ reports });
  } catch (err) {
    console.error("API reports list error:", err);
    return NextResponse.json({ reports: [] });
  }
}
