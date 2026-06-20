"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const inputCls = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

export default function CompanyNewPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    companyName: "", address: "", phone: "", faxNumber: "", email: "", loginId: "", password: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    const res = await fetch("/api/superadmin/companies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (res.ok) {
      router.push("/superadmin/companies");
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "登録に失敗しました");
    }
  };

  return (
    <div className="space-y-4 max-w-lg">
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/superadmin/companies" className="hover:text-blue-600">管理者一覧</Link>
        <span>›</span>
        <span>新規登録</span>
      </div>
      <h1 className="text-2xl font-bold text-gray-900">管理者新規登録</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">会社名</label>
          <input value={form.companyName} onChange={set("companyName")} className={inputCls} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">住所</label>
          <input value={form.address} onChange={set("address")} className={inputCls} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">電話番号</label>
          <input value={form.phone} onChange={set("phone")} className={inputCls} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">FAX番号</label>
          <input value={form.faxNumber} onChange={set("faxNumber")} className={inputCls} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">メールアドレス</label>
          <input type="email" value={form.email} onChange={set("email")} className={inputCls} />
        </div>
        <div className="border-t pt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ログインID <span className="text-red-500">*</span></label>
            <input required value={form.loginId} onChange={set("loginId")} className={inputCls} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">パスワード <span className="text-red-500">*</span></label>
            <input required value={form.password} onChange={set("password")} className={inputCls} />
          </div>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={saving}
            className="px-6 py-2 rounded-lg text-sm font-bold text-white disabled:opacity-50"
            style={{ background: "#1e3a8a" }}>
            {saving ? "登録中..." : "登録する"}
          </button>
          <Link href="/superadmin/companies"
            className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-300 text-gray-700 hover:bg-gray-50">
            キャンセル
          </Link>
        </div>
      </form>
    </div>
  );
}
