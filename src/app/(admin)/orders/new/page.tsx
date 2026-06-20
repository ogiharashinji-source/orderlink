"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Customer = { id: number; name: string; company: string | null };
type Product = {
  id: number; name: string; category: string | null; sakaMai: string | null;
  price1800: number | null; price720: number | null;
  wholesalePrice1800: number | null; wholesalePrice720: number | null;
  unit1800: string | null; unit720: string | null;
  stock1800: number | null; stock720: number | null;
};

type LineItem = { productId: number; volume: "1800ml" | "720ml"; qty: number };

export default function NewOrderPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customerId, setCustomerId] = useState("");
  const [lines, setLines] = useState<Record<string, number>>({});
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/customers").then((r) => r.json()).then(setCustomers);
    fetch("/api/products").then((r) => r.json()).then(setProducts);
  }, []);

  const key = (productId: number, volume: string) => `${productId}_${volume}`;
  const setQty = (productId: number, volume: string, val: number) =>
    setLines((p) => ({ ...p, [key(productId, volume)]: Math.max(0, val) }));
  const getQty = (productId: number, volume: string) => lines[key(productId, volume)] ?? 0;

  const getLot = (p: Product, volume: string) =>
    parseInt(volume === "1800ml" ? (p.unit1800 ?? "1") : (p.unit720 ?? "1")) || 1;
  const getPrice = (p: Product, volume: string) =>
    volume === "1800ml" ? (p.wholesalePrice1800 ?? p.price1800 ?? 0) : (p.wholesalePrice720 ?? p.price720 ?? 0);

  const lineItems: LineItem[] = [];
  products.forEach((p) => {
    if (p.price1800 != null && getQty(p.id, "1800ml") > 0)
      lineItems.push({ productId: p.id, volume: "1800ml", qty: getQty(p.id, "1800ml") });
    if (p.price720 != null && getQty(p.id, "720ml") > 0)
      lineItems.push({ productId: p.id, volume: "720ml", qty: getQty(p.id, "720ml") });
  });

  const total = lineItems.reduce((sum, li) => {
    const p = products.find((p) => p.id === li.productId)!;
    return sum + li.qty * getLot(p, li.volume) * getPrice(p, li.volume);
  }, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId) return alert("顧客を選択してください");
    if (lineItems.length === 0) return alert("数量を1件以上入力してください");
    setSaving(true);
    const items = lineItems.map((li) => {
      const p = products.find((p) => p.id === li.productId)!;
      return {
        productId: li.productId,
        quantity: li.qty,
        unitPrice: getPrice(p, li.volume),
        volume: li.volume,
      };
    });
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customerId, items, notes }),
    });
    setSaving(false);
    if (res.ok) router.push("/orders");
    else alert("登録に失敗しました");
  };

  const hasAny = products.some((p) => p.price1800 != null || p.price720 != null);

  return (
    <div className="space-y-4 max-w-5xl">
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/orders" className="hover:text-blue-600">受注管理</Link>
        <span>›</span>
        <span>新規販売登録</span>
      </div>
      <h1 className="text-2xl font-bold text-gray-900">新規販売登録</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 顧客・納品日 */}
        <div className="bg-white rounded-lg shadow p-5 space-y-4">
          <h2 className="font-semibold text-gray-800">基本情報</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">顧客 <span className="text-red-500">*</span></label>
            <select required value={customerId} onChange={(e) => setCustomerId(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">顧客を選択...</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>{c.name}{c.company ? ` (${c.company})` : ""}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">備考・納品希望日など</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2}
              placeholder="備考・納品希望日など"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>

        {/* 商品テーブル */}
        <div className="bg-white rounded-lg shadow p-5 overflow-x-auto">
          <h2 className="font-semibold text-gray-800 mb-3">商品・数量</h2>
          {!hasAny ? (
            <p className="text-sm text-gray-400 py-4 text-center">商品が登録されていません</p>
          ) : (
            <table className="w-full text-sm whitespace-nowrap">
              <thead className="text-gray-500 text-xs uppercase bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left">商品名</th>
                  <th className="px-3 py-2 text-left">種別</th>
                  <th className="px-3 py-2 text-center">容量</th>
                  <th className="px-3 py-2 text-right">卸売値</th>
                  <th className="px-3 py-2 text-center">ロット</th>
                  <th className="px-3 py-2 text-center">ケース数</th>
                  <th className="px-3 py-2 text-right">小計</th>
                </tr>
              </thead>
              <tbody>
                {products.flatMap((p) => {
                  const rows = [];
                  if (p.price1800 != null) {
                    const qty = getQty(p.id, "1800ml");
                    const lot = getLot(p, "1800ml");
                    const wp = p.wholesalePrice1800;
                    rows.push(
                      <tr key={`${p.id}_1800`} className="border-t border-gray-100 hover:bg-gray-50">
                        <td className="px-3 py-2 font-medium">{p.name}</td>
                        <td className="px-3 py-2 text-gray-500 text-xs">{p.category ?? "—"}</td>
                        <td className="px-3 py-2 text-center">
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">1800ml</span>
                        </td>
                        <td className="px-3 py-2 text-right">{wp != null ? `¥${wp.toLocaleString()}` : "—"}</td>
                        <td className="px-3 py-2 text-center">{lot}</td>
                        <td className="px-3 py-2 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button type="button" onClick={() => setQty(p.id, "1800ml", qty - 1)}
                              className="w-7 h-7 rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100 text-lg leading-none flex items-center justify-center">−</button>
                            <input type="number" min="0" value={qty || ""}
                              onChange={(e) => setQty(p.id, "1800ml", parseInt(e.target.value) || 0)}
                              className="w-14 text-center border border-gray-300 rounded-lg px-1 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400" />
                            <button type="button" onClick={() => setQty(p.id, "1800ml", qty + 1)}
                              className="w-7 h-7 rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100 text-lg leading-none flex items-center justify-center">+</button>
                          </div>
                        </td>
                        <td className="px-3 py-2 text-right font-medium">
                          {qty > 0 && wp != null ? `¥${(qty * lot * wp).toLocaleString()}` : "—"}
                        </td>
                      </tr>
                    );
                  }
                  if (p.price720 != null) {
                    const qty = getQty(p.id, "720ml");
                    const lot = getLot(p, "720ml");
                    const wp = p.wholesalePrice720;
                    rows.push(
                      <tr key={`${p.id}_720`} className="border-t border-gray-100 hover:bg-gray-50">
                        <td className="px-3 py-2 font-medium">{p.name}</td>
                        <td className="px-3 py-2 text-gray-500 text-xs">{p.category ?? "—"}</td>
                        <td className="px-3 py-2 text-center">
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-sky-100 text-sky-700">720ml</span>
                        </td>
                        <td className="px-3 py-2 text-right">{wp != null ? `¥${wp.toLocaleString()}` : "—"}</td>
                        <td className="px-3 py-2 text-center">{lot}</td>
                        <td className="px-3 py-2 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button type="button" onClick={() => setQty(p.id, "720ml", qty - 1)}
                              className="w-7 h-7 rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100 text-lg leading-none flex items-center justify-center">−</button>
                            <input type="number" min="0" value={qty || ""}
                              onChange={(e) => setQty(p.id, "720ml", parseInt(e.target.value) || 0)}
                              className="w-14 text-center border border-gray-300 rounded-lg px-1 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400" />
                            <button type="button" onClick={() => setQty(p.id, "720ml", qty + 1)}
                              className="w-7 h-7 rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100 text-lg leading-none flex items-center justify-center">+</button>
                          </div>
                        </td>
                        <td className="px-3 py-2 text-right font-medium">
                          {qty > 0 && wp != null ? `¥${(qty * lot * wp).toLocaleString()}` : "—"}
                        </td>
                      </tr>
                    );
                  }
                  return rows;
                })}
              </tbody>
              <tfoot className="bg-gray-50">
                <tr>
                  <td colSpan={6} className="px-3 py-2 text-right font-semibold text-gray-700">合計</td>
                  <td className="px-3 py-2 text-right font-bold text-gray-900 text-base">¥{total.toLocaleString()}</td>
                </tr>
              </tfoot>
            </table>
          )}
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={saving || lineItems.length === 0}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
            {saving ? "登録中..." : "販売登録する"}
          </button>
          <button type="button" onClick={() => router.push("/orders")}
            className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg text-sm font-medium hover:bg-gray-50">
            キャンセル
          </button>
        </div>
      </form>
    </div>
  );
}
