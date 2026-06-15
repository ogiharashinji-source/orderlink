"use client";
import { useEffect, useState } from "react";

type Customer = { id: number; name: string; company: string | null; faxNumber: string | null };
type Product = { id: number; name: string; price: number; unit: string };

export default function FaxCreateForm({ onCreated }: { onCreated: () => void }) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customerId, setCustomerId] = useState("");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  const [allProducts, setAllProducts] = useState(true);
  const [expiresAt, setExpiresAt] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/customers").then((r) => r.json()).then(setCustomers);
    fetch("/api/products").then((r) => r.json()).then((data) => {
      setProducts(data);
      setSelectedProducts(data.map((p: Product) => p.id));
    });
  }, []);

  const toggleProduct = (id: number) => {
    setSelectedProducts((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId) return alert("顧客を選択してください");
    setSaving(true);
    const res = await fetch("/api/order-links", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerId,
        title: title || null,
        message: message || null,
        productIds: allProducts ? [] : selectedProducts,
        expiresAt: expiresAt || null,
      }),
    });
    if (res.ok) onCreated();
    else { alert("作成に失敗しました"); setSaving(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-2xl">
      <div className="bg-white rounded-lg shadow p-5 space-y-4">
        <h2 className="font-semibold text-gray-800">基本設定</h2>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">送付先 (酒屋) *</label>
          <select
            required
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
            className={selectCls}
          >
            <option value="">顧客を選択...</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}{c.company ? ` (${c.company})` : ""}{c.faxNumber ? ` FAX: ${c.faxNumber}` : ""}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">発注書タイトル</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="例: 2026年6月 ご注文書"
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">有効期限</label>
            <input
              type="date"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              className={inputCls}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">メッセージ</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={2}
            placeholder="例: いつもお世話になっております。ご注文をQRコードよりお願いいたします。"
            className={inputCls}
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-gray-800">掲載商品</h2>
          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
            <input
              type="checkbox"
              checked={allProducts}
              onChange={(e) => setAllProducts(e.target.checked)}
              className="rounded"
            />
            すべての商品を掲載
          </label>
        </div>

        {!allProducts && (
          <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto">
            {products.map((p) => (
              <label
                key={p.id}
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedProducts.includes(p.id)
                    ? "border-blue-400 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedProducts.includes(p.id)}
                  onChange={() => toggleProduct(p.id)}
                  className="rounded"
                />
                <span className="font-medium text-gray-800">{p.name}</span>
                <span className="text-gray-500 text-sm ml-auto">¥{p.price.toLocaleString()} / {p.unit}</span>
              </label>
            ))}
          </div>
        )}

        {!allProducts && selectedProducts.length === 0 && (
          <p className="text-sm text-red-500">商品を1つ以上選択してください</p>
        )}
      </div>

      <button
        type="submit"
        disabled={saving}
        className="bg-blue-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
      >
        {saving ? "作成中..." : "発注書リンクを作成"}
      </button>
    </form>
  );
}

const inputCls = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";
const selectCls = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";
