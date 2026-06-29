"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

type Company = {
  id: number;
  name: string;
  code: string;
  createdAt: string;
  companyNumber: number | null;
  setting: { companyName: string; email: string | null; phone: string | null; address: string | null } | null;
  admins: { id: number; loginId: string; password: string; createdAt: string }[];
  _count: { memberships: number; orders: number };
};

type Member = {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  customerNumber: number | null;
  approved: boolean;
  joinedAt: string;
};

export default function SuperAdminCompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

  const [popup, setPopup] = useState<{ company: Company; members: Member[] } | null>(null);
  const [popupLoading, setPopupLoading] = useState(false);

  const load = () => {
    setLoading(true);
    fetch("/api/superadmin/companies")
      .then((r) => r.json())
      .then((data) => { setCompanies(data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openMembersPopup = async (company: Company) => {
    setPopupLoading(true);
    setPopup({ company, members: [] });
    const res = await fetch(`/api/superadmin/companies/${company.id}/members`);
    const data = await res.json().catch(() => []);
    setPopup({ company, members: data });
    setPopupLoading(false);
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`「${name}」を削除しますか？\nこの操作は取り消せません。`)) return;
    const res = await fetch(`/api/superadmin/companies/${id}`, { method: "DELETE" });
    if (res.ok) load();
    else alert("削除に失敗しました");
  };

  return (
    <div className="space-y-4">
      {/* 顧客一覧ポップアップ */}
      {popup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setPopup(null)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="text-base font-bold text-gray-900">
                {popup.company.setting?.companyName || popup.company.name} の顧客一覧
              </h2>
              <button onClick={() => setPopup(null)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
            </div>
            <div className="overflow-y-auto flex-1">
              {popupLoading ? (
                <p className="text-center py-8 text-gray-400 text-sm">読み込み中...</p>
              ) : popup.members.length === 0 ? (
                <p className="text-center py-8 text-gray-400 text-sm">顧客がいません</p>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-gray-500 text-xs sticky top-0">
                    <tr>
                      <th className="px-4 py-2 text-left">会員番号</th>
                      <th className="px-4 py-2 text-left">会社名</th>
                      <th className="px-4 py-2 text-left">メール</th>
                      <th className="px-4 py-2 text-center">承認</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {popup.members.map((m) => (
                      <tr key={m.id} className="hover:bg-gray-50">
                        <td className="px-4 py-2 font-mono text-gray-600">
                          {m.customerNumber != null ? "P" + String(m.customerNumber).padStart(3, "0") : "—"}
                        </td>
                        <td className="px-4 py-2 font-medium text-gray-900">{m.name}</td>
                        <td className="px-4 py-2 text-gray-500">{m.email || "—"}</td>
                        <td className="px-4 py-2 text-center">
                          {m.approved
                            ? <span className="text-green-600 font-medium">承認済</span>
                            : <span className="text-yellow-600 font-medium">未承認</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            <div className="px-6 py-3 border-t text-right text-xs text-gray-400">
              {popup.members.length}件
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">管理者一覧</h1>
        <Link href="/superadmin/companies/new"
          className="px-4 py-2 rounded-lg text-sm font-bold text-white"
          style={{ background: "#1e3a8a" }}>
          + 新規会員登録
        </Link>
      </div>
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        {loading ? (
          <p className="text-center py-8 text-gray-400">読み込み中...</p>
        ) : (
          <table className="w-full text-sm whitespace-nowrap">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
              <tr>
                <th className="px-4 py-3 text-center">会員番号</th>
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
                <tr><td colSpan={9} className="text-center py-8 text-gray-400">データがありません</td></tr>
              ) : (
                companies.map((c, idx) => (
                  <tr key={c.id} className={`border-t border-gray-100 ${idx % 2 === 1 ? "bg-gray-50" : "bg-white"}`}>
                    <td className="px-4 py-3 text-center text-sm font-mono text-gray-700 font-medium whitespace-nowrap">
                      {c.companyNumber != null ? "A" + String(c.companyNumber).padStart(3, "0") : "—"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                      {new Date(c.createdAt).toLocaleDateString("ja-JP")}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 whitespace-nowrap">
                      {c.setting?.companyName || c.name}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{c.setting?.address || "—"}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{c.setting?.phone || "—"}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{c.setting?.email || "—"}</td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => openMembersPopup(c)}
                        className="text-blue-600 hover:underline font-medium tabular-nums"
                      >
                        {c._count.memberships}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-center text-gray-700">{c._count.orders}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-4">
                        <Link href={`/superadmin/companies/${c.id}`} className="text-blue-600 hover:underline text-xs">編集</Link>
                        <button onClick={() => handleDelete(c.id, c.setting?.companyName || c.name)} className="text-red-500 hover:underline text-xs">削除</button>
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
