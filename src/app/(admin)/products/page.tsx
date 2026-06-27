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
  published: boolean;
  price1800: number | null;
  wholesalePrice1800: number | null;
  unit1800: string | null;
  stock1800: number | null;
  price720: number | null;
  wholesalePrice720: number | null;
  unit720: string | null;
  stock720: number | null;
  volumeOther: string | null;
  priceOther: number | null;
  wholesalePriceOther: number | null;
  unitOther: string | null;
  stockOther: number | null;
};

type Variant = { volume: string; price: number; wholesalePrice: number | null; unit: string; stock: number | null };

function getVariants(p: Product): Variant[] {
  const list: Variant[] = [];
  if (p.price1800 != null) list.push({ volume: "1800ml", price: p.price1800, wholesalePrice: p.wholesalePrice1800, unit: p.unit1800 ?? "本", stock: p.stock1800 });
  if (p.price720  != null) list.push({ volume: "720ml",  price: p.price720,  wholesalePrice: p.wholesalePrice720,  unit: p.unit720  ?? "本", stock: p.stock720  });
  if (p.priceOther != null && p.volumeOther) {
    const vol = p.volumeOther.endsWith("ml") ? p.volumeOther : `${p.volumeOther}ml`;
    list.push({ volume: vol, price: p.priceOther, wholesalePrice: p.wholesalePriceOther, unit: p.unitOther ?? "本", stock: p.stockOther });
  }
  return list;
}


export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);
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

  const handleTogglePublished = async (id: number, current: boolean) => {
    const msg = current ? "この商品を非公開にしますか？\n発注ポータルに表示されなくなります。" : "この商品を公開しますか？\n発注ポータルに表示されます。";
    if (!confirm(msg)) return;
    await fetch(`/api/products/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published: !current }),
    });
    load();
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

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full text-sm whitespace-nowrap">
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
              <th className="px-4 py-3 text-center">小売値</th>
              <th className="px-4 py-3 text-center">卸売値</th>
              <th className="px-4 py-3 text-center">ロット</th>
              <th className="px-4 py-3 text-right">限定</th>
              <th className="px-4 py-3 text-center">公開</th>
              <th className="px-4 py-3 text-right">操作</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr><td colSpan={13} className="text-center py-8 text-gray-400">商品データがありません</td></tr>
            ) : (
              products.map((p, productIdx) => {
                const variants = getVariants(p);
                const isChecked = selected.has(p.id);
                const rowBg = isChecked ? "bg-blue-50" : productIdx % 2 === 1 ? "bg-gray-50" : "bg-white";
                if (variants.length === 0) {
                  return (
                    <tr key={p.id} className={`border-t border-gray-100 ${rowBg}`}>
                      <td className="px-3 py-3 text-center">
                        <input type="checkbox" checked={isChecked} onChange={() => toggleOne(p.id)}
                          className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer" />
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {p.name}
                      </td>
                      <td className="px-4 py-3 text-gray-600 text-xs">{p.category ?? "—"}</td>
                      <td className="px-4 py-3 text-gray-600 text-xs">{p.sakaMai ?? "—"}</td>
                      <td className="px-4 py-3 text-center text-gray-600 text-xs">{p.seimaiWari ?? "—"}</td>
                      <td className="px-4 py-3 text-center text-gray-600 text-xs">{p.alcohol ?? "—"}</td>
                      <td className="px-4 py-3 text-center text-gray-400">—</td>
                      <td className="px-4 py-3 text-center text-gray-400">—</td>
                      <td className="px-4 py-3 text-center text-gray-400">—</td>
                      <td className="px-4 py-3 text-center text-gray-400">—</td>
                      <td className="px-4 py-3 text-right text-gray-400">—</td>
                      <td className="px-4 py-3 text-center">
                        <button onClick={() => handleTogglePublished(p.id, p.published)}
                          className={`text-xs font-medium px-2 py-0.5 rounded-full ${p.published ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
                          {p.published ? "公開中" : "非公開"}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => router.push(`/products/${p.id}/edit`)} className="text-blue-600 hover:underline text-xs">編集</button>
                      </td>
                    </tr>
                  );
                }
                return (
                  <React.Fragment key={p.id}>
                    {variants.map((v, idx) => (
                      <tr
                        key={v.volume}
                        className={`border-t border-gray-100 ${rowBg} ${
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
                            {p.name}
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
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${v.volume === "1800ml" ? "bg-amber-100 text-amber-700" : v.volume === "720ml" ? "bg-sky-100 text-sky-700" : "bg-purple-100 text-purple-700"}`}>{v.volume}</span>
                        </td>
                        <td className="px-4 py-3 text-center text-sm font-medium text-gray-700">¥{v.price.toLocaleString()}</td>
                        <td className="px-4 py-3 text-center text-sm font-medium text-gray-700">{v.wholesalePrice != null ? `¥${v.wholesalePrice.toLocaleString()}` : "—"}</td>
                        <td className="px-4 py-3 text-center text-gray-600">{v.unit}</td>
                        <td className="px-4 py-3 text-right">
                          <span className="font-semibold text-gray-700">{v.stock != null && v.stock !== 0 ? v.stock : ""}</span>
                        </td>
                        {idx === 0 && (
                          <td className="px-4 py-3 text-center align-top" rowSpan={variants.length}>
                            <button onClick={() => handleTogglePublished(p.id, p.published)}
                              className={`text-xs font-medium px-2 py-0.5 rounded-full ${p.published ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
                              {p.published ? "公開中" : "非公開"}
                            </button>
                          </td>
                        )}
                        {idx === 0 && (
                          <td className="px-4 py-3 text-right align-top" rowSpan={variants.length}>
                            <button onClick={() => router.push(`/products/${p.id}/edit`)} className="text-blue-600 hover:underline text-xs">編集</button>
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
