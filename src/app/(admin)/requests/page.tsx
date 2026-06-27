"use client";
import { useEffect, useState, useCallback } from "react";
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
  product: { name: string; unit: string; unit1800: string | null; unit720: string | null; unitOther: string | null; category: string | null; sakaMai: string | null; seimaiWari: string | null; alcohol: string | null; wholesalePrice1800: number | null; wholesalePrice720: number | null; wholesalePriceOther: number | null } | null;
};
type OrderRequest = {
  id: number;
  requestNumber: string;
  status: "PENDING" | "CONFIRMED" | "REJECTED";
  requestedAt: string;
  notes: string | null;
  customer: { name: string; company: string | null };
  items: RequestItem[];
};

type ModalState = {
  req: OrderRequest;
  freshReq: OrderRequest;
  modalQtys: Record<number, string>;
} | null;

export default function RequestsPage() {
  const [requests, setRequests] = useState<OrderRequest[]>([]);
  const [editedQtys, setEditedQtys] = useState<Record<number, string>>({});
  const [confirming, setConfirming] = useState<number | null>(null);
  const [modal, setModal] = useState<ModalState>(null);
  const [adminReply, setAdminReply] = useState("");
  const router = useRouter();

  const handleOutOfStock = async () => {
    if (!modal) return;
    const { req, freshReq } = modal;
    setModal(null);
    setConfirming(req.id);
    const confirmedItems = freshReq.items.map((item) => ({
      requestItemId: item.id,
      confirmedQty: 0,
      unitPrice: item.unitPrice,
    }));
    const res = await fetch(`/api/requests/${req.id}/confirm`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ confirmedItems, adminReply: adminReply || undefined }),
    });
    if (res.ok) {
      window.location.href = "/orders";
    } else {
      const result = await res.json();
      alert(result.error ?? "エラーが発生しました");
      setConfirming(null);
    }
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
    const freshData: OrderRequest[] = await fetch("/api/requests").then((r) => r.json());
    const freshReq = freshData.find((r) => r.id === req.id);
    if (!freshReq) { alert("リクエストが見つかりません"); return; }
    const modalQtys: Record<number, string> = {};
    freshReq.items.forEach((item) => { modalQtys[item.id] = String(item.requestedQty); });
    setAdminReply("");
    setModal({ req, freshReq, modalQtys });
  };

  const handleModalOk = async () => {
    if (!modal) return;
    const { req, freshReq, modalQtys } = modal;
    setModal(null);
    setConfirming(req.id);
    const confirmedItems = freshReq.items.map((item) => ({
      requestItemId: item.id,
      confirmedQty: parseInt(modalQtys[item.id] ?? "0") || 0,
      unitPrice: item.unitPrice,
    }));
    const res = await fetch(`/api/requests/${req.id}/confirm`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ confirmedItems, adminReply: adminReply || undefined }),
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
      {/* 確認モーダル */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-5xl mx-4 p-6 space-y-4">
            <h2 className="text-base font-bold text-gray-900">以下の内容で受注を確定しますか？</h2>
            <table className="w-full text-sm whitespace-nowrap border border-gray-200 rounded-lg overflow-hidden">
              <thead className="bg-gray-50 text-gray-500 text-xs">
                <tr>
                  <th className="px-3 py-2 text-left">商品名</th>
                  <th className="px-3 py-2 text-left">種別</th>
                  <th className="px-3 py-2 text-left">酒米</th>
                  <th className="px-3 py-2 text-center">精米歩合</th>
                  <th className="px-3 py-2 text-center">アルコール</th>
                  <th className="px-3 py-2 text-center">容量</th>
                  <th className="px-3 py-2 text-center">希望ケース</th>
                  <th className="px-3 py-2 text-center">販売数</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {modal.freshReq.items.map((item) => (
                  <tr key={item.id}>
                    <td className="px-3 py-2 font-medium">{item.productName ?? item.product?.name ?? "—"}</td>
                    <td className="px-3 py-2 text-gray-500">{item.productCategory ?? item.product?.category ?? "—"}</td>
                    <td className="px-3 py-2 text-gray-500">{item.productSakaMai ?? item.product?.sakaMai ?? "—"}</td>
                    <td className="px-3 py-2 text-center text-gray-500">{item.productSeimaiWari ?? item.product?.seimaiWari ?? "—"}</td>
                    <td className="px-3 py-2 text-center text-gray-500">{item.productAlcohol ?? item.product?.alcohol ?? "—"}</td>
                    <td className="px-3 py-2 text-center">
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${item.volume === "1800ml" ? "bg-amber-100 text-amber-700" : item.volume === "720ml" ? "bg-sky-100 text-sky-700" : "bg-purple-100 text-purple-700"}`}>{item.volume ?? "—"}</span>
                    </td>
                    <td className="px-3 py-2 text-center text-gray-700">{item.requestedQty}</td>
                    <td className="px-3 py-2 text-center">
                      <select
                        value={modal.modalQtys[item.id] ?? String(item.requestedQty)}
                        onChange={(e) => setModal((m) => m ? { ...m, modalQtys: { ...m.modalQtys, [item.id]: e.target.value } } : m)}
                        className="border border-gray-300 rounded-lg px-2 py-1 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      >
                        {Array.from({ length: item.requestedQty + 1 }, (_, i) => (
                          <option key={i} value={i}>{i}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="bg-gray-50 rounded-lg px-4 py-3">
              <p className="text-xs text-gray-400 mb-1">メッセージ</p>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{modal.freshReq.notes || "—"}</p>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-gray-400">返答メッセージ（任意）</label>
              <textarea
                value={adminReply}
                onChange={(e) => setAdminReply(e.target.value)}
                rows={3}
                placeholder="顧客へのメッセージを入力..."
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setModal(null)}
                className="px-5 py-2 rounded-lg text-sm font-medium border border-gray-300 text-gray-700 hover:bg-gray-50">
                キャンセル
              </button>
              <button onClick={() => { if (!confirm("在庫なしとして処理しますか？（受注数0で確定されます）")) return; handleOutOfStock(); }}
                className="px-5 py-2 rounded-lg text-sm font-medium text-red-500 border border-red-300 hover:bg-red-50">
                在庫なし
              </button>
              <button onClick={() => { if (!confirm("受注を確定しますか？")) return; handleModalOk(); }}
                className="px-5 py-2 rounded-lg text-sm font-bold text-white bg-blue-600 hover:bg-blue-700">
                確定する
              </button>
            </div>
          </div>
        </div>
      )}
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
              <th className="px-4 py-3 text-center">容量</th>
              <th className="px-4 py-3 text-center">小売値</th>
              <th className="px-4 py-3 text-center">卸売値</th>
              <th className="px-4 py-3 text-center">ロット</th>
              <th className="px-4 py-3 text-center">希望ケース</th>
              <th className="px-4 py-3 text-center">操作</th>
            </tr>
          </thead>
          <tbody>
            {requests.length === 0 ? (
              <tr>
                <td colSpan={11} className="text-center py-12 text-gray-400">
                  未確認のリクエストはありません
                </td>
              </tr>
            ) : (
              requests.flatMap((req) =>
                req.items.map((item) => (
                  <tr key={`${req.id}-${item.id}`} className="border-t border-gray-100 hover:bg-gray-50 border-b-2 border-b-gray-200">
                    <td className="px-4 py-3 text-gray-500 text-center whitespace-nowrap">
                      {new Date(req.requestedAt).toLocaleDateString("ja-JP")}
                      <div className="mt-0.5">
                        {new Date(req.requestedAt).toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-left text-gray-800 font-medium">{req.customer.name}</td>
                    <td className="px-4 py-3 text-left text-gray-800 font-medium">{item.productName ?? item.product?.name ?? "—"}</td>
                    <td className="px-4 py-3 text-left text-gray-500 text-xs">{item.productCategory ?? item.product?.category ?? "—"}</td>
                    <td className="px-4 py-3 text-left text-gray-500 text-xs">{item.productSakaMai ?? item.product?.sakaMai ?? "—"}</td>
                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${item.volume === "1800ml" ? "bg-amber-100 text-amber-700" : item.volume === "720ml" ? "bg-sky-100 text-sky-700" : "bg-purple-100 text-purple-700"}`}>{item.volume ?? "—"}</span>
                    </td>
                    <td className="px-4 py-3 text-center text-sm text-gray-700">¥{item.unitPrice.toLocaleString()}</td>
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
                    <td className="px-4 py-3 text-center text-sm text-gray-700">
                      {item.volume === "1800ml" ? (item.product?.unit1800 ?? "—") : item.volume === "720ml" ? (item.product?.unit720 ?? "—") : (item.product?.unitOther ?? "—")}
                    </td>
                    <td className="px-4 py-3 text-center text-gray-700">{item.requestedQty}</td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleConfirm(req)}
                        disabled={confirming === req.id}
                        className="bg-red-600 text-white px-5 py-1.5 rounded-lg text-xs font-bold hover:bg-red-700 disabled:opacity-50 whitespace-nowrap"
                      >
                        {confirming === req.id ? "処理中..." : "確認"}
                      </button>
                    </td>
                  </tr>
                ))
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
