"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

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
  product: { name: string; unit1800: string | null; unit720: string | null; stock1800: number | null; stock720: number | null; category: string | null; sakaMai: string | null; seimaiWari: string | null; alcohol: string | null; wholesalePrice1800: number | null; wholesalePrice720: number | null } | null;
};

type OrderRequest = {
  id: number;
  requestNumber: string;
  status: "PENDING" | "CONFIRMED" | "REJECTED";
  requestedAt: string;
  notes: string | null;
  customer: { name: string; address: string | null; phone: string | null; faxNumber: string | null; email: string | null };
  sellerName: string | null;
  sellerAddress: string | null;
  sellerPhone: string | null;
  sellerFax: string | null;
  sellerEmail: string | null;
  company: { setting: { companyName: string; address: string | null; phone: string | null; faxNumber: string | null; email: string | null } | null } | null;
  items: RequestItem[];
};

const STATUS_LABEL: Record<string, { label: string; cls: string }> = {
  PENDING:   { label: "確認待ち", cls: "bg-yellow-100 text-yellow-700" },
  CONFIRMED: { label: "受注確定", cls: "bg-green-100 text-green-700" },
  REJECTED:  { label: "キャンセル", cls: "bg-red-100 text-red-600" },
};

export default function PortalOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const [order, setOrder] = useState<OrderRequest | null>(null);
  const [editing, setEditing] = useState(searchParams.get("edit") === "1");
  const [editQtys, setEditQtys] = useState<Record<number, number>>({});
  const [editNotes, setEditNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  const loadOrder = () => {
    fetch("/api/customer/orders").then((r) => r.json()).then((orders: OrderRequest[]) => {
      const found = orders.find((o) => o.id === Number(id));
      if (found) {
        setOrder(found);
        const qtys: Record<number, number> = {};
        found.items.forEach((item) => { qtys[item.id] = item.requestedQty; });
        setEditQtys(qtys);
        setEditNotes(found.notes ?? "");
      } else {
        router.push("/portal/orders");
      }
    });
  };

  useEffect(() => {
    fetch("/api/customer/me").then((r) => { if (!r.ok) router.push("/portal/login"); });
    loadOrder();
  }, [id, router]);

  if (!order) return <div className="text-center py-20 text-gray-400">読み込み中...</div>;

  const getLot = (item: RequestItem) =>
    parseInt(item.volume === "1800ml" ? (item.product?.unit1800 ?? "1") : (item.product?.unit720 ?? "1")) || 1;

  const currentQtys = editing
    ? editQtys
    : order.status === "REJECTED"
    ? Object.fromEntries(order.items.map((i) => [i.id, 0]))
    : Object.fromEntries(order.items.map((i) => [i.id, i.confirmedQty ?? i.requestedQty]));
  const total = order.items.reduce((sum, item) => sum + (currentQtys[item.id] ?? item.requestedQty) * getLot(item) * item.unitPrice, 0);

  const st = STATUS_LABEL[order.status] ?? { label: order.status, cls: "bg-gray-100 text-gray-500" };

  const handleDelete = async () => {
    if (!order) return;
    if (!confirm("この注文を削除しますか？")) return;
    setDeleting(true);
    const res = await fetch(`/api/customer/orders/${order.id}`, { method: "DELETE" });
    setDeleting(false);
    if (res.ok) {
      router.push("/portal/orders");
    } else {
      const data = await res.json();
      alert(data.error ?? "削除に失敗しました");
    }
  };

  const handleSave = async () => {
    if (!order) return;
    setSaving(true);
    const res = await fetch(`/api/customer/orders/${order.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: order.items.map((item) => ({ id: item.id, requestedQty: editQtys[item.id] ?? item.requestedQty })),
        notes: editNotes,
      }),
    });
    setSaving(false);
    if (res.ok) {
      alert("保存しました");
      router.push("/portal/orders");
    } else {
      const data = await res.json();
      alert(data.error ?? "保存に失敗しました");
    }
  };

  return (
    <div className="space-y-4 max-w-5xl">

      {/* パンくず */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/portal/orders" className="hover:text-blue-600">発注管理</Link>
        <span>›</span>
        <span>{order.requestNumber}</span>
      </div>

      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-900">注文日：{new Date(order.requestedAt).toLocaleDateString("ja-JP")}</p>
        <div className="flex items-center gap-2">
          {order.status === "PENDING" && !editing && (
            <button onClick={() => setEditing(true)}
              className="text-sm bg-blue-600 text-white px-4 py-1.5 rounded-lg hover:bg-blue-700">
              編集
            </button>
          )}
          {editing && (
            <>
              <button onClick={handleDelete} disabled={deleting}
                className="text-sm text-red-500 border border-red-300 px-4 py-1.5 rounded-lg hover:bg-red-50 disabled:opacity-50">
                {deleting ? "削除中..." : "削除"}
              </button>
              <button onClick={handleSave} disabled={saving}
                className="text-sm bg-blue-600 text-white px-4 py-1.5 rounded-lg hover:bg-blue-700 disabled:opacity-50">
                {saving ? "保存中..." : "保存"}
              </button>
            </>
          )}
          {order.status === "CONFIRMED" && (
            <span className="text-xs text-red-600 font-medium">＊発注確定後のキャンセルは、売主様に依頼して削除してください。</span>
          )}
          <button onClick={() => router.push("/portal/orders")} className="text-sm text-blue-600 hover:underline">戻る</button>
        </div>
      </div>

      {/* 発注先情報 */}
      <div className="bg-white rounded-lg shadow p-5">
        <h2 className="font-semibold text-gray-800 mb-3">発注先</h2>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-gray-500">会社名</span>
            <p className="font-medium">{order.sellerName ?? order.company?.setting?.companyName ?? "—"}</p>
          </div>
          <div><span className="text-gray-500">住所</span><p className="font-medium">{order.sellerAddress ?? order.company?.setting?.address ?? "—"}</p></div>
          <div><span className="text-gray-500">電話</span><p className="font-medium">{order.sellerPhone ?? order.company?.setting?.phone ?? "—"}</p></div>
          <div><span className="text-gray-500">FAX</span><p className="font-medium">{order.sellerFax ?? order.company?.setting?.faxNumber ?? "—"}</p></div>
          <div><span className="text-gray-500">メール</span><p className="font-medium">{order.sellerEmail ?? order.company?.setting?.email ?? "—"}</p></div>
        </div>
      </div>

      {/* 発注明細 */}
      <div className="bg-white rounded-lg shadow p-5 overflow-x-auto">
        <h2 className="font-semibold text-gray-800 mb-3">発注明細</h2>
        <table className="w-full text-sm whitespace-nowrap">
          <thead className="text-gray-500 text-xs uppercase bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left">商品名</th>
              <th className="px-3 py-2 text-left">種別</th>
              <th className="px-3 py-2 text-left">酒米</th>
              <th className="px-3 py-2 text-center">精米歩合</th>
              <th className="px-3 py-2 text-center">アルコール</th>
              <th className="px-3 py-2 text-center">容量</th>
              <th className="px-3 py-2 text-right">小売値</th>
              <th className="px-3 py-2 text-right">卸売値</th>
              <th className="px-3 py-2 text-right">ロット</th>
              <th className="px-3 py-2 text-right">ケース数</th>
              <th className="px-3 py-2 text-right">小計</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => {
              const lot = getLot(item);
              const qty = currentQtys[item.id] ?? item.requestedQty;
              return (
                <tr key={item.id} className="border-t border-gray-100">
                  <td className="px-3 py-2 font-medium">{item.productName ?? item.product?.name ?? "—"}</td>
                  <td className="px-3 py-2 text-gray-500 text-xs">{item.productCategory ?? item.product?.category ?? "—"}</td>
                  <td className="px-3 py-2 text-gray-500 text-xs">{item.productSakaMai ?? item.product?.sakaMai ?? "—"}</td>
                  <td className="px-3 py-2 text-center text-gray-500 text-xs">{item.productSeimaiWari ?? item.product?.seimaiWari ?? "—"}</td>
                  <td className="px-3 py-2 text-center text-gray-500 text-xs">{item.productAlcohol ?? item.product?.alcohol ?? "—"}</td>
                  <td className="px-3 py-2 text-center">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${item.volume === "1800ml" ? "bg-amber-100 text-amber-700" : "bg-sky-100 text-sky-700"}`}>{item.volume ?? "—"}</span>
                  </td>
                  <td className="px-3 py-2 text-right">¥{item.unitPrice.toLocaleString()}</td>
                  <td className="px-3 py-2 text-right text-gray-600">
                    {item.product
                      ? item.volume === "1800ml"
                        ? item.product.wholesalePrice1800 != null ? `¥${item.product.wholesalePrice1800.toLocaleString()}` : "—"
                        : item.product.wholesalePrice720 != null ? `¥${item.product.wholesalePrice720.toLocaleString()}` : "—"
                      : "—"}
                  </td>
                  <td className="px-3 py-2 text-right">
                    {item.volume === "1800ml" ? (item.product?.unit1800 ?? "—") : item.volume === "720ml" ? (item.product?.unit720 ?? "—") : (item.product?.unit1800 ?? item.product?.unit720 ?? "—")}
                  </td>
                  <td className="px-3 py-2 text-right">
                    {editing ? (
                      <input
                        type="number" min="0"
                        max={(() => { const s = item.volume === "1800ml" ? item.product?.stock1800 : item.product?.stock720; return s != null && s > 0 ? s : undefined; })()}
                        value={editQtys[item.id] ?? item.requestedQty}
                        onChange={(e) => {
                          const s = item.volume === "1800ml" ? item.product?.stock1800 : item.product?.stock720;
                          let v = parseInt(e.target.value) || 0;
                          if (s != null && s > 0) v = Math.min(v, s);
                          setEditQtys((p) => ({ ...p, [item.id]: v }));
                        }}
                        className="w-16 text-right border border-blue-300 rounded px-2 py-0.5 focus:outline-none focus:ring-2 focus:ring-blue-400"
                      />
                    ) : (
                      qty
                    )}
                  </td>
                  <td className="px-3 py-2 text-right font-medium">¥{(qty * lot * item.unitPrice).toLocaleString()}</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot className="bg-gray-50">
            <tr>
              <td colSpan={10} className="px-3 py-2 text-right font-semibold text-gray-700">合計</td>
              <td className="px-3 py-2 text-right font-bold text-gray-900 text-base">¥{total.toLocaleString()}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* 備考 */}
      <div className="bg-white rounded-lg shadow p-5">
        <h2 className="font-semibold text-gray-800 mb-2">備考</h2>
        {editing ? (
          <textarea
            value={editNotes}
            onChange={(e) => setEditNotes(e.target.value)}
            rows={3}
            placeholder="備考・納品希望日など"
            className="w-full border border-blue-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        ) : (
          <p className="text-sm text-gray-600 whitespace-pre-wrap">{order.notes || "—"}</p>
        )}
      </div>

    </div>
  );
}
