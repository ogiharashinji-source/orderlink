"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

type OrderDetail = {
  id: number;
  orderNumber: string;
  status: string;
  totalAmount: number;
  notes: string | null;
  orderDate: string;
  deliveryDate: string | null;
  customerName: string | null;
  customerCompany: string | null;
  customerAddress: string | null;
  customerPhone: string | null;
  customerFax: string | null;
  customerEmail: string | null;
  customer: { id: number; name: string; company: string | null; address: string | null; email: string | null; phone: string | null; faxNumber: string | null } | null;
  items: Array<{
    id: number;
    quantity: number;
    unitPrice: number;
    volume: string | null;
    productName: string | null;
    productCategory: string | null;
    productSakaMai: string | null;
    productSeimaiWari: string | null;
    productAlcohol: string | null;
    product: {
      id: number; name: string; unit: string; unit1800: string | null; unit720: string | null;
      category: string | null; sakaMai: string | null; seimaiWari: string | null; alcohol: string | null;
      wholesalePrice1800: number | null; wholesalePrice720: number | null;
    } | null;
  }>;
};

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetch(`/api/orders/${id}`).then((r) => r.json()).then(setOrder);
  }, [id]);

  if (!order) return <div className="text-center py-20 text-gray-500">読み込み中...</div>;

  return (
    <div className="space-y-4 max-w-5xl">
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/orders" className="hover:text-blue-600">発注管理</Link>
        <span>›</span>
        <span>{order.orderNumber}</span>
      </div>

      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-900">受注日：{new Date(order.orderDate).toLocaleDateString("ja-JP")}</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => router.push("/orders")} className="text-sm text-blue-600 hover:underline">戻る</button>
          <button onClick={() => { if (confirm("販売先のデータも削除されます。削除しますか？")) fetch(`/api/orders/${id}`, { method: "DELETE" }).then(() => router.push("/orders")); }} className="text-sm text-red-500 hover:underline">削除</button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-5">
        <h2 className="font-semibold text-gray-800 mb-3">顧客情報</h2>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-gray-500">会社名</span>
            <p className="font-medium">{order.customerName ?? order.customer?.name ?? "—"}</p>
          </div>
          <div><span className="text-gray-500">住所</span><p className="font-medium">{order.customerAddress ?? order.customer?.address ?? "—"}</p></div>
          <div><span className="text-gray-500">電話</span><p className="font-medium">{order.customerPhone ?? order.customer?.phone ?? "—"}</p></div>
          <div><span className="text-gray-500">FAX</span><p className="font-medium">{order.customerFax ?? order.customer?.faxNumber ?? "—"}</p></div>
          {order.deliveryDate && <div><span className="text-gray-500">納品予定日</span><p className="font-medium">{new Date(order.deliveryDate).toLocaleDateString("ja-JP")}</p></div>}
        </div>
      </div>

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
              const lot = item.volume === "1800ml" ? (item.product?.unit1800 ?? "—") : item.volume === "720ml" ? (item.product?.unit720 ?? "—") : (item.product?.unit1800 ?? item.product?.unit720 ?? "—");
              const lotNum = (parseInt(item.volume === "1800ml" ? (item.product?.unit1800 ?? "1") : (item.product?.unit720 ?? "1")) || 1);
              const wp = item.volume === "1800ml" ? (item.product?.wholesalePrice1800 ?? null) : (item.product?.wholesalePrice720 ?? null);
              const subtotal = wp != null ? item.quantity * lotNum * wp : null;
              return (
                <tr key={item.id} className="border-t border-gray-100">
                  <td className="px-3 py-2 font-medium">{item.productName ?? item.product?.name ?? "—"}</td>
                  <td className="px-3 py-2 text-gray-500 text-xs">{item.productCategory ?? item.product?.category ?? "—"}</td>
                  <td className="px-3 py-2 text-gray-500 text-xs">{item.productSakaMai ?? item.product?.sakaMai ?? "—"}</td>
                  <td className="px-3 py-2 text-center text-gray-500 text-xs">{item.productSeimaiWari ?? item.product?.seimaiWari ?? "—"}</td>
                  <td className="px-3 py-2 text-center text-gray-500 text-xs">{item.productAlcohol ?? item.product?.alcohol ?? "—"}</td>
                  <td className="px-3 py-2 text-center">
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${item.volume === "1800ml" ? "bg-amber-100 text-amber-700" : "bg-sky-100 text-sky-700"}`}>
                      {item.volume ?? "—"}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-right">¥{item.unitPrice.toLocaleString()}</td>
                  <td className="px-3 py-2 text-right text-gray-600">
                    {wp != null ? `¥${wp.toLocaleString()}` : "—"}
                  </td>
                  <td className="px-3 py-2 text-right">{lot}</td>
                  <td className="px-3 py-2 text-right">{item.quantity}</td>
                  <td className="px-3 py-2 text-right font-medium">
                    {subtotal != null ? `¥${subtotal.toLocaleString()}` : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot className="bg-gray-50">
            {(() => {
              const total = order.items.reduce((sum, item) => {
                const lotNum = (parseInt(item.volume === "1800ml" ? (item.product?.unit1800 ?? "1") : (item.product?.unit720 ?? "1")) || 1);
                const wp = item.volume === "1800ml" ? (item.product?.wholesalePrice1800 ?? null) : (item.product?.wholesalePrice720 ?? null);
                if (wp == null) return sum;
                return sum + item.quantity * lotNum * wp;
              }, 0);
              return (
                <>
                  <tr>
                    <td colSpan={10} className="px-3 py-2 text-right font-semibold text-gray-700">合計</td>
                    <td className="px-3 py-2 text-right font-bold text-gray-900 text-base">¥{total.toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td colSpan={10} className="px-3 py-2 text-right text-gray-600 text-sm">消費税（10%）</td>
                    <td className="px-3 py-2 text-right text-gray-800 text-sm">¥{Math.floor(total * 0.1).toLocaleString()}</td>
                  </tr>
                  <tr className="border-t border-gray-200">
                    <td colSpan={10} className="px-3 py-2 text-right font-bold text-gray-800">税込合計</td>
                    <td className="px-3 py-2 text-right font-bold text-gray-900 text-base">¥{Math.floor(total * 1.1).toLocaleString()}</td>
                  </tr>
                </>
              );
            })()}
          </tfoot>
        </table>
      </div>

      <div className="bg-white rounded-lg shadow p-5">
        <h2 className="font-semibold text-gray-800 mb-2">メッセージ</h2>
        <p className="text-sm text-gray-600 whitespace-pre-wrap">{order.notes ?? "—"}</p>
      </div>
    </div>
  );
}
