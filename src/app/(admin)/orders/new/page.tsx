"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Customer = { id: number; name: string; company: string | null };
type Product = {
  id: number; name: string; description: string | null;
  category: string | null; sakaMai: string | null; seimaiWari: string | null; alcohol: string | null;
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
  const [descModal, setDescModal] = useState<{ name: string; description: string } | null>(null);
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
  const getWp = (p: Product, volume: string) =>
    volume === "1800ml" ? p.wholesalePrice1800 : p.wholesalePrice720;
  const getStock = (p: Product, volume: string) =>
    volume === "1800ml" ? p.stock1800 : p.stock720;

  const lineItems: LineItem[] = [];
  products.forEach((p) => {
    if (p.price1800 != null && getQty(p.id, "1800ml") > 0)
      lineItems.push({ productId: p.id, volume: "1800ml", qty: getQty(p.id, "1800ml") });
    if (p.price720 != null && getQty(p.id, "720ml") > 0)
      lineItems.push({ productId: p.id, volume: "720ml", qty: getQty(p.id, "720ml") });
  });

  const total = lineItems.reduce((sum, li) => {
    const p = products.find((p) => p.id === li.productId)!;
    const wp = getWp(p, li.volume);
    if (wp == null) return sum;
    return sum + li.qty * getLot(p, li.volume) * wp;
  }, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId) return alert("顧客を選択してください");
    if (lineItems.length === 0) return alert("数量を1件以上入力してください");
    if (!confirm("受注登録してよろしいですか？")) return;
    setSaving(true);
    const items = lineItems.map((li) => {
      const p = products.find((p) => p.id === li.productId)!;
      return { productId: li.productId, quantity: li.qty, unitPrice: getWp(p, li.volume) ?? 0, volume: li.volume };
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

  const renderRow = (p: Product, volume: "1800ml" | "720ml") => {
    const qty = getQty(p.id, volume);
    const lot = getLot(p, volume);
    const wp = getWp(p, volume);
    const stock = getStock(p, volume);
    const retailPrice = volume === "1800ml" ? p.price1800 : p.price720;
    return (
      <tr key={`${p.id}_${volume}`} className="border-t border-gray-100 hover:bg-gray-50">
        <td className="px-3 py-2 font-medium">{p.name}</td>
        <td className="px-3 py-2 text-gray-500 text-xs">{p.category ?? "—"}</td>
        <td className="px-3 py-2 text-gray-500 text-xs">{p.sakaMai ?? "—"}</td>
        <td className="px-3 py-2 text-center text-gray-500 text-xs">{p.seimaiWari ?? "—"}</td>
        <td className="px-3 py-2 text-center text-gray-500 text-xs">{p.alcohol ?? "—"}</td>
        <td className="px-3 py-2 text-center">
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${volume === "1800ml" ? "bg-amber-100 text-amber-700" : volume === "720ml" ? "bg-sky-100 text-sky-700" : "bg-purple-100 text-purple-700"}`}>{volume}</span>
        </td>
        <td className="px-3 py-2 text-right">{retailPrice != null ? `¥${retailPrice.toLocaleString()}` : "—"}</td>
        <td className="px-3 py-2 text-right">{wp != null ? `¥${wp.toLocaleString()}` : "—"}</td>
        <td className="px-3 py-2 text-center">{lot}</td>
        <td className="px-3 py-2 text-center text-gray-500">
          {stock != null && stock > 0 ? stock : ""}
        </td>
        <td className="px-3 py-2 text-center">
          {p.description && (
            <button type="button" onClick={() => setDescModal({ name: p.name, description: p.description! })}
              className="w-6 h-6 rounded-full bg-gray-200 text-gray-600 text-xs font-bold hover:bg-gray-300">?</button>
          )}
        </td>
        <td className="px-3 py-2 text-center">
          <div className="flex items-center justify-center gap-1">
            <button type="button" onClick={() => setQty(p.id, volume, qty - 1)}
              className="w-7 h-7 rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100 text-lg leading-none flex items-center justify-center">−</button>
            <input type="number" min="0"
              max={stock != null && stock > 0 ? stock : undefined}
              value={qty || ""}
              onChange={(e) => {
                let v = parseInt(e.target.value) || 0;
                if (stock != null && stock > 0) v = Math.min(v, stock);
                setQty(p.id, volume, v);
              }}
              className="w-14 text-center border border-gray-300 rounded-lg px-1 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400" />
            <button type="button"
              onClick={() => setQty(p.id, volume, qty + 1)}
              disabled={stock != null && stock > 0 && qty >= stock}
              className="w-7 h-7 rounded-full bg-[#1e3a5f] text-white hover:bg-[#2d5a8e] text-lg leading-none flex items-center justify-center disabled:opacity-30">+</button>
          </div>
        </td>
      </tr>
    );
  };

  return (
    <div className="space-y-4 max-w-6xl">
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/orders" className="hover:text-blue-600">受注管理</Link>
        <span>›</span>
        <span>受注登録</span>
      </div>
      <h1 className="text-2xl font-bold text-gray-900">受注登録</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-white rounded-lg shadow p-5 space-y-4">
          <div>
            <select required value={customerId} onChange={(e) => setCustomerId(e.target.value)}
              className="w-1/4 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">選択してください</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>{c.name}{c.company ? ` (${c.company})` : ""}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-5 overflow-x-auto">
          {!hasAny ? (
            <p className="text-sm text-gray-400 py-4 text-center">商品が登録されていません</p>
          ) : (
            <table className="w-full text-sm whitespace-nowrap">
              <thead className="text-gray-500 text-xs uppercase bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left">商品名</th>
                  <th className="px-3 py-2 text-left">種別</th>
                  <th className="px-3 py-2 text-left">酒米</th>
                  <th className="px-3 py-2 text-center">精米歩合</th>
                  <th className="px-3 py-2 text-center">アルコール</th>
                  <th className="px-3 py-2 text-center">容量</th>
                  <th className="px-3 py-2 text-right">小売値</th>
                  <th className="px-3 py-2 text-right">卸売値</th>
                  <th className="px-3 py-2 text-center">ロット</th>
                  <th className="px-3 py-2 text-center">限定</th>
                  <th className="px-3 py-2 text-center"></th>
                  <th className="px-3 py-2 text-center">ケース数</th>
                </tr>
              </thead>
              <tbody>
                {products.flatMap((p) => {
                  const rows = [];
                  if (p.price1800 != null) rows.push(renderRow(p, "1800ml"));
                  if (p.price720 != null) rows.push(renderRow(p, "720ml"));
                  return rows;
                })}
              </tbody>
            </table>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-5">
          <label className="block text-sm font-medium text-gray-700 mb-1">メッセージ</label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2}
            placeholder=""
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={saving || lineItems.length === 0}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
            {saving ? "登録中..." : "受注する"}
          </button>
          <button type="button" onClick={() => router.push("/orders")}
            className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg text-sm font-medium hover:bg-gray-50">
            キャンセル
          </button>
        </div>
      </form>

      {/* 説明ポップアップ */}
      {descModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setDescModal(null)}>
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold text-gray-900 mb-2">{descModal.name}</h3>
            <p className="text-sm text-gray-600 whitespace-pre-wrap">{descModal.description}</p>
            <button onClick={() => setDescModal(null)} className="mt-4 w-full py-2 rounded-lg bg-gray-100 text-sm text-gray-700 hover:bg-gray-200">閉じる</button>
          </div>
        </div>
      )}
    </div>
  );
}
