"use client";
import { useEffect, useState } from "react";

type Company = {
  id: number;
  name: string;
  code: string;
  createdAt: string;
  setting: { companyName: string; email: string | null; phone: string | null; address: string | null } | null;
  admins: { id: number; loginId: string; password: string; createdAt: string }[];
  _count: { memberships: number; orders: number };
};

export default function SuperAdminCompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    fetch("/api/superadmin/companies")
      .then((r) => r.json())
      .then((data) => { setCompanies(data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`「${name}」を削除しますか？\nこの操作は取り消せません。`)) return;
    const res = await fetch(`/api/superadmin/companies/${id}`, { method: "DELETE" });
    if (res.ok) {
      load();
    } else {
      alert("削除に失敗しました");
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">管理者一覧</h1>
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        {loading ? (
          <p className="text-center py-8 text-gray-400">読み込み中...</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
              <tr>
                <th className="px-4 py-3 text-left">登録日</th>
                <th className="px-4 py-3 text-left">会社名</th>
                <th className="px-4 py-3 text-left">住所</th>
                <th className="px-4 py-3 text-left">電話番号</th>
                <th className="px-4 py-3 text-left">メールアドレス</th>
                <th className="px-4 py-3 text-center">顧客数</th>
                <th className="px-4 py-3 text-center">受注数</th>
                <th className="px-4 py-3 text-right">操作</th>
              </tr>
            </thead>
            <tbody>
              {companies.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-8 text-gray-400">データがありません</td></tr>
              ) : (
                companies.map((c) => (
                  <tr key={c.id} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                      {new Date(c.createdAt).toLocaleDateString("ja-JP")}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">
                      {c.setting?.companyName || c.name}
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-xs">{c.setting?.address || "—"}</td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{c.setting?.phone || "—"}</td>
                    <td className="px-4 py-3 text-gray-600 text-xs">{c.setting?.email || "—"}</td>
                    <td className="px-4 py-3 text-center text-gray-700">{c._count.memberships}</td>
                    <td className="px-4 py-3 text-center text-gray-700">{c._count.orders}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-4">
                        <a
                          href={`/superadmin/companies/${c.id}`}
                          className="text-blue-600 hover:underline text-xs"
                        >
                          編集
                        </a>
                        <button
                          onClick={() => handleDelete(c.id, c.setting?.companyName || c.name)}
                          className="text-red-500 hover:underline text-xs"
                        >
                          削除
                        </button>
                      </div>
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
