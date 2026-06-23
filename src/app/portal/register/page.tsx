"use client";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

const inputCls = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inviteToken = searchParams.get("token") ?? "";
  const breweryInviteToken = searchParams.get("invite") ?? "";

  const [form, setForm] = useState({
    name: "", address: "", phone: "", faxNumber: "", email: "",
    loginId: "", password: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password.length < 6) { setError("パスワードは6文字以上で入力してください"); return; }
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/portal/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          inviteToken: inviteToken || undefined,
          breweryInviteToken: breweryInviteToken || undefined,
        }),
      });
      if (res.ok) {
        alert("登録されました。招待者より承認されるまでしばらくお待ちください。");
        router.push("/portal/order");
      } else {
        let msg = "登録に失敗しました";
        try { const data = await res.json(); msg = data.error ?? msg; } catch { /* ignore */ }
        setError(msg);
      }
    } catch {
      setError("通信エラーが発生しました。再度お試しください。");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl space-y-4">
        <h1 className="text-2xl font-bold text-gray-900">招待　登録ページ</h1>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-6 space-y-4">
          <div className="flex items-end justify-between gap-6">
            <div className="flex-1 max-w-sm">
              <label className="block text-sm font-medium text-gray-700 mb-1">会社名 <span className="text-red-500">*</span></label>
              <input required value={form.name} onChange={set("name")} className={inputCls} />
            </div>
            <Link href={`/portal/login${inviteToken ? `?token=${inviteToken}` : breweryInviteToken ? `?invite=${breweryInviteToken}` : ""}`} className="px-4 py-2 rounded-lg text-sm font-medium border border-blue-600 text-blue-600 hover:bg-blue-50 whitespace-nowrap">
              すでに登録されている方はこちら
            </Link>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">住所 <span className="text-red-500">*</span></label>
            <input required value={form.address} onChange={set("address")} className={inputCls} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">電話番号 <span className="text-red-500">*</span></label>
              <input required value={form.phone} onChange={set("phone")} className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">FAX番号</label>
              <input value={form.faxNumber} onChange={set("faxNumber")} className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">メールアドレス</label>
              <input type="email" value={form.email} onChange={set("email")} className={inputCls} />
            </div>
          </div>

          <div className="border-t pt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ログインID <span className="text-red-500">*</span></label>
              <input required value={form.loginId} onChange={set("loginId")} placeholder="例: yamada2025" className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">パスワード <span className="text-red-500">*</span></label>
              <input required type="text" value={form.password} onChange={set("password")} placeholder="6文字以上" className={inputCls} />
            </div>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex items-center gap-4 pt-2">
            <button type="submit" disabled={saving}
              className="px-6 py-2 rounded-lg text-sm font-bold text-white disabled:opacity-50"
              style={{ background: "#1e3a8a" }}>
              {saving ? "登録中..." : "登録する"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  );
}
