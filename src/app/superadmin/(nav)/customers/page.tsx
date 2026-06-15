"use client";
import { useEffect, useState } from "react";

type Customer = {
  id: number;
  name: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  loginId: string | null;
  password: string | null;
  companyCount: number;
  createdAt: string;
};

export default function SuperAdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    fetch("/api/superadmin/customers")
      .then((r) => r.json())
      .then((data) => { setCustomers(data); setLoading(false); })
      .catch(() => { setError("読み込みに失敗しました"); setLoading(false); });
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`「${name}」を削除しますか？\nこの操作は取り消せません。`)) return;
    const res = await fetch(`/api/superadmin/customers/${id}`, { method: "DELETE" });
    if (res.ok) load();
    else alert("削除に失敗しました");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">ポータル会員一覧</h1>
        <span className="text-sm text-gray-500">{customers.length}件</span>
      </div>
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        {loading ? (
          <p className="text-center py-8 text-gray-400">読み込み中...</p>
        ) : error ? (
          <p className="text-center py-8 text-red-400">{error}</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
              <tr>
                <th className="px-4 py-3 text-left">登録日</th>
                <th className="px-4 py-3 text-left">会社名</th>
                <th className="px-4 py-3 text-left">住所</th>
                <th className="px-4 py-3 text-left">電話番号</th>
                <th className="px-4 py-3 text-left">メールアドレス</th>
                <th className="px-4 py-3 text-left">ID</th>
                <th className="px-4 py-3 text-left">PASS</th>
                <th className="px-4 py-3 text-center">登録酒蔵数</th>
                <th className="px-4 py-3 text-right">操作</th>
              </tr>
            </thead>
            <tbody>
              {customers.length === 0 ? (
                <tr><td colSpan={9} className="text-center py-8 text-gray-400">データがありません</td></tr>
              ) : (
                customers.map((c) => (
                  <tr key={c.id} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                      {new Date(c.createdAt).toLocaleDateString("ja-JP")}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">{c.name}</td>
                    <td className="px-4 py-3 text-gray-600 text-xs">{c.address || "—"}</td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{c.phone || "—"}</td>
                    <td className="px-4 py-3 text-gray-600">{c.email || "—"}</td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{c.loginId || "—"}</td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{c.password || "—"}</td>
                    <td className="px-4 py-3 text-center text-gray-700 font-medium">{c.companyCount}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleDelete(c.id, c.name)}
                        className="text-red-500 hover:underline text-xs whitespace-nowrap"
                      >
                        削除
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
