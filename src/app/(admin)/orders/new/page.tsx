"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Customer = { id: number; name: string; company: string | null };
type Product = { id: number; name: string; price: number; unit: string };
type OrderItem = { productId: number; quantity: number; unitPrice: number };

export default function NewOrderPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customerId, setCustomerId] = useState("");
  const [items, setItems] = useState<OrderItem[]>([{ productId: 0, quantity: 1, unitPrice: 0 }]);
  const [notes, setNotes] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/customers").then((r) => r.json()).then(setCustomers);
    fetch("/api/products").then((r) => r.json()).then(setProducts);
  }, []);

  const setItem = (index: number, key: keyof OrderItem, value: string) => {
    setItems((prev) => {
      const next = [...prev];
      if (key === "productId") {
        const product = products.find((p) => p.id === Number(value));
        next[index] = { ...next[index], productId: Number(value), unitPrice: product?.price ?? 0 };
      } else {
        next[index] = { ...next[index], [key]: Number(value) };
      }
      return next;
    });
  };

  const addItem = () => setItems((prev) => [...prev, { productId: 0, quantity: 1, unitPrice: 0 }]);
  const removeItem = (index: number) => setItems((prev) => prev.filter((_, i) => i !== index));

  const total = items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId) return alert("顧客を選択してください");
    const validItems = items.filter((i) => i.productId > 0 && i.quantity > 0);
    if (validItems.length === 0) return alert("商品を1件以上追加してください");
    setSaving(true);
    await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customerId, items: validItems, notes, deliveryDate }),
    });
    router.push("/orders");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/orders" className="hover:text-blue-600">発注管理</Link>
        <span>›</span>
        <span>新規発注</span>
      </div>
      <h1 className="text-2xl font-bold text-gray-900">新規発注登録</h1>

      <form onSubmit={handleSubmit} className="space-y-4 max-w-3xl">
        <div className="bg-white rounded-lg shadow p-5 space-y-4">
          <h2 className="font-semibold text-gray-800">基本情報</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">顧客 *</label>
              <select
                required
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">顧客を選択...</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}{c.company ? ` (${c.company})` : ""}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">納品予定日</label>
              <input
                type="date"
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">備考</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-800">発注明細</h2>
            <button type="button" onClick={addItem} className="text-sm text-blue-600 hover:underline">+ 行追加</button>
          </div>
          <div className="space-y-2">
            {items.map((item, i) => (
              <div key={i} className="grid grid-cols-12 gap-2 items-center">
                <div className="col-span-5">
                  <select
                    value={item.productId || ""}
                    onChange={(e) => setItem(i, "productId", e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">商品を選択...</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div className="col-span-2">
                  <input
                    type="number"
                    min="1"
                    placeholder="数量"
                    value={item.quantity}
                    onChange={(e) => setItem(i, "quantity", e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="col-span-3">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="単価"
                    value={item.unitPrice}
                    onChange={(e) => setItem(i, "unitPrice", e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="col-span-1 text-right text-sm font-medium text-gray-600">
                  ¥{(item.quantity * item.unitPrice).toLocaleString()}
                </div>
                <div className="col-span-1 text-right">
                  {items.length > 1 && (
                    <button type="button" onClick={() => removeItem(i)} className="text-red-400 hover:text-red-600 text-lg leading-none">×</button>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="text-right text-lg font-bold text-gray-800 pt-2 border-t">
            合計: ¥{total.toLocaleString()}
          </div>
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={saving} className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
            {saving ? "登録中..." : "発注登録"}
          </button>
          <button type="button" onClick={() => router.push("/orders")} className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg text-sm font-medium hover:bg-gray-50">
            キャンセル
          </button>
        </div>
      </form>
    </div>
  );
}
