"use client";
import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

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
  product: { name: string; unit1800: string | null; unit720: string | null; category: string | null; sakaMai: string | null; seimaiWari: string | null; alcohol: string | null; wholesalePrice1800: number | null; wholesalePrice720: number | null } | null;
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
  customer: { name: string; company: string | null } | null;
  items: OrderItem[];
};

const currentMonth = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
};

const monthOptions = () => {
  const options = [{ value: "", label: "全期間" }];
  const now = new Date();
  for (let i = 0; i < 24; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = `${d.getFullYear()}年${d.getMonth() + 1}月`;
    options.push({ value, label });
  }
  return options;
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [month, setMonth] = useState(currentMonth());
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const router = useRouter();

  const load = useCallback(() => {
    const params = new URLSearchParams();
    if (month) params.set("month", month);
    if (query) params.set("q", query);
    fetch(`/api/orders?${params}`).then((r) => r.json()).then(setOrders);
  }, [month, query]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id: number) => {
    if (!confirm("この受注を削除しますか？")) return;
    await fetch(`/api/orders/${id}`, { method: "DELETE" });
    load();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-bold text-gray-900 mr-2">受注管理</h1>
        <select
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {monthOptions().map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
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
              orders.map((o) => (
                <React.Fragment key={o.id}>
                  {o.items.map((item, idx) => (
                    <tr
                      key={item.id}
                      className={`border-t border-gray-100 hover:bg-gray-50 ${
                        idx === o.items.length - 1 ? "border-b-2 border-b-gray-200" : ""
                      }`}
                    >
                      {/* 受注日時 */}
                      {idx === 0 && (
                        <td className="px-4 py-3 text-gray-500 align-top text-center whitespace-nowrap" rowSpan={o.items.length}>
                          {new Date(o.orderDate).toLocaleDateString("ja-JP")}
                          <div className="mt-0.5">
                            {new Date(o.orderDate).toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" })}
                          </div>
                        </td>
                      )}

                      {/* 会社名 */}
                      {idx === 0 && (
                        <td className="px-4 py-3 text-left align-middle" rowSpan={o.items.length}>
                          <div className="font-medium text-gray-900">{o.customerName ?? o.customer?.name ?? "—"}</div>
                        </td>
                      )}

                      {/* 商品名 */}
                      <td className="px-4 py-3 text-left text-gray-800 font-medium" title={item.productName ?? item.product?.name ?? ""}>
                        {(() => { const n = item.productName ?? item.product?.name ?? "—"; return n.length > 14 ? n.slice(0, 14) + "…" : n; })()}
                      </td>

                      {/* 種別 */}
                      <td className="px-4 py-3 text-left text-gray-500 text-xs">{item.productCategory ?? item.product?.category ?? "—"}</td>

                      {/* 酒米 */}
                      <td className="px-4 py-3 text-left text-gray-500 text-xs">{item.productSakaMai ?? item.product?.sakaMai ?? "—"}</td>

                      {/* 容量 */}
                      <td className="px-4 py-3 text-center text-sm text-gray-700 whitespace-nowrap">
                        {item.volume ?? "—"}
                      </td>

                      {/* 小売値 */}
                      <td className="px-4 py-3 text-center text-sm text-gray-700">
                        ¥{item.unitPrice.toLocaleString()}
                      </td>

                      {/* 卸売値 */}
                      <td className="px-4 py-3 text-center text-sm text-gray-700">
                        {item.product
                          ? item.volume === "1800ml"
                            ? item.product.wholesalePrice1800 != null ? `¥${item.product.wholesalePrice1800.toLocaleString()}` : "—"
                            : item.product.wholesalePrice720 != null ? `¥${item.product.wholesalePrice720.toLocaleString()}` : "—"
                          : "—"}
                      </td>

                      {/* ロット */}
                      <td className="px-4 py-3 text-center text-sm text-gray-700">
                        {item.volume === "1800ml" ? (item.product?.unit1800 ?? "—") : item.volume === "720ml" ? (item.product?.unit720 ?? "—") : (item.product?.unit1800 ?? item.product?.unit720 ?? "—")}
                      </td>

                      {/* 販売数 */}
                      <td className="px-4 py-3 text-center font-semibold text-gray-700">
                        {item.quantity}
                      </td>


                      {/* 備考 + 操作（先頭行のみ rowspan） */}
                      {idx === 0 && (
                        <>
                          <td className="px-4 py-3 align-middle text-center" rowSpan={o.items.length}>
                            <span className="text-gray-500 text-xs max-w-[80px] truncate block mx-auto">
                              {o.notes ? (o.notes.length > 10 ? o.notes.slice(0, 10) + "…" : o.notes) : ""}
                            </span>
                          </td>
                          <td className="px-4 py-3 align-middle text-center" rowSpan={o.items.length}>
                            <button onClick={() => router.push(`/orders/${o.id}`)} className="text-blue-600 hover:underline text-xs whitespace-nowrap">詳細</button>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
