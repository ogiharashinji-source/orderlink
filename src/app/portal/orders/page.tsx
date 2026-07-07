"use client";
import { useEffect, useState } from "react";
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
  order: { status: string } | null;
  product: {
    name: string;
    category: string | null;
    sakaMai: string | null;
    seimaiWari: string | null;
    alcohol: string | null;
    unit1800: string | null;
    unit720: string | null;
    unitOther: string | null;
    wholesalePrice1800: number | null;
    wholesalePrice720: number | null;
    wholesalePriceOther: number | null;
  } | null;
};

type OrderRequest = {
  id: number;
  requestNumber: string;
  status: "PENDING" | "CONFIRMED" | "REJECTED";
  cancelled: boolean;
  requestedAt: string;
  confirmedAt: string | null;
  notes: string | null;
  sellerName: string | null;
  company: { setting: { companyName: string } | null } | null;
  items: RequestItem[];
};

const STATUS_LABEL: Record<string, { label: string; cls: string }> = {
  PENDING:   { label: "確認待ち", cls: "text-orange-500 font-medium !bg-transparent !px-0 !py-0 !rounded-none" },
  CONFIRMED: { label: "確定", cls: "bg-gray-100 text-gray-500" },
  REJECTED:  { label: "在庫なし", cls: "bg-red-100 text-red-600" },
};

const oneMonthAgo = () => {
  const d = new Date();
  d.setMonth(d.getMonth() - 1);
  return d.toISOString().slice(0, 10);
};

const PAGE_SIZE = 10;

export default function PortalOrdersPage() {
  const [orders, setOrders] = useState<OrderRequest[]>([]);
  const [dateFrom, setDateFrom] = useState(oneMonthAgo());
  const [dateTo, setDateTo] = useState("");
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const router = useRouter();

  const handleDelete = async (id: number) => {
    if (!confirm("この注文を削除しますか？")) return;
    const res = await fetch(`/api/customer/orders/${id}`, { method: "DELETE" });
    if (res.ok) {
      fetch("/api/customer/orders").then((r) => r.ok ? r.json() : []).then((data) => {
        const sorted = [...data].sort((a: OrderRequest, b: OrderRequest) => {
          const ta = new Date(a.confirmedAt ?? a.requestedAt).getTime();
          const tb = new Date(b.confirmedAt ?? b.requestedAt).getTime();
          return tb - ta;
        });
        setOrders(sorted);
      });
    } else {
      const data = await res.json();
      alert(data.error ?? "削除に失敗しました");
    }
  };

  useEffect(() => {
    fetch("/api/customer/orders").then((r) => r.ok ? r.json() : []).then((data) => {
      const sorted = [...data].sort((a: OrderRequest, b: OrderRequest) => {
        const ta = new Date(a.confirmedAt ?? a.requestedAt).getTime();
        const tb = new Date(b.confirmedAt ?? b.requestedAt).getTime();
        return tb - ta;
      });
      setOrders(sorted);
    });
  }, []);

  const filtered = orders
    .filter((o) => {
      const d = (o.confirmedAt ?? o.requestedAt).slice(0, 10);
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

  // 注文をアイテム行単位にフラット化してからページング
  const rows = filtered.flatMap((o) =>
    o.items.map((item, idx) => ({ order: o, item, idx, isLast: idx === o.items.length - 1 }))
  );
  const totalPages = Math.ceil(rows.length / PAGE_SIZE);
  const pagedRows = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const applySearch = () => { setQuery(search); setPage(1); };
  const applyDateFrom = (v: string) => { setDateFrom(v); setPage(1); };
  const applyDateTo = (v: string) => { setDateTo(v); setPage(1); };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold text-gray-900">発注管理</h1>
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => applyDateFrom(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <span className="text-gray-500 text-sm">〜</span>
        <input
          type="date"
          value={dateTo}
          onChange={(e) => applyDateTo(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && applySearch()}
          placeholder="受注番号・商品名・種別・酒米で検索..."
          className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-56"
        />
        <button onClick={applySearch} className="bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700">検索</button>
        {query && <button onClick={() => { setSearch(""); setQuery(""); setPage(1); }} className="text-sm text-gray-500 hover:text-gray-700 px-2">クリア</button>}
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
            {pagedRows.length === 0 ? (
              <tr><td colSpan={12} className="text-center py-12 text-gray-400">注文履歴がありません</td></tr>
            ) : (
              pagedRows.map(({ order: o, item, isLast }) => {
                const st = STATUS_LABEL[o.status] ?? { label: o.status, cls: "bg-gray-100 text-gray-500" };
                const dateStr = new Date(o.confirmedAt ?? o.requestedAt).toLocaleDateString("ja-JP");
                const timeStr = new Date(o.confirmedAt ?? o.requestedAt).toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" });
                const seller = o.sellerName ?? o.company?.setting?.companyName ?? "—";
                const lot = item.volume === "1800ml"
                  ? (item.product?.unit1800 ?? "—")
                  : item.volume === "720ml"
                  ? (item.product?.unit720 ?? "—")
                  : (item.product?.unitOther ?? "—");
                return (
                  <tr key={item.id} className={`border-t border-gray-100 hover:bg-gray-50 ${isLast ? "border-b-2 border-b-gray-200" : ""}`}>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap text-center">
                      {dateStr}
                      <div className="mt-0.5">{timeStr}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-800 whitespace-nowrap">{seller}</td>
                    {(() => { const n = item.productName ?? item.product?.name ?? "—"; return <td className="px-4 py-3 text-gray-900 cursor-default" title={n}>{n.length > 14 ? n.slice(0, 14) + "…" : n}</td>; })()}
                    <td className="px-4 py-3 text-gray-500 text-xs">{item.productCategory ?? item.product?.category ?? "—"}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{item.productSakaMai ?? item.product?.sakaMai ?? "—"}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${item.volume === "1800ml" ? "bg-amber-100 text-amber-700" : item.volume === "720ml" ? "bg-sky-100 text-sky-700" : "bg-purple-100 text-purple-700"}`}>{item.volume}</span>
                    </td>
                    <td className="px-4 py-3 text-right text-gray-600">¥{item.unitPrice.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right text-gray-600">
                      {(() => {
                        const wp = item.volume === "1800ml"
                          ? item.product?.wholesalePrice1800
                          : item.volume === "720ml"
                          ? item.product?.wholesalePrice720
                          : item.product?.wholesalePriceOther;
                        return wp != null ? `¥${wp.toLocaleString()}` : "—";
                      })()}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-500">{lot}</td>
                    <td className="px-4 py-3 text-center font-semibold">
                      {(o.cancelled || item.order?.status === "CANCELLED")
                        ? <span className="text-red-500 text-xs font-bold">キャンセル</span>
                        : o.status === "REJECTED" ? ""
                        : (item.confirmedQty ?? item.requestedQty) === 0
                        ? <span className="text-red-500 text-xs font-bold">在庫なし</span>
                        : (item.confirmedQty ?? item.requestedQty)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${st.cls}`}>{st.label}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {o.status === "PENDING" && (
                        <button onClick={() => router.push(`/portal/orders/${o.id}?edit=1`)}
                          className="text-xs text-blue-600 hover:underline">編集</button>
                      )}
                      {o.status === "CONFIRMED" && (
                        <button onClick={() => router.push(`/portal/orders/${o.id}`)}
                          className="text-xs font-medium text-gray-500 hover:underline">確認</button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 rounded-lg text-sm border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            ‹ 前
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`px-3 py-1.5 rounded-lg text-sm border ${
                p === page
                  ? "bg-blue-600 text-white border-blue-600"
                  : "border-gray-300 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {p}
            </button>
          ))}
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1.5 rounded-lg text-sm border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            次 ›
          </button>
          <span className="text-xs text-gray-400 ml-2">{rows.length}件中 {(page - 1) * PAGE_SIZE + 1}〜{Math.min(page * PAGE_SIZE, rows.length)}件</span>
        </div>
      )}
    </div>
  );
}
