"use client";
import { useEffect, useState } from "react";

type Customer = {
  id: number;
  name: string;
  address: string | null;
  phone: string | null;
  faxNumber: string | null;
  email: string | null;
  loginId: string | null;
  password: string | null;
  companyCount: number;
  createdAt: string;
};

const empty = { name: "", email: "", phone: "", faxNumber: "", address: "", loginId: "", password: "" };

export default function SuperAdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const load = () => {
    setLoading(true);
    fetch("/api/superadmin/customers")
      .then((r) => r.json())
      .then((data) => { setCustomers(data); setLoading(false); })
      .catch(() => { setError("読み込みに失敗しました"); setLoading(false); });
  };

  useEffect(() => { load(); }, []);

  const openNew = () => {
    setEditingId(null);
    setForm(empty);
    setFormError("");
    setShowForm(true);
  };

  const openEdit = (c: Customer) => {
    setEditingId(c.id);
    setForm({
      name: c.name,
      email: c.email ?? "",
      phone: c.phone ?? "",
      faxNumber: c.faxNumber ?? "",
      address: c.address ?? "",
      loginId: c.loginId ?? "",
      password: c.password ?? "",
    });
    setFormError("");
    setShowForm(true);
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`「${name}」を削除しますか？\nこの操作は取り消せません。`)) return;
    const res = await fetch(`/api/superadmin/customers/${id}`, { method: "DELETE" });
    if (res.ok) load();
    else alert("削除に失敗しました");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { setFormError("会社名は必須です"); return; }
    if (!form.address.trim()) { setFormError("住所は必須です"); return; }
    if (!form.phone.trim()) { setFormError("電話番号は必須です"); return; }
    if (!form.email.trim()) { setFormError("メールアドレスは必須です"); return; }
    setSaving(true);
    setFormError("");
    const url = editingId ? `/api/superadmin/customers/${editingId}` : "/api/superadmin/customers";
    const method = editingId ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (res.ok) {
      setShowForm(false);
      setForm(empty);
      setEditingId(null);
      load();
    } else {
      setFormError(data.error ?? (editingId ? "更新に失敗しました" : "登録に失敗しました"));
    }
    setSaving(false);
  };

  const closeForm = () => {
    setShowForm(false);
    setForm(empty);
    setEditingId(null);
    setFormError("");
  };

  const inputCls = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

  if (showForm) {
    return (
      <div className="space-y-4 max-w-lg">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <button onClick={closeForm} className="hover:text-blue-600">ポータル会員一覧</button>
          <span>›</span>
          <span>{editingId ? "編集" : "新規追加"}</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">
          {editingId ? "ポータル会員編集" : "新規ポータル会員追加"}
        </h1>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-6 space-y-4">
          {formError && (
            <p className="text-sm text-red-500">{formError}</p>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">会社名 <span className="text-red-500">*</span></label>
            <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className={inputCls} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">住所 <span className="text-red-500">*</span></label>
            <input required value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} className={inputCls} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">電話番号 <span className="text-red-500">*</span></label>
            <input required value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} className={inputCls} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">FAX番号</label>
            <input value={form.faxNumber} onChange={(e) => setForm((f) => ({ ...f, faxNumber: e.target.value }))} className={inputCls} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">メールアドレス <span className="text-red-500">*</span></label>
            <input required type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} className={inputCls} />
          </div>
          <div className="border-t pt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ログインID <span className="text-red-500">*</span></label>
              <input value={form.loginId} onChange={(e) => setForm((f) => ({ ...f, loginId: e.target.value }))} className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">パスワード <span className="text-red-500">*</span></label>
              <input value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} className={inputCls} />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving}
              className="px-6 py-2 rounded-lg text-sm font-bold text-white disabled:opacity-50"
              style={{ background: "#1e3a8a" }}>
              {saving ? "保存中..." : "保存する"}
            </button>
            <button type="button" onClick={closeForm}
              className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-300 text-gray-700 hover:bg-gray-50">
              キャンセル
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">ポータル会員一覧</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">{customers.length}件</span>
          <button
            onClick={openNew}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
          >
            + 新規会員追加
          </button>
        </div>
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
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-4">
                        <button onClick={() => openEdit(c)} className="text-blue-600 hover:underline text-xs">編集</button>
                        <button onClick={() => handleDelete(c.id, c.name)} className="text-red-500 hover:underline text-xs">削除</button>
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
