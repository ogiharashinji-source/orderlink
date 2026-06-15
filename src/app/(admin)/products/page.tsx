"use client";
import React, { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Product = {
  id: number;
  name: string;
  description: string | null;
  category: string | null;
  sakaMai: string | null;
  seimaiWari: string | null;
  alcohol: string | null;
  price1800: number | null;
  unit1800: string | null;
  stock1800: number | null;
  price720: number | null;
  unit720: string | null;
  stock720: number | null;
};

type Variant = { volume: string; price: number; unit: string; stock: number };

function getVariants(p: Product): Variant[] {
  const list: Variant[] = [];
  if (p.price1800 != null) list.push({ volume: "1800ml", price: p.price1800, unit: p.unit1800 ?? "本", stock: p.stock1800 ?? 0 });
  if (p.price720  != null) list.push({ volume: "720ml",  price: p.price720,  unit: p.unit720  ?? "本", stock: p.stock720  ?? 0 });
  return list;
}

const CSV_HEADERS = "商品名,種別,酒米,精米歩合,アルコール,説明,1800ml単価,1800mlロット,1800ml在庫,720ml単価,720mlロット,720ml在庫";
const CSV_SAMPLE = `山三純米大吟醸,純米大吟醸,山田錦,50,16,フラッグシップ商品,5000,6,20,2800,12,30
山三純米吟醸,純米吟醸,山田錦,55,15,,4000,6,30,2200,12,40
山三純米酒,純米酒,美山錦,60,15,,2500,6,50,,,,
山三本醸造,本醸造,一般米,70,15,,2000,6,60,,,,
山三大吟醸,大吟醸,山田錦,35,17,限定品,8000,6,10,4500,12,20
山三吟醸酒,吟醸酒,五百万石,60,16,,3000,6,30,1800,12,40
山三純米大吟醸 斗瓶,純米大吟醸,愛山,40,17,斗瓶囲い,12000,6,5,,,,
山三にごり酒,純米酒,美山錦,65,13,冬季限定,,,,2000,12,25
山三古酒,純米酒,山田錦,60,18,3年熟成,6000,6,15,3500,12,20
山三リキュール,リキュール,,,12,梅使用,3000,6,20,1800,12,30`;

function downloadTemplate() {
  const bom = "﻿";
  const blob = new Blob([bom + CSV_HEADERS + "\n" + CSV_SAMPLE], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "商品登録フォーマット.csv"; a.click();
  URL.revokeObjectURL(url);
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [importing, setImporting] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [importResult, setImportResult] = useState<{ created: number; errors: string[] } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const allCheckRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const load = useCallback(() => {
    fetch("/api/products").then((r) => r.json()).then((data) => {
      setProducts(data);
      setSelected(new Set());
    });
  }, []);

  useEffect(() => { load(); }, [load]);

  // 全選択チェックボックスのindeterminate状態を管理
  useEffect(() => {
    if (!allCheckRef.current) return;
    const total = products.length;
    allCheckRef.current.indeterminate = selected.size > 0 && selected.size < total;
  }, [selected, products]);

  const toggleAll = () => {
    if (selected.size === products.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(products.map((p) => p.id)));
    }
  };

  const toggleOne = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleCsvImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    setImportResult(null);
    const text = await file.text();
    const res = await fetch("/api/products/import", { method: "POST", body: text });
    const data = await res.json();
    setImportResult(data);
    setImporting(false);
    e.target.value = "";
    if (data.created > 0) load();
  };

  const handleDelete = async (id: number) => {
    if (!confirm("この商品を削除しますか？")) return;
    await fetch(`/api/products/${id}`, { method: "DELETE" });
    load();
  };

  const handleBulkDelete = async () => {
    if (selected.size === 0) return;
    if (!confirm(`選択した${selected.size}件の商品を削除しますか？`)) return;
    setBulkDeleting(true);
    await Promise.all([...selected].map((id) => fetch(`/api/products/${id}`, { method: "DELETE" })));
    setBulkDeleting(false);
    load();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">商品管理</h1>
        <div className="flex items-center gap-2">
          <button onClick={downloadTemplate}
            className="border border-gray-300 text-gray-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50">
            CSVフォーマット
          </button>
          <input ref={fileInputRef} type="file" accept=".csv" style={{ display: "none" }} onChange={handleCsvImport} />
          <button onClick={() => fileInputRef.current?.click()} disabled={importing}
            className={`px-4 py-2 rounded-lg text-sm font-medium text-white ${importing ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"}`}>
            {importing ? "取込中..." : "CSV取込"}
          </button>
          <button
            onClick={handleBulkDelete}
            disabled={selected.size === 0 || bulkDeleting}
            className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-red-500 hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {bulkDeleting ? "削除中..." : selected.size > 0 ? `${selected.size}件を削除` : "一斉削除"}
          </button>
          <Link href="/products/new" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
            + 新規商品
          </Link>
        </div>
      </div>

      {importResult && (
        <div className={`rounded-lg p-4 text-sm ${importResult.errors.length === 0 ? "bg-green-50 border border-green-200" : "bg-yellow-50 border border-yellow-200"}`}>
          <p className="font-medium text-gray-800">{importResult.created}件を登録しました</p>
          {importResult.errors.length > 0 && (
            <ul className="mt-1 text-red-600 list-disc list-inside">
              {importResult.errors.map((e, i) => <li key={i}>{e}</li>)}
            </ul>
          )}
          <button onClick={() => setImportResult(null)} className="mt-2 text-xs text-gray-500 hover:underline">閉じる</button>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
            <tr>
              <th className="px-3 py-3 text-center w-10">
                <input
                  ref={allCheckRef}
                  type="checkbox"
                  checked={products.length > 0 && selected.size === products.length}
                  onChange={toggleAll}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
              </th>
              <th className="px-4 py-3 text-left">商品名</th>
              <th className="px-4 py-3 text-left">種別</th>
              <th className="px-4 py-3 text-left">酒米</th>
              <th className="px-4 py-3 text-center">精米歩合</th>
              <th className="px-4 py-3 text-center">アルコール</th>
              <th className="px-4 py-3 text-center">容量</th>
              <th className="px-4 py-3 text-right">単価</th>
              <th className="px-4 py-3 text-center">ロット</th>
              <th className="px-4 py-3 text-right">在庫</th>
              <th className="px-4 py-3 text-right">操作</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr><td colSpan={11} className="text-center py-8 text-gray-400">商品データがありません</td></tr>
            ) : (
              products.map((p) => {
                const variants = getVariants(p);
                const isChecked = selected.has(p.id);
                if (variants.length === 0) {
                  return (
                    <tr key={p.id} className={`border-t border-gray-100 hover:bg-gray-50 ${isChecked ? "bg-blue-50" : ""}`}>
                      <td className="px-3 py-3 text-center">
                        <input type="checkbox" checked={isChecked} onChange={() => toggleOne(p.id)}
                          className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer" />
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-900">
                        <Link href={`/products/${p.id}/edit`} className="hover:text-blue-600">{p.name}</Link>
                      </td>
                      <td className="px-4 py-3 text-gray-600 text-xs">{p.category ?? "—"}</td>
                      <td className="px-4 py-3 text-gray-600 text-xs">{p.sakaMai ?? "—"}</td>
                      <td className="px-4 py-3 text-center text-gray-600 text-xs">{p.seimaiWari ?? "—"}</td>
                      <td className="px-4 py-3 text-center text-gray-600 text-xs">{p.alcohol ?? "—"}</td>
                      <td className="px-4 py-3 text-center text-gray-400">—</td>
                      <td className="px-4 py-3 text-right text-gray-400">—</td>
                      <td className="px-4 py-3 text-center text-gray-400">—</td>
                      <td className="px-4 py-3 text-right text-gray-400">—</td>
                      <td className="px-4 py-3 text-right space-x-2">
                        <button onClick={() => router.push(`/products/${p.id}/edit`)} className="text-blue-600 hover:underline text-xs">編集</button>
                        <button onClick={() => handleDelete(p.id)} className="text-red-500 hover:underline text-xs">削除</button>
                      </td>
                    </tr>
                  );
                }
                return (
                  <React.Fragment key={p.id}>
                    {variants.map((v, idx) => (
                      <tr
                        key={v.volume}
                        className={`border-t border-gray-100 hover:bg-gray-50 ${isChecked ? "bg-blue-50" : ""} ${
                          idx === variants.length - 1 ? "border-b-2 border-b-gray-200" : ""
                        }`}
                      >
                        {idx === 0 && (
                          <td className="px-3 py-3 text-center align-top" rowSpan={variants.length}>
                            <input type="checkbox" checked={isChecked} onChange={() => toggleOne(p.id)}
                              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer" />
                          </td>
                        )}
                        {idx === 0 && (
                          <td className="px-4 py-3 font-medium text-gray-900 align-top" rowSpan={variants.length}>
                            <Link href={`/products/${p.id}/edit`} className="hover:text-blue-600">{p.name}</Link>
                          </td>
                        )}
                        {idx === 0 && (
                          <td className="px-4 py-3 text-gray-600 text-xs align-top" rowSpan={variants.length}>{p.category ?? "—"}</td>
                        )}
                        {idx === 0 && (
                          <td className="px-4 py-3 text-gray-600 text-xs align-top" rowSpan={variants.length}>{p.sakaMai ?? "—"}</td>
                        )}
                        {idx === 0 && (
                          <td className="px-4 py-3 text-center text-gray-600 text-xs align-top" rowSpan={variants.length}>{p.seimaiWari ?? "—"}</td>
                        )}
                        {idx === 0 && (
                          <td className="px-4 py-3 text-center text-gray-600 text-xs align-top" rowSpan={variants.length}>{p.alcohol ?? "—"}</td>
                        )}
                        <td className="px-4 py-3 text-center">
                          <span className="text-xs font-semibold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{v.volume}</span>
                        </td>
                        <td className="px-4 py-3 text-right font-medium">¥{v.price.toLocaleString()}</td>
                        <td className="px-4 py-3 text-center text-gray-600">{v.unit}</td>
                        <td className="px-4 py-3 text-right">
                          <span className={`font-semibold ${v.stock === 0 ? "text-red-500" : "text-gray-700"}`}>{v.stock}</span>
                        </td>
                        {idx === 0 && (
                          <td className="px-4 py-3 text-right space-x-2 align-top" rowSpan={variants.length}>
                            <button onClick={() => router.push(`/products/${p.id}/edit`)} className="text-blue-600 hover:underline text-xs">編集</button>
                            <button onClick={() => handleDelete(p.id)} className="text-red-500 hover:underline text-xs">削除</button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
