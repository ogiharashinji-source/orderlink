"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type RequestItem = {
  id: number;
  requestedQty: number;
  confirmedQty: number | null;
  unitPrice: number;
  volume: string | null;
  productName: string | null;
  productCategory: string | null;
  productSakaMai: string | null;
  productSeimaiWari: string | null;
  productAlcohol: string | null;
  product: {
    name: string;
    category: string | null;
    sakaMai: string | null;
    seimaiWari: string | null;
    alcohol: string | null;
    unit1800: string | null;
    unit720: string | null;
    wholesalePrice1800: number | null;
    wholesalePrice720: number | null;
  } | null;
};

type OrderRequest = {
  id: number;
  requestNumber: string;
  status: "PENDING" | "CONFIRMED" | "REJECTED";
  requestedAt: string;
  notes: string | null;
  sellerName: string | null;
  company: { setting: { companyName: string } | null } | null;
  items: RequestItem[];
};

const STATUS_LABEL: Record<string, { label: string; cls: string }> = {
  PENDING:   { label: "確認待ち", cls: "bg-yellow-100 text-yellow-700" },
  CONFIRMED: { label: "確定", cls: "bg-gray-100 text-gray-500" },
  REJECTED:  { label: "在庫なし", cls: "bg-red-100 text-red-600" },
};

export default function PortalOrdersPage() {
  const [orders, setOrders] = useState<OrderRequest[]>([]);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleDelete = async (id: number) => {
    if (!confirm("この注文を削除しますか？")) return;
    const res = await fetch(`/api/customer/orders/${id}`, { method: "DELETE" });
    if (res.ok) {
      fetch("/api/customer/orders").then((r) => r.ok ? r.json() : []).then(setOrders);
    } else {
      const data = await res.json();
      alert(data.error ?? "削除に失敗しました");
    }
  };

  useEffect(() => {
    fetch("/api/customer/me").then((r) => { if (!r.ok) router.push("/portal/login"); });
    fetch("/api/customer/orders").then((r) => r.ok ? r.json() : []).then(setOrders);
  }, [router]);

  const filtered = orders
    .filter((o) => {
      const d = o.requestedAt.slice(0, 10);
      if (dateFrom && d < dateFrom) return false;
      if (dateTo && d > dateTo) return false;
      return true;
    })
    .filter((o) => !query ||
      o.requestNumber.includes(query) ||
      o.items.some((i) =>
        (i.product?.name ?? "").includes(query) ||
        (i.product?.category ?? "").includes(query) ||
        (i.product?.sakaMai ?? "").includes(query)
      )
    );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold text-gray-900">発注管理</h1>
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <span className="text-gray-500 text-sm">〜</span>
        <input
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && setQuery(search)}
          placeholder="受注番号・商品名・種別・酒米で検索..."
          className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-56"
        />
        <button onClick={() => setQuery(search)} className="bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700">検索</button>
        {query && <button onClick={() => { setSearch(""); setQuery(""); }} className="text-sm text-gray-500 hover:text-gray-700 px-2">クリア</button>}
      </div>

      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="w-full text-sm whitespace-nowrap">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
            <tr>
              <th className="px-4 py-3 text-left">発注日時</th>
              <th className="px-4 py-3 text-left">発注先</th>
              <th className="px-4 py-3 text-left">商品名</th>
              <th className="px-4 py-3 text-left">種別</th>
              <th className="px-4 py-3 text-left">酒米</th>
              <th className="px-4 py-3 text-center">容量</th>
              <th className="px-4 py-3 text-right">小売値</th>
              <th className="px-4 py-3 text-right">卸売値</th>
              <th className="px-4 py-3 text-right">ロット</th>
              <th className="px-4 py-3 text-center">ケース数</th>
              <th className="px-4 py-3 text-center">ステータス</th>
              <th className="px-4 py-3 text-center">操作</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={12} className="text-center py-12 text-gray-400">注文履歴がありません</td></tr>
            ) : (
              filtered.map((o) => {
                const st = STATUS_LABEL[o.status] ?? { label: o.status, cls: "bg-gray-100 text-gray-500" };
                return (
                  <React.Fragment key={o.id}>
                    {o.items.map((item, idx) => {
                      const lot = item.volume === "1800ml"
                        ? (item.product?.unit1800 ?? "—")
                        : item.volume === "720ml"
                        ? (item.product?.unit720 ?? "—")
                        : (item.product?.unit1800 ?? item.product?.unit720 ?? "—");
                      return (
                        <tr key={item.id} className={`border-t border-gray-100 hover:bg-gray-50 ${idx === o.items.length - 1 ? "border-b-2 border-b-gray-200" : ""}`}>
                          {idx === 0 && (
                            <td className="px-4 py-3 text-gray-500 whitespace-nowrap align-top text-center" rowSpan={o.items.length}>
                              {new Date(o.requestedAt).toLocaleDateString("ja-JP")}
                              <div className="mt-0.5">
                                {new Date(o.requestedAt).toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" })}
                              </div>
                            </td>
                          )}
                          {idx === 0 && (
                            <td className="px-4 py-3 font-medium text-gray-800 align-middle whitespace-nowrap" rowSpan={o.items.length}>
                              {o.sellerName ?? o.company?.setting?.companyName ?? "—"}
                            </td>
                          )}
                          {(() => { const n = item.productName ?? item.product?.name ?? "—"; return <td className="px-4 py-3 font-medium text-gray-900 cursor-default" title={n}>{n.length > 14 ? n.slice(0, 14) + "…" : n}</td>; })()}
                          <td className="px-4 py-3 text-gray-500 text-xs">{item.productCategory ?? item.product?.category ?? "—"}</td>
                          <td className="px-4 py-3 text-gray-500 text-xs">{item.productSakaMai ?? item.product?.sakaMai ?? "—"}</td>
                          <td className="px-4 py-3 text-center">
                            <span className={`text-xs font-bold px-2 py-1 rounded-full ${item.volume === "1800ml" ? "bg-amber-100 text-amber-700" : "bg-sky-100 text-sky-700"}`}>{item.volume}</span>
                          </td>
                          <td className="px-4 py-3 text-right text-gray-600">¥{item.unitPrice.toLocaleString()}</td>
                          <td className="px-4 py-3 text-right text-gray-600">
                            {item.product
                              ? item.volume === "1800ml"
                                ? item.product.wholesalePrice1800 != null ? `¥${item.product.wholesalePrice1800.toLocaleString()}` : "—"
                                : item.product.wholesalePrice720 != null ? `¥${item.product.wholesalePrice720.toLocaleString()}` : "—"
                              : "—"}
                          </td>
                          <td className="px-4 py-3 text-right text-gray-500">{lot}</td>
                          <td className="px-4 py-3 text-center font-semibold">{o.status === "REJECTED" ? "" : (item.confirmedQty ?? item.requestedQty)}</td>
                          {idx === 0 && (
                            <td className="px-4 py-3 text-center align-middle" rowSpan={o.items.length}>
                              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${st.cls}`}>{st.label}</span>
                            </td>
                          )}
                          {idx === 0 && (
                            <td className="px-4 py-3 text-center align-middle" rowSpan={o.items.length}>
                              {o.status === "PENDING" && (
                                <button onClick={() => router.push(`/portal/orders/${o.id}?edit=1`)}
                                  className="text-xs text-blue-600 hover:underline">編集</button>
                              )}
                              {o.status === "CONFIRMED" && (
                                <button onClick={() => router.push(`/portal/orders/${o.id}`)}
                                  className="text-xs font-medium text-gray-500 hover:underline">確認</button>
                              )}
                            </td>
                          )}
                        </tr>
                      );
                    })}
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
