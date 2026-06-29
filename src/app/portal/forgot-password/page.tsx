"use client";
import { useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/portal/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setLoading(false);
    if (res.ok) {
      setSent(true);
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "エラーが発生しました");
    }
  };

  return (
    <div className="min-h-screen bg-[#1e3a5f] flex items-start justify-center pt-20 p-6">
      <div className="w-full max-w-sm space-y-4">
        <div className="text-center mb-2">
          <h1 className="text-2xl font-bold text-white tracking-wide">OrderLink</h1>
          <p className="text-white text-xl font-semibold mt-1">パスワードの再設定</p>
        </div>
        <div className="bg-white rounded-2xl shadow p-8 space-y-6">
          {sent ? (
            <div className="text-center space-y-3">
              <p className="text-sm text-gray-700 leading-relaxed">
                ご登録のメールアドレスに再設定用のURLをお送りしました。<br />メールをご確認ください。
              </p>
              <a href="/portal/login" className="text-xs text-blue-600 hover:underline">ログインページへ戻る</a>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-sm text-gray-600">ご登録のメールアドレスを入力してください。パスワード再設定用のURLをお送りします。</p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">メールアドレス</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-lg text-sm font-bold text-white disabled:opacity-50"
                style={{ background: "#1e3a8a" }}
              >
                {loading ? "送信中..." : "再設定メールを送信"}
              </button>
              <div className="text-center">
                <a href="/portal/login" className="text-xs text-gray-400 hover:text-gray-600 hover:underline">ログインページへ戻る</a>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
