"use client";
import { useEffect, useState, useCallback } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";

type Product = {
  id: number;
  name: string;
  category: string | null;
  description: string | null;
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

type LinkData = {
  link: { title: string | null; message: string | null; customer: { name: string; company: string | null } };
  products: Product[];
};

type VariantKey = string;

type Variant = {
  key: VariantKey;
  product: Product;
  volume: string;
  price: number;
  lot: string;
  stock: number;
};

type RequestItem = {
  id: number;
  requestedQty: number;
  unitPrice: number;
  volume: string | null;
  product: { name: string; unit1800: string | null; unit720: string | null; category: string | null; sakaMai: string | null; seimaiWari: string | null; alcohol: string | null };
};

type OrderRequest = {
  id: number;
  requestNumber: string;
  status: "PENDING" | "CONFIRMED" | "REJECTED";
  requestedAt: string;
  notes: string | null;
  items: RequestItem[];
};

type CustomerMe = { name: string; company: string | null };

export default function MobileOrderPage() {
  const { token } = useParams<{ token: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [data, setData] = useState<LinkData | null>(null);
  const [error, setError] = useState("");
  const [quantities, setQuantities] = useState<Record<VariantKey, number>>({});
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState("");
  const [confirming, setConfirming] = useState(false);
  const tab = (searchParams.get("tab") === "history" ? "history" : "order") as "order" | "history";
  const setTab = useCallback((t: "order" | "history") => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", t);
    router.replace(`?${params.toString()}`);
  }, [router, searchParams]);
  const [customerMe, setCustomerMe] = useState<CustomerMe | null>(null);
  const [orders, setOrders] = useState<OrderRequest[]>([]);
  const [historyDetail, setHistoryDetail] = useState<OrderRequest | null>(null);

  useEffect(() => {
    const preview = new URLSearchParams(window.location.search).get("preview");
    const url = preview ? `/api/order-links/${token}?preview=1` : `/api/order-links/${token}`;
    fetch(url).then((r) => r.json()).then((d) => { if (d.error) setError(d.error); else setData(d); });
    fetch("/api/customer/me").then((r) => r.ok ? r.json() : null).then((d) => {
      if (d) setCustomerMe(d);
    });
    fetch(`/api/order-links/${token}/orders`).then((r) => r.ok ? r.json() : []).then(setOrders);
  }, [token]);

  const setQty = (key: VariantKey, val: number) =>
    setQuantities((prev) => ({ ...prev, [key]: Math.max(0, isNaN(val) ? 0 : val) }));

  const variants: Variant[] = (data?.products ?? []).flatMap((p) => {
    const list: Variant[] = [];
    if (p.price1800 != null) list.push({ key: `${p.id}_1800ml`, product: p, volume: "1800ml", price: p.price1800, lot: p.unit1800 ?? "本", stock: p.stock1800 ?? 0 });
    if (p.price720 != null)  list.push({ key: `${p.id}_720ml`,  product: p, volume: "720ml",  price: p.price720,  lot: p.unit720  ?? "本", stock: p.stock720  ?? 0 });
    return list;
  });

  const selectedCount = Object.values(quantities).filter((q) => q > 0).length;
  const selectedVariants = variants.filter((v) => (quantities[v.key] ?? 0) > 0);

  const handleSubmit = async () => {
    if (selectedCount === 0) return;
    setSubmitting(true);
    const items = variants
      .filter((v) => (quantities[v.key] ?? 0) > 0)
      .map((v) => ({ productId: v.product.id, quantity: quantities[v.key], unitPrice: v.price, volume: v.volume }));
    const res = await fetch(`/api/order-links/${token}/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items, notes }),
    });
    const result = await res.json();
    if (res.ok) setSubmitted(result.requestNumber);
    else { alert(result.error ?? "送信に失敗しました"); setSubmitting(false); }
  };

  const Header = () => (
    <div className="sticky top-0 z-10 bg-slate-800">
      <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
        <h1 className="text-sm font-bold text-white">発注システム</h1>
        {customerMe && (
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-white">{customerMe.name}</span>
            <button
              onClick={async () => { await fetch("/api/customer/logout", { method: "POST" }); router.push("/portal/login"); }}
              className="text-xs text-slate-300 hover:text-white border border-slate-500 hover:border-slate-300 px-2 py-1 rounded-lg transition-colors"
            >ログアウト</button>
          </div>
        )}
      </div>
      {/* タブ */}
      <div className="max-w-lg mx-auto flex border-t border-slate-700">
        <button
          onClick={() => setTab("order")}
          className={`flex-1 py-2 text-xs font-bold transition-colors ${tab === "order" ? "bg-slate-600 text-white" : "text-slate-300 hover:bg-slate-700 hover:text-white"}`}
        >注文依頼</button>
        <button
          onClick={() => { setTab("history"); setHistoryDetail(null); }}
          className={`flex-1 py-2 text-xs font-bold transition-colors ${tab === "history" ? "bg-slate-600 text-white" : "text-slate-300 hover:bg-slate-700 hover:text-white"}`}
        >注文管理</button>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow p-8 max-w-sm w-full text-center space-y-3">
        <p className="text-4xl">⚠️</p>
        <p className="text-gray-700 font-medium">{error}</p>
      </div>
    </div>
  );

  if (submitted) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow p-8 max-w-sm w-full text-center space-y-4">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900">リクエストを送信しました</h2>
          <p className="text-sm text-gray-500 mt-1">内容を確認後、担当者よりご連絡いたします</p>
        </div>
        <button
          onClick={() => { setSubmitted(""); setQuantities({}); setNotes(""); setConfirming(false); setSubmitting(false); setTab("history"); }}
          className="w-full py-3 rounded-xl text-sm font-bold text-white" style={{ background: "#1e3a8a" }}
        >
          注文管理を見る
        </button>
      </div>
    </div>
  );

  if (!data) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-gray-400 text-sm">読み込み中...</p>
    </div>
  );

  const { link } = data;
  const confirmProducts = (data?.products ?? []).filter((p) =>
    variants.some((v) => v.product.id === p.id && (quantities[v.key] ?? 0) > 0)
  );

  if (confirming) return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-lg mx-auto px-4 pt-3 pb-36 space-y-3">
        {confirmProducts.map((p) => {
          const pvariants = variants.filter((v) => v.product.id === p.id && (quantities[v.key] ?? 0) > 0);
          return (
            <div key={p.id} className="bg-white rounded-2xl border-2 border-blue-800 shadow-sm">
              <div className="px-4 py-3 rounded-t-2xl bg-blue-50">
                <h3 className="font-bold text-gray-900 text-base">{p.name}</h3>
                <div className="flex flex-wrap gap-2 mt-1">
                  {p.category && <span className="text-sm font-medium" style={{ color: "#1e3a8a" }}>{p.category}</span>}
                  {p.sakaMai && <span className="text-sm text-gray-400">{p.sakaMai}</span>}
                  {p.seimaiWari && <span className="text-sm text-gray-400">{p.seimaiWari}%</span>}
                </div>
              </div>
              <div className="px-4 py-3 space-y-3">
                {pvariants.map((v) => {
                  const qty = quantities[v.key] ?? 0;
                  return (
                    <div key={v.key} className="flex items-center gap-2">
                      <span className={`text-xs font-bold px-2 py-1 rounded-full w-16 text-center shrink-0 ${
                        v.volume === "1800ml" ? "bg-amber-100 text-amber-700" : "bg-sky-100 text-sky-700"
                      }`}>{v.volume}</span>
                      <span className="text-sm text-gray-500 w-20 shrink-0">¥{v.price.toLocaleString()}</span>
                      <span className="flex-1 text-right text-sm text-gray-600">希望数量&nbsp;&nbsp;&nbsp;<span className="font-bold text-gray-900 text-base">{qty}</span></span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
        {notes && (
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <p className="text-xs text-gray-400 mb-1">備考</p>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{notes}</p>
          </div>
        )}
      </div>
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-4">
        <div className="max-w-lg mx-auto space-y-3">
          <button onClick={handleSubmit} disabled={submitting}
            className="w-full py-3 rounded-xl text-base font-bold text-white disabled:opacity-50"
            style={{ background: "#1e3a8a" }}>
            {submitting ? "送信中..." : "この内容で送信する"}
          </button>
          <button onClick={() => setConfirming(false)} disabled={submitting}
            className="w-full py-3 rounded-xl text-sm font-medium text-gray-500 bg-gray-100 active:bg-gray-200">
            戻って修正する
          </button>
        </div>
      </div>
    </div>
  );

  // 発注履歴タブ
  if (tab === "history") return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-lg mx-auto px-4 py-4 space-y-3">
        {historyDetail ? (
          <>
            <button onClick={() => setHistoryDetail(null)} className="text-sm text-blue-700 hover:underline">← 一覧に戻る</button>
            <div className="bg-white rounded-2xl shadow p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-400">{new Date(historyDetail.requestedAt).toLocaleDateString("ja-JP")}</p>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                  historyDetail.status === "CONFIRMED" ? "bg-green-100 text-green-700" :
                  historyDetail.status === "REJECTED"  ? "bg-red-100 text-red-600" :
                  "bg-yellow-100 text-yellow-700"
                }`}>{
                  historyDetail.status === "CONFIRMED" ? "受注確定" :
                  historyDetail.status === "REJECTED"  ? "キャンセル" : "確認待ち"
                }</span>
              </div>
              <div className="space-y-2">
                {historyDetail.items.map((item) => {
                  const lot = parseInt(item.volume === "1800ml" ? (item.product.unit1800 ?? "1") : (item.product.unit720 ?? "1")) || 1;
                  return (
                    <div key={item.id} className="bg-gray-50 rounded-xl border border-gray-100">
                      <div className="px-4 py-2 rounded-t-xl bg-slate-50">
                        <p className="font-bold text-gray-900 text-sm">{item.product.name}</p>
                        <div className="flex flex-wrap gap-2 mt-0.5">
                          {item.product.category && <span className="text-xs font-medium" style={{ color: "#1e3a8a" }}>{item.product.category}</span>}
                          {item.product.sakaMai && <span className="text-xs text-gray-400">{item.product.sakaMai}</span>}
                          {item.product.seimaiWari && <span className="text-xs text-gray-400">{item.product.seimaiWari}%</span>}
                          {item.product.alcohol && <span className="text-xs text-gray-400">アルコール{item.product.alcohol}</span>}
                        </div>
                      </div>
                      <div className="px-4 py-2 flex items-center gap-2">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full shrink-0 ${item.volume === "1800ml" ? "bg-amber-100 text-amber-700" : "bg-sky-100 text-sky-700"}`}>{item.volume}</span>
                        <span className="text-xs text-gray-500">¥{item.unitPrice.toLocaleString()}　{lot}本入</span>
                        <span className="ml-auto text-xs text-gray-500">{item.requestedQty}ケース</span>
                        <span className="text-sm font-bold text-gray-900">¥{(item.requestedQty * lot * item.unitPrice).toLocaleString()}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                <p className="text-sm font-semibold text-gray-700">合計</p>
                <p className="text-base font-bold text-gray-900">
                  ¥{historyDetail.items.reduce((sum, item) => {
                    const lot = parseInt(item.volume === "1800ml" ? (item.product.unit1800 ?? "1") : (item.product.unit720 ?? "1")) || 1;
                    return sum + item.requestedQty * lot * item.unitPrice;
                  }, 0).toLocaleString()}
                </p>
              </div>
            </div>
          </>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-2xl shadow p-8 text-center text-gray-400 text-sm">注文履歴がありません</div>
        ) : (
          orders.map((o) => {
            const st = o.status === "CONFIRMED" ? { label: "受注確定", cls: "bg-green-100 text-green-700" }
                     : o.status === "REJECTED"  ? { label: "キャンセル", cls: "bg-red-100 text-red-600" }
                     : { label: "確認待ち", cls: "bg-yellow-100 text-yellow-700" };
            return (
              <div key={o.id} className="bg-white rounded-2xl shadow overflow-hidden">
                {/* ヘッダー：日付・ステータス */}
                <div className="flex items-center justify-between px-4 py-2 bg-slate-50 border-b border-gray-100">
                  <p className="text-xs text-gray-400">発注日　{new Date(o.requestedAt).toLocaleDateString("ja-JP")}</p>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${st.cls}`}>{st.label}</span>
                </div>
                {/* 商品カード */}
                <div className="divide-y divide-gray-100">
                  {o.items.map((item) => {
                    const lot = parseInt(item.volume === "1800ml" ? (item.product.unit1800 ?? "1") : (item.product.unit720 ?? "1")) || 1;
                    return (
                      <div key={item.id} className="px-4 py-3">
                        <p className="font-bold text-gray-900 text-base">{item.product.name}</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {item.product.category && <span className="text-sm font-medium" style={{ color: "#1e3a8a" }}>{item.product.category}</span>}
                          {item.product.sakaMai && <span className="text-sm text-gray-400">{item.product.sakaMai}</span>}
                          {item.product.seimaiWari && <span className="text-sm text-gray-400">{item.product.seimaiWari}%</span>}
                          {item.product.alcohol && <span className="text-sm text-gray-400">アルコール{item.product.alcohol}</span>}
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`text-xs font-bold px-2 py-1 rounded-full w-16 text-center shrink-0 ${item.volume === "1800ml" ? "bg-amber-100 text-amber-700" : "bg-sky-100 text-sky-700"}`}>{item.volume}</span>
                          <span className="text-sm text-gray-500 shrink-0">¥{item.unitPrice.toLocaleString()}　{lot}本入</span>
                          <span className="ml-auto text-gray-500"><span className="text-base font-bold text-gray-900">{item.requestedQty}</span><span className="text-sm">&nbsp;&nbsp;&nbsp;&nbsp;ケース</span></span>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {o.notes && <p className="px-4 pb-3 text-xs text-gray-400">{o.notes}</p>}
              </div>
            );
          })
        )}
      </div>
    </div>
  );

  // 注文タブ（メイン）
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-lg mx-auto pb-36">
        {link.message && (
          <div className="mx-4 mt-3 bg-blue-50 border border-blue-200 rounded-xl p-3 text-sm text-blue-800 whitespace-pre-wrap">
            {link.message}
          </div>
        )}
        <div className="mx-4 mt-6 mb-8">
          <p className="text-base font-bold text-gray-900 mb-2">発注先</p>
          <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 w-full" style={{ color: "#1e3a8a" }}>
            <option>山三酒造</option>
          </select>
        </div>
        <div className="space-y-3 mt-3 px-4">
          {(data?.products ?? []).map((p) => {
            const pvariants = variants.filter((v) => v.product.id === p.id);
            if (pvariants.length === 0) return null;
            const hasQty = pvariants.some((v) => (quantities[v.key] ?? 0) > 0);
            return (
              <div key={p.id} className={`bg-white rounded-2xl border-2 transition-all ${hasQty ? "border-blue-800 shadow-md" : "border-transparent shadow-sm"}`}>
                <div className={`px-4 py-3 rounded-t-2xl ${hasQty ? "bg-blue-50" : "bg-slate-50"}`}>
                  <h3 className="font-bold text-gray-900 text-base">{p.name}</h3>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {p.category && <span className="text-sm font-medium" style={{ color: "#1e3a8a" }}>{p.category}</span>}
                    {p.sakaMai && <span className="text-sm text-gray-400">{p.sakaMai}</span>}
                    {p.seimaiWari && <span className="text-sm text-gray-400">{p.seimaiWari}%</span>}
                    {p.alcohol && <span className="text-sm text-gray-400">アルコール{p.alcohol}</span>}
                  </div>
                </div>
                <div className="px-4 py-3 space-y-3">
                  {pvariants.map((v) => {
                    const qty = quantities[v.key] ?? 0;
                    return (
                      <div key={v.key} className="flex items-center gap-2">
                        <span className={`text-xs font-bold px-2 py-1 rounded-full w-16 text-center shrink-0 ${
                          v.volume === "1800ml" ? "bg-amber-100 text-amber-700" : "bg-sky-100 text-sky-700"
                        }`}>{v.volume}</span>
                        <span className="text-sm text-gray-500 shrink-0">¥{v.price.toLocaleString()}　{v.lot}本入</span>
                        <div className="flex items-center gap-2 flex-1 justify-end">
                          <button onClick={() => setQty(v.key, qty - 1)} disabled={qty === 0}
                            className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 text-lg flex items-center justify-center disabled:opacity-25 active:bg-gray-200 select-none shrink-0">−</button>
                          <input type="number" inputMode="numeric" min="0"
                            value={qty === 0 ? "" : qty}
                            onChange={(e) => setQty(v.key, parseInt(e.target.value))}
                            placeholder="0"
                            className="w-12 text-center text-base font-bold border-b-2 border-gray-200 focus:border-blue-800 outline-none py-1 bg-transparent" />
                          <button onClick={() => setQty(v.key, qty + 1)}
                            className="w-8 h-8 rounded-full text-white text-lg flex items-center justify-center select-none shrink-0" style={{ background: "#1e3a8a" }}>+</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
        <div className="mx-4 mt-4">
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3}
            placeholder="備考・納品希望日など"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white" />
        </div>
      </div>
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-4">
        <div className="max-w-lg mx-auto space-y-2">
          <button onClick={() => setConfirming(true)} disabled={selectedCount === 0}
            className="w-full py-3 rounded-xl text-base font-bold text-white disabled:bg-gray-200 disabled:text-gray-400" style={{ background: "#1e3a8a" }}>
            {selectedCount > 0 ? "注文内容を確認する" : "数量を入力してください"}
          </button>
        </div>
      </div>
    </div>
  );
}
