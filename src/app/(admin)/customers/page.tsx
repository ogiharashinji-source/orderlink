"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";


type Customer = {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  faxNumber: string | null;
  company: string | null;
  address: string | null;
  referralCode: string | null;
  loginId: string | null;
  inviteToken: string | null;
  approved: boolean;
  _count: { orders: number };
};

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const load = useCallback(() => {
    fetch(`/api/customers${query ? `?q=${encodeURIComponent(query)}` : ""}`)
      .then((r) => r.json())
      .then(setCustomers);
  }, [query]);

  useEffect(() => { load(); }, [load]);

  const handleApprove = async (id: number) => {
    if (!confirm("承認しますか？")) return;
    await fetch(`/api/customers/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ approved: true }),
    });
    load();
  };

  const handleDelete = async (id: number) => {
    if (!confirm("削除しますか？")) return;
    await fetch(`/api/customers/${id}`, { method: "DELETE" });
    load();
  };


  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 shrink-0">顧客管理</h1>
        <div className="flex items-center gap-2 flex-1">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && setQuery(search)}
            placeholder="顧客名・メール・会社名で検索..."
            style={{ width: "300px" }}
            className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={() => setQuery(search)}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700"
          >
            検索
          </button>
          {query && (
            <button
              onClick={() => { setSearch(""); setQuery(""); }}
              className="text-sm text-gray-500 hover:text-gray-700 px-2"
            >
              クリア
            </button>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">

          <Link href="/customers/new" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
            + 新規顧客
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full text-sm whitespace-nowrap">
          <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
            <tr>
              <th className="px-4 py-3 text-left">会社名</th>
              <th className="px-4 py-3 text-left">住所</th>
              <th className="px-4 py-3 text-left">電話番号</th>
              <th className="px-4 py-3 text-left">FAX番号</th>
              <th className="px-4 py-3 text-left">メール</th>
              <th className="px-4 py-3 text-center">ステータス</th>
              <th className="px-4 py-3 text-right">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {customers.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-8 text-gray-400">顧客データがありません</td></tr>
            ) : (
              customers.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{c.name}</td>
                  <td className="px-4 py-3 text-gray-600">{c.address ?? "—"}</td>
                  <td className="px-4 py-3 text-gray-600">{c.phone ?? "—"}</td>
                  <td className="px-4 py-3 text-gray-600">{c.faxNumber ?? "—"}</td>
                  <td className="px-4 py-3 text-gray-600">{c.email ?? "—"}</td>
                  <td className="px-4 py-3 text-center">
                    {c.approved
                      ? <span className="text-xs text-gray-400">登録済</span>
                      : <button onClick={() => handleApprove(c.id)} className="text-xs font-bold px-3 py-1 rounded-full bg-blue-600 text-white hover:bg-blue-700">承認</button>}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleDelete(c.id)}
                      className="text-red-500 hover:underline text-xs"
                    >削除</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
