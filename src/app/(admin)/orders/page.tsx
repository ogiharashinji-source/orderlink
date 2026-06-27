"use client";
import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { downloadCsv } from "@/lib/csv";

type OrderItem = {
  id: number;
  quantity: number;
  unitPrice: number;
  volume: string | null;
  productName: string | null;
  productCategory: string | null;
  productSakaMai: string | null;
  productSeimaiWari: string | null;
  productAlcohol: string | null;
  product: { name: string; unit1800: string | null; unit720: string | null; unitOther: string | null; category: string | null; sakaMai: string | null; seimaiWari: string | null; alcohol: string | null; wholesalePrice1800: number | null; wholesalePrice720: number | null; wholesalePriceOther: number | null } | null;
};

type Order = {
  id: number;
  orderNumber: string;
  status: string;
  totalAmount: number;
  orderDate: string;
  notes: string | null;
  customerName: string | null;
  customerCompany: string | null;
  customer: { name: string; company: string | null; memberNumber: string | null } | null;
  items: OrderItem[];
};

const oneMonthAgo = () => {
  const d = new Date();
  d.setMonth(d.getMonth() - 1);
  return d.toISOString().slice(0, 10);
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [dateFrom, setDateFrom] = useState(oneMonthAgo());
  const [dateTo, setDateTo] = useState("");
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const router = useRouter();

  const load = useCallback(() => {
    const params = new URLSearchParams();
    if (dateFrom) params.set("from", dateFrom);
    if (dateTo) params.set("to", dateTo);
    if (query) params.set("q", query);
    fetch(`/api/orders?${params}`).then((r) => r.json()).then(setOrders);
  }, [dateFrom, dateTo, query]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id: number) => {
    if (!confirm("この受注を削除しますか？")) return;
    await fetch(`/api/orders/${id}`, { method: "DELETE" });
    load();
  };

  const handleCsvExport = () => {
    const header = ["受注日", "会員コード", "会社名", "商品", "種別", "酒米", "容量", "小売値", "卸売値", "ロット", "販売数", "税込合計", "備考"];
    const rows: (string | number | null)[][] = [];
    orders.forEach((o) => {
      const date = new Date(o.orderDate).toLocaleDateString("ja-JP");
      const memberCodeRaw = o.customer?.memberNumber ?? "";
      const memberCode = memberCodeRaw ? `="${memberCodeRaw}"` : "";
      const seller = o.customerName ?? o.customer?.name ?? "";
      o.items.forEach((item) => {
        const productName = item.productName ?? item.product?.name ?? "";
        const category = item.productCategory ?? item.product?.category ?? "";
        const sakaMai = item.productSakaMai ?? item.product?.sakaMai ?? "";
        const volume = item.volume ?? "";
        const retailPrice = item.unitPrice;
        const wholesalePrice = item.volume === "1800ml"
          ? (item.product?.wholesalePrice1800 ?? "")
          : item.volume === "720ml"
          ? (item.product?.wholesalePrice720 ?? "")
          : (item.product?.wholesalePriceOther ?? "");
        const lot = parseInt(
          item.volume === "1800ml" ? (item.product?.unit1800 ?? "1")
          : item.volume === "720ml" ? (item.product?.unit720 ?? "1")
          : (item.product?.unitOther ?? "1")
        ) || 1;
        const wp = typeof wholesalePrice === "number" ? wholesalePrice : 0;
        const taxIncTotal = wp > 0 ? Math.floor(item.quantity * lot * wp * 1.1) : "";
        rows.push([date, memberCode, seller, productName, category, sakaMai, volume, retailPrice, wholesalePrice, lot, item.quantity, taxIncTotal, o.notes ?? ""]);
      });
    });
    const date = new Date().toISOString().slice(0, 10);
    downloadCsv(`注文一覧_${date}.csv`, [header, ...rows]);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-bold text-gray-900 mr-2">受注管理</h1>
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
          placeholder="会社名・商品名で検索..."
          style={{ width: "300px" }}
          className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button onClick={() => setQuery(search)} className="bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700">検索</button>
        {query && <button onClick={() => { setSearch(""); setQuery(""); }} className="text-sm text-gray-500 hover:text-gray-700 px-2">クリア</button>}
        <div className="flex-1" />
        <button onClick={handleCsvExport} className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 shrink-0">
          CSV出力
        </button>
        <Link href="/orders/new" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 shrink-0">
          + 新規登録
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full text-sm whitespace-nowrap">
          <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
            <tr>
              <th className="px-4 py-3 text-center">受注日時</th>
              <th className="px-4 py-3 text-left">会社名</th>
              <th className="px-4 py-3 text-left">商品</th>
              <th className="px-4 py-3 text-left">種別</th>
              <th className="px-4 py-3 text-left">酒米</th>
              <th className="px-4 py-3 text-center">容量</th>
              <th className="px-4 py-3 text-center">小売値</th>
              <th className="px-4 py-3 text-center">卸売値</th>
              <th className="px-4 py-3 text-center">ロット</th>
              <th className="px-4 py-3 text-center">販売数</th>
              <th className="px-4 py-3 text-left">備考</th>
              <th className="px-4 py-3 text-center">操作</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan={12} className="text-center py-12 text-gray-400">受注データがありません</td>
              </tr>
            ) : (
              orders.map((o, orderIdx) => (
                <React.Fragment key={o.id}>
                  {o.items.map((item, idx) => {
                    const rowBg = orderIdx % 2 === 1 ? "bg-gray-50" : "bg-white";
                    return (
                    <tr
                      key={item.id}
                      className={`border-t border-gray-100 ${rowBg} border-b border-b-gray-200`}
                    >
                      {/* 受注日時 */}
                      <td className="px-4 py-3 text-gray-500 text-center whitespace-nowrap">
                        {new Date(o.orderDate).toLocaleDateString("ja-JP")}
                        <div className="mt-0.5">
                          {new Date(o.orderDate).toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </td>

                      {/* 会社名 */}
                      <td className="px-4 py-3 text-left">
                        {(() => { const n = o.customerName ?? o.customer?.name ?? "—"; return <div className="text-gray-900" title={n}>{n.length > 12 ? n.slice(0, 12) + "…" : n}</div>; })()}
                      </td>

                      {/* 商品名 */}
                      <td className="px-4 py-3 text-left text-gray-800" title={item.productName ?? item.product?.name ?? ""}>
                        {(() => { const n = item.productName ?? item.product?.name ?? "—"; return n.length > 14 ? n.slice(0, 14) + "…" : n; })()}
                      </td>

                      {/* 種別 */}
                      <td className="px-4 py-3 text-left text-gray-500 text-xs">{item.productCategory ?? item.product?.category ?? "—"}</td>

                      {/* 酒米 */}
                      <td className="px-4 py-3 text-left text-gray-500 text-xs">{item.productSakaMai ?? item.product?.sakaMai ?? "—"}</td>

                      {/* 容量 */}
                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${item.volume === "1800ml" ? "bg-amber-100 text-amber-700" : item.volume === "720ml" ? "bg-sky-100 text-sky-700" : "bg-purple-100 text-purple-700"}`}>{item.volume ?? "—"}</span>
                      </td>

                      {/* 小売値 */}
                      <td className="px-4 py-3 text-center text-sm text-gray-700">
                        ¥{item.unitPrice.toLocaleString()}
                      </td>

                      {/* 卸売値 */}
                      <td className="px-4 py-3 text-center text-sm text-gray-700">
                        {(() => {
                          const wp = item.volume === "1800ml"
                            ? item.product?.wholesalePrice1800
                            : item.volume === "720ml"
                            ? item.product?.wholesalePrice720
                            : item.product?.wholesalePriceOther;
                          return wp != null ? `¥${wp.toLocaleString()}` : "—";
                        })()}
                      </td>

                      {/* ロット */}
                      <td className="px-4 py-3 text-center text-sm text-gray-700">
                        {item.volume === "1800ml" ? (item.product?.unit1800 ?? "—") : item.volume === "720ml" ? (item.product?.unit720 ?? "—") : (item.product?.unitOther ?? "—")}
                      </td>

                      {/* 販売数 */}
                      <td className="px-4 py-3 text-center font-semibold text-gray-700">
                        {item.quantity}
                      </td>


                      {/* 備考 + 操作（各行に表示） */}
                      <td className="px-4 py-3 text-center">
                        {idx === 0 && (
                          <span className="text-gray-500 text-xs max-w-[80px] truncate block mx-auto">
                            {o.notes ? (o.notes.length > 10 ? o.notes.slice(0, 10) + "…" : o.notes) : ""}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {idx === 0 && (
                          <button onClick={() => router.push(`/orders/${o.id}`)} className="text-blue-600 hover:underline text-xs whitespace-nowrap">詳細</button>
                        )}
                      </td>
                    </tr>
                  );})}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
