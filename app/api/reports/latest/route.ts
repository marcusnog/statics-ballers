import { NextResponse } from "next/server";
import { readFile, readdir } from "fs/promises";
import { join } from "path";

export async function GET() {
  try {
    const reportsDir = join(process.cwd(), "reports");
    const files = await readdir(reportsDir).catch(() => []);

    const reportFiles = files
      .filter((f) => f.startsWith("relatorio_") && f.endsWith(".md"))
      .sort()
      .reverse();

    if (reportFiles.length === 0) {
      return NextResponse.json({
        content: null,
        date: null,
        message: "Nenhum relatório disponível. Execute 'python main.py' para gerar.",
      });
    }

    const latestFile = reportFiles[0];
    const content = await readFile(
      join(reportsDir, latestFile),
      "utf-8"
    );
    const match = latestFile.match(/relatorio_(\d{4}-\d{2}-\d{2})\.md/);
    const date = match ? match[1] : null;

    return NextResponse.json({ content, date, filename: latestFile });
  } catch (err) {
    console.error("API reports latest error:", err);
    return NextResponse.json(
      { error: "Failed to load report", content: null, date: null },
      { status: 500 }
    );
  }
}
