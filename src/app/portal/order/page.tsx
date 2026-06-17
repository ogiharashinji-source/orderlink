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
};

type VariantKey = string;

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

  const setQty = (key: VariantKey, val: number) =>
    setQuantities((p) => ({ ...p, [key]: Math.max(0, isNaN(val) ? 0 : val) }));

  type Variant = { key: string; product: Product; volume: string; price: number; wholesalePrice: number | null; lot: number; stock: number | null };
  const variants: Variant[] = products.flatMap((p) => {
    const list: Variant[] = [];
    if (p.price1800 != null) list.push({ key: `${p.id}_1800`, product: p, volume: "1800ml", price: p.price1800, wholesalePrice: p.wholesalePrice1800, lot: parseInt(p.unit1800 ?? "1") || 1, stock: p.stock1800 });
    if (p.price720  != null) list.push({ key: `${p.id}_720`,  product: p, volume: "720ml",  price: p.price720,  wholesalePrice: p.wholesalePrice720,  lot: parseInt(p.unit720  ?? "1") || 1, stock: p.stock720  });
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">注文確認</h1>
        <button onClick={() => setConfirming(false)} className="text-sm text-blue-600 hover:underline">← 修正する</button>
      </div>

      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="w-full text-sm whitespace-nowrap">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
            <tr>
              <th className="px-4 py-3 text-left min-w-[140px]">商品名</th>
              <th className="px-3 py-3 text-left min-w-[100px]">種別</th>
              <th className="px-3 py-3 text-left min-w-[80px]">酒米</th>
              <th className="px-3 py-3 text-center w-20">精米歩合</th>
              <th className="px-3 py-3 text-center w-24">アルコール</th>
              <th className="px-3 py-3 text-center w-24">容量</th>
              <th className="px-3 py-3 text-center w-24">小売値</th>
              <th className="px-3 py-3 text-center w-24">卸売値</th>
              <th className="px-3 py-3 text-center w-16">ロット</th>
              <th className="px-3 py-3 text-center w-20">注文数</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {selected.map((v) => {
              const qty = quantities[v.key] ?? 0;
              return (
                <tr key={v.key} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900" title={v.product.name}>
                    {v.product.name.length > 14 ? v.product.name.slice(0, 14) + "…" : v.product.name}
                  </td>
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
                  <td className={`px-3 py-3 text-center font-bold ${v.volume === "1800ml" ? "bg-amber-100 text-amber-700" : "bg-sky-100 text-sky-700"}`}>{qty}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="bg-white rounded-xl shadow p-4 max-w-xl">
        <label className="block text-sm font-medium text-gray-700 mb-1">備考・納品希望日など</label>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>

      <div className="flex gap-3">
        <button onClick={handleSubmit} disabled={submitting}
          className="px-8 py-3 rounded-lg text-sm font-bold text-white disabled:opacity-50" style={{ background: "#1e3a8a" }}>
          {submitting ? "送信中..." : "この内容で注文する"}
        </button>
        <button onClick={() => setConfirming(false)} disabled={submitting}
          className="px-6 py-3 rounded-lg text-sm font-medium border border-gray-300 text-gray-700 hover:bg-gray-50">
          戻る
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {descModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setDescModal(null)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6 space-y-3" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-base font-bold text-gray-900">{descModal.name}</h2>
            <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{descModal.description}</p>
            <div className="flex justify-end pt-1">
              <button onClick={() => setDescModal(null)} className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">閉じる</button>
            </div>
          </div>
        </div>
      )}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-900">発注先</h1>
          <select
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={!approved}
            value={selectedCompanyId ?? ""}
            onChange={(e) => setSelectedCompanyId(e.target.value ? Number(e.target.value) : null)}
          >
            <option value="">選択してください</option>
            {approved && companies.map((c) => (
              <option key={c.companyId} value={c.companyId}>{c.companyName}</option>
            ))}
          </select>
          {pendingApprovals > 0 && (
            <span className="text-red-500 text-sm font-medium">
              ＊承認待ちの発注先があります。管理者の承認をお待ちください。
            </span>
          )}
        </div>
        {selected.length > 0 && (
          <button onClick={() => setConfirming(true)}
            className="px-6 py-2 rounded-lg text-sm font-bold text-white" style={{ background: "#1e3a8a" }}>
            確認画面へ（{selected.length}商品）
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow overflow-x-auto">
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
              <tr>
                <td colSpan={12} className="px-4 py-8 text-center text-red-500 font-medium">
                  商品が登録されていません
                </td>
              </tr>
            )}
            {variants.map((v) => {
              const qty = quantities[v.key] ?? 0;
              const isSelected = qty > 0;
              return (
                <tr key={v.key} className={isSelected ? "bg-blue-50" : "hover:bg-gray-50"}>
                  <td className="px-4 py-3 font-medium text-gray-900" title={v.product.name}>
                    {v.product.name.length > 14 ? v.product.name.slice(0, 14) + "…" : v.product.name}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{v.product.category ?? "—"}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{v.product.sakaMai ?? "—"}</td>
                  <td className="px-4 py-3 text-center text-gray-500 text-xs">{v.product.seimaiWari ?? "—"}</td>
                  <td className="px-4 py-3 text-center text-gray-500 text-xs">{v.product.alcohol ?? "—"}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${v.volume === "1800ml" ? "bg-amber-100 text-amber-700" : "bg-sky-100 text-sky-700"}`}>{v.volume}</span>
                  </td>
                  <td className="px-4 py-3 text-right text-gray-600">¥{v.price.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right text-gray-600">{v.wholesalePrice != null ? `¥${v.wholesalePrice.toLocaleString()}` : "—"}</td>
                  <td className="px-4 py-3 text-right text-gray-500">{v.lot}</td>
                  <td className="px-4 py-3 text-right text-gray-500">{v.stock != null && v.stock !== 0 ? v.stock : ""}</td>
                  <td className="px-2 py-3 text-center">
                    {v.product.description && (
                      <button
                        onClick={() => setDescModal({ name: v.product.name, description: v.product.description! })}
                        className="w-5 h-5 rounded-full bg-gray-200 text-gray-500 text-xs font-bold flex items-center justify-center hover:bg-gray-300"
                      >?</button>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => setQty(v.key, qty - 1)} disabled={qty === 0}
                        className="w-7 h-7 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center disabled:opacity-25 hover:bg-gray-200">−</button>
                      <input type="number" min="0" value={qty === 0 ? "" : qty}
                        onChange={(e) => setQty(v.key, parseInt(e.target.value))}
                        placeholder="0"
                        className="w-12 text-center text-sm font-bold border-b-2 border-gray-200 focus:border-blue-800 outline-none py-1 bg-transparent" />
                      <button onClick={() => setQty(v.key, qty + 1)}
                        className="w-7 h-7 rounded-full text-white flex items-center justify-center" style={{ background: "#1e3a8a" }}>+</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

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
