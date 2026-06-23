"use client";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

const inputCls = "w-full border border-gray-300 rounded-lg px-3 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-blue-500";

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

  const loginHref = `/portal/login${inviteToken ? `?token=${inviteToken}` : breweryInviteToken ? `?invite=${breweryInviteToken}` : ""}`;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg space-y-3">
        <div className="text-center mb-1">
          <h1 className="text-xl font-bold text-gray-900">OrderLink</h1>
          <p className="text-gray-500 text-sm">販売店アカウント登録</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow p-5 space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">会社名 <span className="text-red-500">*</span></label>
            <input required value={form.name} onChange={set("name")} className={inputCls} placeholder="例: 山田酒店" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">住所 <span className="text-red-500">*</span></label>
            <input required value={form.address} onChange={set("address")} className={inputCls} placeholder="例: 東京都渋谷区..." />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">電話番号 <span className="text-red-500">*</span></label>
            <input required type="tel" value={form.phone} onChange={set("phone")} className={inputCls} placeholder="例: 03-1234-5678" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">FAX番号</label>
            <input type="tel" value={form.faxNumber} onChange={set("faxNumber")} className={inputCls} placeholder="例: 03-1234-5679" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">メールアドレス</label>
            <input type="email" value={form.email} onChange={set("email")} className={inputCls} placeholder="例: info@yamada.co.jp" />
          </div>

          <div className="border-t pt-3 space-y-3">
            <p className="text-xs text-gray-500">ログインに使うIDとパスワードを設定してください</p>
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

          <button type="submit" disabled={saving}
            className="w-full py-3 rounded-xl text-base font-bold text-white disabled:opacity-50 mt-2"
            style={{ background: "#1e3a8a" }}>
            {saving ? "登録中..." : "登録する"}
          </button>

          <Link href={loginHref}
            className="block w-full py-3 text-center rounded-xl text-sm font-medium border border-gray-300 text-gray-700 hover:bg-gray-50">
            すでにアカウントをお持ちの方はこちら
          </Link>
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
