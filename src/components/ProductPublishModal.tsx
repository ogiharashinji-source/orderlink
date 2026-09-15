"use client";
import { useEffect, useState } from "react";

type Customer = { id: number; name: string; company: string | null; email: string | null };
type PublishScope = "PRIVATE" | "PUBLIC" | "LIMITED";

const SCOPES: { value: PublishScope; label: string }[] = [
  { value: "PRIVATE", label: "非公開" },
  { value: "PUBLIC", label: "全体公開" },
  { value: "LIMITED", label: "限定公開" },
];

export default function ProductPublishModal({
  product,
  onClose,
  onSaved,
}: {
  product: { id: number; name: string; publishScope: PublishScope };
  onClose: () => void;
  onSaved: () => void;
}) {
  const [scope, setScope] = useState<PublishScope>(product.publishScope);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/customers?approved=1").then((r) => r.json()),
      fetch(`/api/products/${product.id}`).then((r) => r.json()),
    ]).then(([customerList, fullProduct]) => {
      setCustomers(customerList);
      // 現在PRIVATE/PUBLICでも、以前限定公開で選んでいた取引先があれば復元表示する
      const prevIds = (fullProduct.visibleTo ?? []).map((v: { customerId: number }) => v.customerId);
      setSelectedIds(new Set<number>(prevIds));
      setLoading(false);
    });
  }, [product.id]);

  const toggleCustomer = (id: number) =>
    setSelectedIds((prev) => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });
  const toggleAll = () =>
    setSelectedIds(selectedIds.size === customers.length ? new Set() : new Set(customers.map((c) => c.id)));

  const handleSave = async () => {
    if (scope === "LIMITED" && selectedIds.size === 0) {
      if (!confirm("取引先を1件も選択していません。この商品はどの取引先にも表示されなくなります。よろしいですか？")) return;
    }
    setSaving(true);
    await fetch(`/api/products/${product.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        publishScope: scope,
        ...(scope === "LIMITED" ? { customerIds: [...selectedIds] } : {}),
      }),
    });
    setSaving(false);
    onSaved();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md flex flex-col max-h-[85vh]">
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <h2 className="font-bold text-gray-900">公開範囲の設定</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
        </div>

        <div className="px-6 py-4 overflow-y-auto flex-1 space-y-4">
          <p className="text-sm text-gray-500 truncate">{product.name}</p>

          <div className="flex gap-2">
            {SCOPES.map((s) => (
              <button
                key={s.value}
                type="button"
                onClick={() => setScope(s.value)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                  scope === s.value
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-600 border-gray-300 hover:border-gray-400"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          {scope === "PUBLIC" && <p className="text-sm text-gray-500">承認済みの全取引先の商品一覧に表示されます。</p>}
          {scope === "PRIVATE" && <p className="text-sm text-gray-500">どの取引先にも表示されません。</p>}

          {scope === "LIMITED" &&
            (loading ? (
              <p className="text-sm text-gray-400">読み込み中...</p>
            ) : (
              <div className="border border-gray-300 rounded-lg overflow-hidden">
                <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border-b border-gray-200">
                  <input
                    type="checkbox"
                    id="pv-select-all"
                    checked={selectedIds.size === customers.length && customers.length > 0}
                    onChange={toggleAll}
                    className="rounded"
                  />
                  <label htmlFor="pv-select-all" className="text-xs text-gray-600 cursor-pointer select-none">
                    全選択（{selectedIds.size}/{customers.length}件選択中）
                  </label>
                </div>
                <div className="max-h-64 overflow-y-auto divide-y divide-gray-100">
                  {customers.length === 0 ? (
                    <p className="text-sm text-gray-400 px-3 py-4">承認済みの取引先がいません</p>
                  ) : (
                    customers.map((c) => (
                      <label key={c.id} className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(c.id)}
                          onChange={() => toggleCustomer(c.id)}
                          className="rounded"
                        />
                        <span className="text-sm text-gray-800 flex-1">
                          {c.name}
                          {c.company ? ` (${c.company})` : ""}
                        </span>
                      </label>
                    ))
                  )}
                </div>
              </div>
            ))}
        </div>

        <div className="px-6 py-4 border-t flex gap-3">
          <button onClick={onClose} className="flex-1 py-2 rounded-lg text-sm text-gray-600 bg-gray-100 hover:bg-gray-200">
            キャンセル
          </button>
          <button
            onClick={handleSave}
            disabled={saving || loading}
            className="flex-1 py-2 rounded-lg text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? "保存中..." : "保存する"}
          </button>
        </div>
      </div>
    </div>
  );
}
