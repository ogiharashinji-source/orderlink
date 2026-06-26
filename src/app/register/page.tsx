"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";


const inputCls = "w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

export default function AdminRegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    companyName: "", address: "", phone: "", faxNumber: "", email: "",
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
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (res.ok) {
      router.push("/requests");
    } else {
      const data = await res.json();
      setError(data.error ?? "登録に失敗しました");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-[#1e3a5f] px-4 sm:px-6 py-4 flex items-center justify-between gap-2">
        <Link href="/" className="flex-shrink-0">
          <span className="text-lg sm:text-xl font-bold tracking-widest text-white">OrderLink</span>
          <span className="hidden sm:inline text-xs ml-2 text-white/70">オーダーリンク</span>
        </Link>
        <div className="flex gap-2 sm:gap-3 flex-shrink-0">
          <Link href="/admin/login"
            className="hidden sm:inline-block border border-white text-white font-bold text-sm px-5 py-2 rounded-full hover:bg-white hover:text-[#1e3a5f] transition">
            ログイン
          </Link>
          <Link href="/register"
            className="bg-amber-400 text-[#1e3a5f] font-bold text-sm px-5 py-2 rounded-full hover:bg-amber-300 transition">
            新規登録
          </Link>
        </div>
      </header>

      <div className="flex-1 flex items-start sm:items-center justify-center p-4 sm:p-6 py-8">
        <div className="w-full max-w-lg space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">酒蔵新規アカウント登録</h1>
            <div className="flex gap-3 text-xs text-blue-500">
              <Link href="/terms" target="_blank" className="hover:underline">利用規約</Link>
              <Link href="/privacy" target="_blank" className="hover:underline">プライバシーポリシー</Link>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-4 sm:p-6 space-y-4">

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">会社名 <span className="text-red-500">*</span></label>
              <input required value={form.companyName} onChange={set("companyName")} placeholder="例: 山三酒造株式会社" className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">住所 <span className="text-red-500">*</span></label>
              <input required value={form.address} onChange={set("address")} placeholder="例: 長野県佐久市..." className={inputCls} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">電話番号 <span className="text-red-500">*</span></label>
                <input required value={form.phone} onChange={set("phone")} placeholder="例: 03-1234-5678" className={inputCls} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">FAX番号</label>
                <input value={form.faxNumber} onChange={set("faxNumber")} placeholder="例: 03-1234-5679" className={inputCls} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">メールアドレス <span className="text-red-500">*</span></label>
              <input required type="email" value={form.email} onChange={set("email")} placeholder="例: info@yamasan.co.jp" className={inputCls} />
            </div>

            <div className="border-t pt-4 space-y-4">
              <p className="text-xs text-gray-500">ログインに使うIDとパスワードを設定してください</p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ID <span className="text-red-500">*</span></label>
                <input required value={form.loginId} onChange={set("loginId")} placeholder="例: yamasan2025" className={inputCls} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">パスワード <span className="text-red-500">*</span></label>
                <input required type="password" value={form.password} onChange={set("password")} placeholder="6文字以上" className={inputCls} />
              </div>
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <button type="submit" disabled={saving}
                className="w-full sm:w-auto px-8 py-3 rounded-lg text-sm font-bold text-white disabled:opacity-50 bg-[#1e3a8a] hover:bg-[#1e40af] transition">
                {saving ? "登録中..." : "登録する"}
              </button>
              <Link href="/admin/login" className="text-sm text-center text-gray-500 hover:text-gray-700">
                ログインはこちら
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
