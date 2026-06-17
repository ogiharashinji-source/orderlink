"use client";
import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

type RequestItem = {
  id: number;
  requestedQty: number;
  unitPrice: number;
  volume: string | null;
  productName: string | null;
  productCategory: string | null;
  productSakaMai: string | null;
  productSeimaiWari: string | null;
  productAlcohol: string | null;
  product: { name: string; unit: string; unit1800: string | null; unit720: string | null; category: string | null; sakaMai: string | null; seimaiWari: string | null; alcohol: string | null } | null;
};
type OrderRequest = {
  id: number;
  status: "PENDING" | "CONFIRMED" | "REJECTED";
  requestedAt: string;
  notes: string | null;
  customer: { name: string; company: string | null };
  items: RequestItem[];
};

export default function RequestsPage() {
  const [requests, setRequests] = useState<OrderRequest[]>([]);
  const [editedQtys, setEditedQtys] = useState<Record<number, string>>({});
  const [confirming, setConfirming] = useState<number | null>(null);
  const router = useRouter();

  const handleDelete = async (id: number) => {
    if (!confirm("このリクエストを削除しますか？")) return;
    await fetch(`/api/requests/${id}`, { method: "DELETE" });
    load();
  };

  const load = useCallback(() => {
    fetch("/api/requests")
      .then((r) => r.json())
      .then((data: OrderRequest[]) => {
        // 未確認のみ表示
        const pending = data.filter((r) => r.status === "PENDING");
        setRequests(pending);
        const qtys: Record<number, string> = {};
        pending.forEach((req) =>
          req.items.forEach((item) => {
            qtys[item.id] = String(item.requestedQty);
          })
        );
        setEditedQtys(qtys);
      });
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleConfirm = async (req: OrderRequest) => {
    // 最新データを取得してポップアップに反映
    const freshData: OrderRequest[] = await fetch("/api/requests").then((r) => r.json());
    const freshReq = freshData.find((r) => r.id === req.id);
    if (!freshReq) { alert("リクエストが見つかりません"); return; }

    // 最新の希望数量でeditedQtysを上書き
    const freshQtys: Record<number, string> = {};
    freshReq.items.forEach((item) => { freshQtys[item.id] = String(item.requestedQty); });
    setEditedQtys((prev) => ({ ...prev, ...freshQtys }));

    const lines = freshReq.items.map((item) => {
      const parts = [
        item.productName ?? item.product?.name,
        item.productCategory ?? item.product?.category,
        item.productSakaMai ?? item.product?.sakaMai,
        item.productSeimaiWari ?? item.product?.seimaiWari ?? null,
        item.volume,
      ].filter(Boolean).join("　");
      return `・${parts}　ケース数: ${freshQtys[item.id] ?? item.requestedQty}`;
    }).join("\n");
    const notesLine = freshReq.notes ? `\n\n備考: ${freshReq.notes}` : "";
    if (!confirm(`以下の内容で受注を確定しますか？\n\n${lines}${notesLine}`)) return;
    setConfirming(req.id);
    const confirmedItems = freshReq.items.map((item) => ({
      requestItemId: item.id,
      confirmedQty: parseInt(freshQtys[item.id] ?? "0") || 0,
      unitPrice: item.unitPrice,
    }));
    const res = await fetch(`/api/requests/${req.id}/confirm`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ confirmedItems }),
    });
    if (res.ok) {
      window.location.href = "/orders";
    } else {
      const result = await res.json();
      alert(result.error ?? "エラーが発生しました");
      setConfirming(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold text-gray-900">リクエスト一覧</h1>
        {requests.length > 0 && (
          <span className="bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
            {requests.length}件
          </span>
        )}
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full text-sm whitespace-nowrap">
          <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
            <tr>
              <th className="px-4 py-3 text-center">リクエスト日</th>
              <th className="px-4 py-3 text-left">会社名</th>
              <th className="px-4 py-3 text-left">商品</th>
              <th className="px-4 py-3 text-left">種別</th>
              <th className="px-4 py-3 text-left">酒米</th>
              <th className="px-4 py-3 text-center">精米歩合</th>
              <th className="px-4 py-3 text-center">アルコール</th>
              <th className="px-4 py-3 text-center">容量</th>
              <th className="px-4 py-3 text-center">金額</th>
              <th className="px-4 py-3 text-center">ロット</th>
              <th className="px-4 py-3 text-center">希望ケース</th>
              <th className="px-4 py-3 text-center">販売数</th>
              <th className="px-4 py-3 text-left">備考</th>
              <th className="px-4 py-3 text-center">操作</th>
            </tr>
          </thead>
          <tbody>
            {requests.length === 0 ? (
              <tr>
                <td colSpan={14} className="text-center py-12 text-gray-400">
                  未確認のリクエストはありません
                </td>
              </tr>
            ) : (
              requests.map((req) => (
                <React.Fragment key={req.id}>
                  {req.items.map((item, idx) => (
                    <tr
                      key={item.id}
                      className={`border-t border-gray-100 hover:bg-gray-50 ${
                        idx === req.items.length - 1 ? "border-b-2 border-b-gray-200" : ""
                      }`}
                    >
                      {/* リクエスト日・備考（先頭行のみ rowspan） */}
                      {idx === 0 && (
                        <td
                          className="px-4 py-3 text-gray-500 align-top text-center whitespace-nowrap"
                          rowSpan={req.items.length}
                        >
                          {new Date(req.requestedAt).toLocaleDateString("ja-JP")}
                          <div className="mt-0.5">
                            {new Date(req.requestedAt).toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" })}
                          </div>
                        </td>
                      )}

                      {/* 顧客（先頭行のみ rowspan） */}
                      {idx === 0 && (
                        <td
                          className="px-4 py-3 text-left text-gray-800 font-medium"
                          rowSpan={req.items.length}
                        >
                          {req.customer.name}
                        </td>
                      )}

                      {/* 商品名（1行1商品） */}
                      <td className="px-4 py-3 text-left text-gray-800 font-medium">
                        {item.productName ?? item.product?.name ?? "—"}
                      </td>

                      {/* 種別 */}
                      <td className="px-4 py-3 text-left text-gray-500 text-xs">{item.productCategory ?? item.product?.category ?? "—"}</td>

                      {/* 酒米 */}
                      <td className="px-4 py-3 text-left text-gray-500 text-xs">{item.productSakaMai ?? item.product?.sakaMai ?? "—"}</td>

                      {/* 精米歩合 */}
                      <td className="px-4 py-3 text-center text-gray-500 text-xs">{item.productSeimaiWari ?? item.product?.seimaiWari ?? "—"}</td>

                      {/* アルコール */}
                      <td className="px-4 py-3 text-center text-gray-500 text-xs">{item.productAlcohol ?? item.product?.alcohol ?? "—"}</td>

                      {/* 容量 */}
                      <td className="px-4 py-3 text-center text-sm text-gray-700 whitespace-nowrap">
                        {item.volume ?? "—"}
                      </td>

                      {/* 金額 */}
                      <td className="px-4 py-3 text-center text-sm text-gray-700">
                        ¥{item.unitPrice.toLocaleString()}
                      </td>

                      {/* ロット */}
                      <td className="px-4 py-3 text-center text-sm text-gray-700">
                        {item.volume === "1800ml" ? (item.product?.unit1800 ?? "—") : item.volume === "720ml" ? (item.product?.unit720 ?? "—") : (item.product?.unit1800 ?? item.product?.unit720 ?? "—")}
                      </td>

                      {/* 希望ケース（変更不可） */}
                      <td className="px-4 py-3 text-center text-gray-700">
                        {item.requestedQty}
                      </td>

                      {/* 販売数（プルダウン） */}
                      <td className="px-4 py-3 text-center">
                        <select
                          value={editedQtys[item.id] ?? String(item.requestedQty)}
                          onChange={(e) =>
                            setEditedQtys((p) => ({ ...p, [item.id]: e.target.value }))
                          }
                          className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        >
                          {Array.from(
                            { length: Math.max(item.requestedQty, 30) + 1 },
                            (_, i) => <option key={i} value={i}>{i}</option>
                          )}
                        </select>
                      </td>

                      {/* 備考 + 確定ボタン（先頭行のみ rowspan） */}
                      {idx === 0 && (
                        <>
                          <td className="px-4 py-3 align-middle text-center" rowSpan={req.items.length}>
                            <span className="text-gray-500 text-xs max-w-[80px] truncate block mx-auto">
                              {req.notes ? (req.notes.length > 10 ? req.notes.slice(0, 10) + "…" : req.notes) : ""}
                            </span>
                          </td>
                          <td className="px-4 py-3 align-middle text-center" rowSpan={req.items.length}>
                            <div className="flex flex-col items-center gap-1">
                              <button
                                onClick={() => handleConfirm(req)}
                                disabled={confirming === req.id}
                                className="bg-blue-600 text-white px-5 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-700 disabled:opacity-50 whitespace-nowrap"
                              >
                                {confirming === req.id ? "処理中..." : "確認"}
                              </button>
                              <button
                                onClick={() => handleDelete(req.id)}
                                className="text-red-500 hover:underline text-xs"
                              >
                                削除
                              </button>
                            </div>
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
