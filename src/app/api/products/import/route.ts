import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminCompanyId } from "@/lib/adminAuth";

// BOM除去 + \r\n / \r / \n すべて対応、引用符フィールド対応
function parseCSV(text: string): string[][] {
  const cleaned = text.replace(/^﻿/, "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const rows: string[][] = [];
  for (const line of cleaned.split("\n")) {
    if (!line.trim()) continue;
    const cols: string[] = [];
    let cur = "";
    let inQuote = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuote && line[i + 1] === '"') { cur += '"'; i++; }
        else inQuote = !inQuote;
      } else if (ch === "," && !inQuote) {
        cols.push(cur.trim()); cur = "";
      } else {
        cur += ch;
      }
    }
    cols.push(cur.trim());
    rows.push(cols);
  }
  return rows;
}

export async function POST(req: NextRequest) {
  const companyId = await getAdminCompanyId(req);
  if (!companyId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const text = await req.text();
  const rows = parseCSV(text);

  if (rows.length < 2) return NextResponse.json({ error: "データがありません" }, { status: 400 });

  const dataRows = rows.slice(1); // ヘッダー行をスキップ
  const created: number[] = [];
  const errors: string[] = [];

  for (let i = 0; i < dataRows.length; i++) {
    const [
      name, category, sakaMai, seimaiWari, alcohol, description,
      price1800Raw, unit1800, stock1800Raw,
      price720Raw, unit720, stock720Raw,
    ] = dataRows[i];

    if (!name) continue;

    const price1800 = price1800Raw ? parseFloat(price1800Raw) : null;
    const stock1800 = stock1800Raw ? parseInt(stock1800Raw) : null;
    const price720  = price720Raw  ? parseFloat(price720Raw)  : null;
    const stock720  = stock720Raw  ? parseInt(stock720Raw)  : null;

    try {
      const p = await prisma.product.create({
        data: {
          companyId,
          name,
          category:    category    || null,
          sakaMai:     sakaMai     || null,
          seimaiWari:  seimaiWari  || null,
          alcohol:     alcohol     || null,
          description: description || null,
          price1800,
          unit1800:    unit1800    || null,
          stock1800,
          price720,
          unit720:     unit720     || null,
          stock720,
        },
      });
      created.push(p.id);
    } catch {
      errors.push(`${i + 2}行目: 登録に失敗しました（${name}）`);
    }
  }

  return NextResponse.json({ created: created.length, errors });
}
