"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

type RequestItem = {
  id: number;
  requestedQty: number;
  confirmedQty: number | null;
  unitPrice: number;
  volume: string | null;
  product: { id: number; name: string; unit: string; price: number } | null;
};
type OrderRequest = {
  id: number;
  requestNumber: string;
  status: "PENDING" | "CONFIRMED" | "REJECTED";
  requestedAt: string;
  confirmedAt: string | null;
  notes: string | null;
  customer: { id: number; name: string; company: string | null; phone: string | null };
  items: RequestItem[];
  order: { id: number; orderNumber: string; status: string } | null;
};

export default function RequestDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [req, setReq] = useState<OrderRequest | null>(null);
  const [confirmedQtys, setConfirmedQtys] = useState<Record<number, string>>({});
  const [unitPrices, setUnitPrices] = useState<Record<number, string>>({});
  const [notes, setNotes] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/requests/${id}`).then((r) => r.json()).then((data: OrderRequest) => {
      setReq(data);
      const qtys: Record<number, string> = {};
      const prices: Record<number, string> = {};
      data.items.forEach((item) => {
        qtys[item.id] = String(item.confirmedQty ?? item.requestedQty);
        prices[item.id] = String(item.unitPrice);
      });
      setConfirmedQtys(qtys);
      setUnitPrices(prices);
      setNotes(data.notes ?? "");
    });
  }, [id]);

  const handleConfirm = async () => {
    setSaving(true);
    const confirmedItems = req!.items.map((item) => ({
      requestItemId: item.id,
      confirmedQty: parseInt(confirmedQtys[item.id] ?? "0") || 0,
      unitPrice: parseFloat(unitPrices[item.id] ?? "0") || 0,
    }));

    const res = await fetch(`/api/requests/${id}/confirm`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ confirmedItems, notes, deliveryDate }),
    });
    const result = await res.json();
    if (res.ok) {
      router.push("/orders");
    } else {
      alert(result.error ?? "エラーが発生しました");
      setSaving(false);
    }
  };

  if (!req) return <div className="text-center py-20 text-gray-400">読み込み中...</div>;

  const total = req.items.reduce((sum, item) => {
    const qty = parseInt(confirmedQtys[item.id] ?? "0") || 0;
    const price = parseFloat(unitPrices[item.id] ?? "0") || 0;
    return sum + qty * price;
  }, 0);

  const isPending = req.status === "PENDING";

  return (
    <div className="max-w-2xl space-y-5">
      {/* パンくず */}
      <div className="flex items-center gap-2 text-sm text-gray-400">
        <Link href="/requests" className="hover:text-blue-600">リクエスト一覧</Link>
        <span>›</span>
        <span className="text-gray-600">{req.requestNumber}</span>
      </div>

      {/* 確定済みバナー */}
      {req.status === "CONFIRMED" && (
        <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 flex items-center justify-between">
          <p className="text-green-800 font-medium text-sm">受注確定済み</p>
          {req.order && (
            <Link href={`/orders/${req.order.id}`} className="text-sm text-blue-600 font-semibold hover:underline">
              {req.order.orderNumber} を見る →
            </Link>
          )}
        </div>
      )}

      {/* 顧客情報 */}
      <div className="bg-white rounded-xl shadow p-5">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">リクエスト情報</h2>
        <div className="grid grid-cols-2 gap-y-2 text-sm">
          <span className="text-gray-500">顧客</span>
          <span className="font-semibold text-gray-900">{req.customer.name}</span>
          {req.customer.company && <>
            <span className="text-gray-500">会社名</span>
            <span className="text-gray-700">{req.customer.company}</span>
          </>}
          {req.customer.phone && <>
            <span className="text-gray-500">電話</span>
            <span className="text-gray-700">{req.customer.phone}</span>
          </>}
          <span className="text-gray-500">リクエスト日時</span>
          <span className="text-gray-700">{new Date(req.requestedAt).toLocaleString("ja-JP")}</span>
          {req.notes && <>
            <span className="text-gray-500">備考</span>
            <span className="text-gray-700 italic">「{req.notes}」</span>
          </>}
        </div>
      </div>

      {/* 明細テーブル */}
      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800">リクエスト内容</h2>
          {isPending && (
            <p className="text-xs text-gray-400 mt-1">
              確定数量を入力してください。在庫がない場合は <strong>0</strong> を入力してそのまま確定してください。
            </p>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm whitespace-nowrap">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
              <tr>
                <th className="px-4 py-2.5 text-left">商品</th>
                <th className="px-4 py-2.5 text-center">希望数</th>
                <th className="px-4 py-2.5 text-center">確定数量</th>
                <th className="px-4 py-2.5 text-right">単価</th>
                <th className="px-4 py-2.5 text-right">小計</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {req.items.map((item) => {
                const cQty = parseInt(confirmedQtys[item.id] ?? "0") || 0;
                const price = parseFloat(unitPrices[item.id] ?? "0") || 0;
                const isZero = isPending && cQty === 0;
                return (
                  <tr key={item.id} className={isZero ? "bg-red-50" : "hover:bg-gray-50"}>
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {item.product?.name ?? "—"}
                      {isZero && (
                        <span className="ml-2 text-xs text-red-500 font-normal">在庫なし</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center text-gray-500">
                      {item.requestedQty} {item.product?.unit ?? ""}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {isPending ? (
                        <div className="flex items-center justify-center gap-1">
                          <input
                            type="number"
                            min="0"
                            max={item.requestedQty}
                            value={confirmedQtys[item.id] ?? ""}
                            onChange={(e) => setConfirmedQtys((p) => ({ ...p, [item.id]: e.target.value }))}
                            className={`w-20 text-center border rounded-lg px-2 py-1.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                              isZero ? "border-red-300 bg-red-50" : "border-gray-300"
                            }`}
                          />
                          <span className="text-gray-400 text-xs">{item.product?.unit ?? ""}</span>
                        </div>
                      ) : (
                        <span className={`font-semibold ${item.confirmedQty === 0 ? "text-red-500" : ""}`}>
                          {item.confirmedQty ?? "—"} {item.product?.unit ?? ""}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {isPending ? (
                        <div className="flex items-center justify-end gap-1">
                          <span className="text-gray-400 text-xs">¥</span>
                          <input
                            type="number"
                            min="0"
                            value={unitPrices[item.id] ?? ""}
                            onChange={(e) => setUnitPrices((p) => ({ ...p, [item.id]: e.target.value }))}
                            className="w-24 text-right border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      ) : (
                        <span>¥{item.unitPrice.toLocaleString()}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right font-medium">
                      {cQty === 0 ? <span className="text-gray-300">—</span> : `¥${(cQty * price).toLocaleString()}`}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-gray-50">
              <tr>
                <td colSpan={4} className="px-4 py-3 text-right font-semibold text-gray-700">合計</td>
                <td className="px-4 py-3 text-right font-bold text-gray-900 text-base">
                  ¥{total.toLocaleString()}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* 受注確定 */}
      {isPending && (
        <div className="bg-white rounded-xl shadow p-5 space-y-4">
          <h2 className="font-semibold text-gray-800">受注情報</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">納品予定日</label>
              <input
                type="date"
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">備考</label>
              <input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <button
            onClick={handleConfirm}
            disabled={saving}
            className="w-full bg-blue-600 text-white py-3 rounded-xl text-sm font-bold hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {saving ? "処理中..." : "✓ 受注確定"}
          </button>
        </div>
      )}
    </div>
  );
}
