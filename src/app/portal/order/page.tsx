"use client";
import { useCallback, useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type Product = {
  id: number;
  name: string;
  description: string | null;
  category: string | null;
  sakaMai: string | null;
  seimaiWari: string | null;
  alcohol: string | null;
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

type VariantKey = string;
type Variant = { key: string; product: Product; volume: string; price: number; wholesalePrice: number | null; lot: number; stock: number | null };

function PortalOrderContent() {
  const [products, setProducts] = useState<Product[]>([]);
  const [quantities, setQuantities] = useState<Record<VariantKey, number>>({});
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [approved, setApproved] = useState(false);
  const [pendingApprovals, setPendingApprovals] = useState(0);
  const [companies, setCompanies] = useState<{ companyId: number; companyName: string }[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(null);
  const [productsLoaded, setProductsLoaded] = useState(false);
  const [descModal, setDescModal] = useState<{ name: string; description: string } | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  const fetchCompanies = useCallback(() => {
    fetch("/api/portal/companies").then((r2) => r2.ok ? r2.json() : null).then((d) => {
      if (!d) return;
      setCompanies(d.companies ?? []);
      setApproved(d.approved);
      setPendingApprovals(d.pendingApprovals ?? 0);
    });
  }, []);

  useEffect(() => {
    fetch("/api/customer/me").then((r) => {
      if (!r.ok) { router.push("/portal/login"); return; }
      fetch("/api/portal/companies").then((r2) => r2.ok ? r2.json() : null).then((d) => {
        if (d?.companies?.length) {
          setCompanies(d.companies);
          setApproved(d.approved);
          setPendingApprovals(d.pendingApprovals ?? 0);
          const urlCompanyId = searchParams.get("companyId");
          const target = urlCompanyId ? d.companies.find((c: { companyId: number }) => c.companyId === Number(urlCompanyId)) : null;
          if (target) {
            setSelectedCompanyId(target.companyId);
          } else if (d.approved && d.companies.length === 1) {
            setSelectedCompanyId(d.companies[0].companyId);
          } else {
            setSelectedCompanyId(null);
          }
        }
      });
    });
  }, [router]);

  useEffect(() => {
    const id = setInterval(fetchCompanies, 15000);
    return () => clearInterval(id);
  }, [fetchCompanies]);

  useEffect(() => {
    if (!selectedCompanyId) { setProducts([]); setProductsLoaded(false); return; }
    setProductsLoaded(false);
    fetch(`/api/portal/products?companyId=${selectedCompanyId}`).then((r) => {
      if (r.ok) r.json().then((data) => { setProducts(data); setProductsLoaded(true); });
      else { setProducts([]); setProductsLoaded(true); }
    });
    setQuantities({});
  }, [selectedCompanyId]);

  const setQty = (key: VariantKey, val: number, maxStock?: number | null) => {
    let v = Math.max(0, isNaN(val) ? 0 : val);
    if (maxStock != null && maxStock > 0) v = Math.min(v, maxStock);
    setQuantities((p) => ({ ...p, [key]: v }));
  };

  const variants: Variant[] = products.flatMap((p) => {
    const list: Variant[] = [];
    if (p.price1800 != null) list.push({ key: `${p.id}_1800`, product: p, volume: "1800ml", price: p.price1800, wholesalePrice: p.wholesalePrice1800, lot: parseInt(p.unit1800 ?? "1") || 1, stock: p.stock1800 });
    if (p.price720  != null) list.push({ key: `${p.id}_720`,  product: p, volume: "720ml",  price: p.price720,  wholesalePrice: p.wholesalePrice720,  lot: parseInt(p.unit720  ?? "1") || 1, stock: p.stock720  });
    if (p.priceOther != null && p.volumeOther) {
      const vol = p.volumeOther.endsWith("ml") ? p.volumeOther : `${p.volumeOther}ml`;
      list.push({ key: `${p.id}_other`, product: p, volume: vol, price: p.priceOther, wholesalePrice: p.wholesalePriceOther, lot: parseInt(p.unitOther ?? "1") || 1, stock: p.stockOther });
    }
    return list;
  });

  const selected = variants.filter((v) => (quantities[v.key] ?? 0) > 0);
  const total = selected.reduce((s, v) => s + (quantities[v.key] ?? 0) * v.lot * v.price, 0);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const items = selected.map((v) => ({
        productId: v.product.id,
        quantity: quantities[v.key],
        unitPrice: v.price,
        volume: v.volume,
      }));
      const res = await fetch("/api/portal/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items, notes, companyId: selectedCompanyId }),
      });
      if (res.status === 401 || res.redirected) { router.push("/portal/login"); return; }
      const data = await res.json();
      if (res.ok) router.push("/portal/orders");
      else { alert(data.error ?? "送信に失敗しました"); setSubmitting(false); }
    } catch {
      alert("送信に失敗しました");
      setSubmitting(false);
    }
  };

  if (confirming) return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">注文確認</h1>
        <button onClick={() => setConfirming(false)} className="text-sm text-blue-600 hover:underline">← 修正する</button>
      </div>

      {/* PC: テーブル */}
      <div className="hidden md:block bg-white rounded-xl shadow overflow-x-auto">
        <table className="w-full text-sm whitespace-nowrap">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
            <tr>
              <th className="px-4 py-3 text-left min-w-[140px]">商品名</th>
              <th className="px-3 py-3 text-left">種別</th>
              <th className="px-3 py-3 text-left">酒米</th>
              <th className="px-3 py-3 text-center">精米歩合</th>
              <th className="px-3 py-3 text-center">アルコール</th>
              <th className="px-3 py-3 text-center">容量</th>
              <th className="px-3 py-3 text-center">小売値</th>
              <th className="px-3 py-3 text-center">卸売値</th>
              <th className="px-3 py-3 text-center">ロット</th>
              <th className="px-3 py-3 text-center w-8"></th>
              <th className="px-3 py-3 text-center">注文数</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {selected.map((v) => {
              const qty = quantities[v.key] ?? 0;
              return (
                <tr key={v.key} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{v.product.name}</td>
                  <td className="px-3 py-3 text-gray-500 text-xs">{v.product.category ?? "—"}</td>
                  <td className="px-3 py-3 text-gray-500 text-xs">{v.product.sakaMai ?? "—"}</td>
                  <td className="px-3 py-3 text-center text-gray-500 text-xs">{v.product.seimaiWari ?? "—"}</td>
                  <td className="px-3 py-3 text-center text-gray-500 text-xs">{v.product.alcohol ?? "—"}</td>
                  <td className="px-3 py-3 text-center">
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${v.volume === "1800ml" ? "bg-amber-100 text-amber-700" : "bg-sky-100 text-sky-700"}`}>{v.volume}</span>
                  </td>
                  <td className="px-3 py-3 text-center text-gray-600">¥{v.price.toLocaleString()}</td>
                  <td className="px-3 py-3 text-center text-gray-600">{v.wholesalePrice != null ? `¥${v.wholesalePrice.toLocaleString()}` : "—"}</td>
                  <td className="px-3 py-3 text-center text-gray-500">{v.lot}</td>
                  <td className="px-3 py-3 text-center">
                    {v.product.description && (
                      <button onClick={() => setDescModal({ name: v.product.name, description: v.product.description! })}
                        className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 text-xs font-bold hover:bg-blue-200 transition">?</button>
                    )}
                  </td>
                  <td className={`px-3 py-3 text-center font-bold ${v.volume === "1800ml" ? "bg-amber-100 text-amber-700" : "bg-sky-100 text-sky-700"}`}>{qty}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* スマホ: カード */}
      <div className="md:hidden space-y-3">
        {selected.map((v) => {
          const qty = quantities[v.key] ?? 0;
          return (
            <div key={v.key} className="bg-white rounded-xl shadow p-4 flex items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-gray-900 text-sm">{v.product.name}</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${v.volume === "1800ml" ? "bg-amber-100 text-amber-700" : "bg-sky-100 text-sky-700"}`}>{v.volume}</span>
                </div>
                {v.wholesalePrice != null && <p className="text-xs text-gray-500 mt-0.5">卸売値 ¥{v.wholesalePrice.toLocaleString()} / ロット {v.lot}</p>}
              </div>
              <div className="text-right shrink-0">
                <p className="text-lg font-bold text-blue-800">{qty}<span className="text-xs font-normal ml-1">ケース</span></p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-xl shadow p-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">備考・納品希望日など</label>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>

      <div className="flex gap-3">
        <button onClick={handleSubmit} disabled={submitting}
          className="flex-1 md:flex-none md:px-8 py-3 rounded-xl text-sm font-bold text-white disabled:opacity-50" style={{ background: "#1e3a8a" }}>
          {submitting ? "送信中..." : "この内容で注文する"}
        </button>
        <button onClick={() => setConfirming(false)} disabled={submitting}
          className="flex-1 md:flex-none md:px-6 py-3 rounded-xl text-sm font-medium border border-gray-300 text-gray-700 hover:bg-gray-50">
          戻る
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {descModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setDescModal(null)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 space-y-3" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-base font-bold text-gray-900">{descModal.name}</h2>
            <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{descModal.description}</p>
            <div className="flex justify-end pt-1">
              <button onClick={() => setDescModal(null)} className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">閉じる</button>
            </div>
          </div>
        </div>
      )}

      {/* 発注先選択 */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-bold text-gray-900 shrink-0">発注先</h1>
          <select
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={!approved}
            value={selectedCompanyId ?? ""}
            onChange={(e) => setSelectedCompanyId(e.target.value ? Number(e.target.value) : null)}
          >
            <option value="">選択してください</option>
            {approved && companies.map((c) => (
              <option key={c.companyId} value={c.companyId}>{c.companyName}</option>
            ))}
          </select>
        </div>
        {pendingApprovals > 0 && (
          <span className="text-red-500 text-sm font-medium">＊承認待ちの発注先があります</span>
        )}
      </div>

      {/* PC: テーブル */}
      <div className="hidden md:block bg-white rounded-xl shadow overflow-x-auto">
        <table className="w-full text-sm whitespace-nowrap">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
            <tr>
              <th className="px-4 py-3 text-left w-44">商品名</th>
              <th className="px-4 py-3 text-left">種別</th>
              <th className="px-4 py-3 text-left">酒米</th>
              <th className="px-4 py-3 text-center">精米歩合</th>
              <th className="px-4 py-3 text-center">アルコール</th>
              <th className="px-4 py-3 text-center">容量</th>
              <th className="px-4 py-3 text-right">小売値</th>
              <th className="px-4 py-3 text-right">卸売値</th>
              <th className="px-4 py-3 text-right">ロット</th>
              <th className="px-4 py-3 text-right">限定</th>
              <th className="px-4 py-3 text-center w-8"></th>
              <th className="px-4 py-3 text-center w-36">ケース数</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {selectedCompanyId && productsLoaded && variants.length === 0 && (
              <tr><td colSpan={12} className="px-4 py-8 text-center text-red-500 font-medium">商品が登録されていません</td></tr>
            )}
            {variants.map((v, rowIdx) => {
              const qty = quantities[v.key] ?? 0;
              const rowBg = qty > 0 ? "bg-blue-50" : rowIdx % 2 === 1 ? "bg-gray-50" : "bg-white";
              return (
                <tr key={v.key} className={rowBg}>
                  <td className="px-4 py-3 font-medium text-gray-900" title={v.product.name}>
                    {v.product.name.length > 14 ? v.product.name.slice(0, 14) + "…" : v.product.name}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{v.product.category ?? "—"}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{v.product.sakaMai ?? "—"}</td>
                  <td className="px-4 py-3 text-center text-gray-500 text-xs">{v.product.seimaiWari ?? "—"}</td>
                  <td className="px-4 py-3 text-center text-gray-500 text-xs">{v.product.alcohol ?? "—"}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${v.volume === "1800ml" ? "bg-amber-100 text-amber-700" : v.volume === "720ml" ? "bg-sky-100 text-sky-700" : "bg-purple-100 text-purple-700"}`}>{v.volume}</span>
                  </td>
                  <td className="px-4 py-3 text-right text-gray-600">¥{v.price.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right text-gray-600">{v.wholesalePrice != null ? `¥${v.wholesalePrice.toLocaleString()}` : "—"}</td>
                  <td className="px-4 py-3 text-right text-gray-500">{v.lot}</td>
                  <td className="px-4 py-3 text-right text-gray-500">{v.stock != null && v.stock !== 0 ? v.stock : ""}</td>
                  <td className="px-2 py-3 text-center">
                    {v.product.description && (
                      <button onClick={() => setDescModal({ name: v.product.name, description: v.product.description! })}
                        className="w-5 h-5 rounded-full bg-gray-200 text-gray-500 text-xs font-bold flex items-center justify-center hover:bg-gray-300">?</button>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => setQty(v.key, qty - 1, v.stock)} disabled={qty === 0}
                        className="w-7 h-7 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center disabled:opacity-25 hover:bg-gray-200">−</button>
                      <input type="number" min="0" max={v.stock != null && v.stock > 0 ? v.stock : undefined}
                        value={qty === 0 ? "" : qty}
                        onChange={(e) => setQty(v.key, parseInt(e.target.value), v.stock)}
                        placeholder="0"
                        className="w-12 text-center text-sm font-bold border-b-2 border-gray-200 focus:border-blue-800 outline-none py-1 bg-transparent" />
                      <button onClick={() => setQty(v.key, qty + 1, v.stock)}
                        disabled={v.stock != null && v.stock > 0 && qty >= v.stock}
                        className="w-7 h-7 rounded-full text-white flex items-center justify-center disabled:opacity-40" style={{ background: "#1e3a8a" }}>+</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* スマホ: カード */}
      <div className="md:hidden space-y-3">
        {selectedCompanyId && productsLoaded && variants.length === 0 && (
          <div className="bg-white rounded-xl shadow p-6 text-center text-red-500 font-medium">商品が登録されていません</div>
        )}
        {variants.map((v) => {
          const qty = quantities[v.key] ?? 0;
          const is1800 = v.volume === "1800ml";
          return (
            <div key={v.key} className={`bg-white rounded-xl shadow p-4 ${qty > 0 ? "ring-2 ring-blue-400" : ""}`}>
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-gray-900">{v.product.name}</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${is1800 ? "bg-amber-100 text-amber-700" : "bg-sky-100 text-sky-700"}`}>{v.volume}</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {[v.product.category, v.product.sakaMai].filter(Boolean).join(" / ")}
                  </p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                    {v.wholesalePrice != null && <span>卸売値 <span className="font-medium text-gray-700">¥{v.wholesalePrice.toLocaleString()}</span></span>}
                    <span>ロット <span className="font-medium text-gray-700">{v.lot}</span></span>
                    {v.stock != null && v.stock > 0 && <span>限定 <span className="font-medium text-gray-700">{v.stock}</span></span>}
                    {v.product.description && (
                      <button onClick={() => setDescModal({ name: v.product.name, description: v.product.description! })}
                        className="w-5 h-5 rounded-full bg-gray-200 text-gray-500 text-xs font-bold flex items-center justify-center">?</button>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">ケース数</span>
                <div className="flex items-center gap-3">
                  <button onClick={() => setQty(v.key, qty - 1, v.stock)} disabled={qty === 0}
                    className="w-10 h-10 rounded-full bg-gray-100 text-gray-600 text-lg flex items-center justify-center disabled:opacity-25 hover:bg-gray-200">−</button>
                  <input type="number" min="0" max={v.stock != null && v.stock > 0 ? v.stock : undefined}
                    value={qty === 0 ? "" : qty}
                    onChange={(e) => setQty(v.key, parseInt(e.target.value), v.stock)}
                    placeholder="0"
                    className="w-14 text-center text-xl font-bold border-b-2 border-gray-300 focus:border-blue-800 outline-none py-1 bg-transparent" />
                  <button onClick={() => setQty(v.key, qty + 1, v.stock)}
                    disabled={v.stock != null && v.stock > 0 && qty >= v.stock}
                    className="w-10 h-10 rounded-full text-white text-lg flex items-center justify-center disabled:opacity-40" style={{ background: "#1e3a8a" }}>+</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 確認ボタン（選択商品あり） */}
      {selected.length > 0 && (
        <div className="sticky bottom-4 flex justify-center md:justify-end">
          <button onClick={() => setConfirming(true)}
            className="w-full md:w-auto px-8 py-4 md:py-3 rounded-xl text-base md:text-sm font-bold text-white shadow-lg"
            style={{ background: "#1e3a8a" }}>
            確認画面へ（{selected.length}商品）
          </button>
        </div>
      )}
    </div>
  );
}

export default function PortalOrderPage() {
  return (
    <Suspense>
      <PortalOrderContent />
    </Suspense>
  );
}
