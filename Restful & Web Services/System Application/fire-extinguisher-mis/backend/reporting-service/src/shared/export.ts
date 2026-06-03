import fs from "fs";
import path from "path";
import { Parser } from "json2csv";
import PDFDocument from "pdfkit";
import { env } from "../config/env";

const exportDir = path.resolve(process.cwd(), env.exportDir);

export function ensureExportDir(): string {
  if (!fs.existsSync(exportDir)) {
    fs.mkdirSync(exportDir, { recursive: true });
  }
  return exportDir;
}

export function getExportDir(): string {
  return exportDir;
}

export function generateCsv(
  rows: Record<string, unknown>[],
  filePrefix: string
): string {
  ensureExportDir();
  const fileName = `${filePrefix}-${Date.now()}.csv`;
  const filePath = path.join(exportDir, fileName);
  const parser = new Parser();
  const csv = rows.length ? parser.parse(rows) : "";
  fs.writeFileSync(filePath, csv, "utf8");
  return fileName;
}

export interface PdfSection {
  heading: string;
  lines: string[];
}

export function generatePdf(
  title: string,
  sections: PdfSection[],
  filePrefix: string
): Promise<string> {
  ensureExportDir();
  const fileName = `${filePrefix}-${Date.now()}.pdf`;
  const filePath = path.join(exportDir, fileName);

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 40, size: "A4" });
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    doc.fontSize(20).text(title, { align: "center" });
    doc.moveDown(0.5);
    doc
      .fontSize(10)
      .fillColor("#666")
      .text(`Generated: ${new Date().toISOString()}`, { align: "center" });
    doc.moveDown(1).fillColor("#000");

    for (const section of sections) {
      doc.moveDown(0.5).fontSize(14).text(section.heading, { underline: true });
      doc.moveDown(0.25).fontSize(11);
      for (const line of section.lines) {
        doc.text(line);
      }
    }

    doc.end();
    stream.on("finish", () => resolve(fileName));
    stream.on("error", reject);
  });
}
