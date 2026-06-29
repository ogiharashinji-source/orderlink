"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!token) { router.push("/portal/login"); return; }
    fetch(`/api/portal/reset-password?token=${encodeURIComponent(token)}`)
      .then((r) => setTokenValid(r.ok))
      .catch(() => setTokenValid(false));
  }, [token, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) { setError("パスワードが一致しません"); return; }
    if (password.length < 6) { setError("パスワードは6文字以上にしてください"); return; }
    if (!loginId.trim()) { setError("ログインIDを入力してください"); return; }
    setLoading(true);
    setError("");
    const res = await fetch("/api/portal/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, loginId: loginId.trim(), password }),
    });
    if (res.ok) {
      setDone(true);
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "エラーが発生しました");
      setLoading(false);
    }
  };

  if (tokenValid === null) {
    return (
      <div className="min-h-screen bg-[#1e3a5f] flex items-center justify-center">
        <p className="text-white text-sm">確認中...</p>
      </div>
    );
  }

  if (tokenValid === false) {
    return (
      <div className="min-h-screen bg-[#1e3a5f] flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow p-8 w-full max-w-sm text-center space-y-4">
          <p className="font-bold text-red-600">リンクが無効か期限切れです</p>
          <p className="text-sm text-gray-600">再度パスワード再設定を行ってください。</p>
          <a href="/portal/forgot-password" className="block w-full py-2.5 rounded-lg text-sm font-bold text-white text-center" style={{ background: "#1e3a8a" }}>
            再設定メールを送る
          </a>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div className="min-h-screen bg-[#1e3a5f] flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow p-8 w-full max-w-sm text-center space-y-4">
          <p className="text-2xl">✅</p>
          <p className="font-bold text-gray-900">設定が完了しました</p>
          <p className="text-sm text-gray-600">新しいログインIDとパスワードでログインしてください。</p>
          <button onClick={() => router.push("/portal/login")} className="w-full py-2.5 rounded-lg text-sm font-bold text-white" style={{ background: "#1e3a8a" }}>
            ログインへ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1e3a5f] flex items-start justify-center pt-20 p-6">
      <div className="w-full max-w-sm space-y-4">
        <div className="text-center mb-2">
          <h1 className="text-2xl font-bold text-white tracking-wide">OrderLink</h1>
          <p className="text-white text-xl font-semibold mt-1">ログインID・パスワード設定</p>
        </div>
        <div className="bg-white rounded-2xl shadow p-8 space-y-6">
          <p className="text-sm text-gray-600">新しいログインIDとパスワードを設定してください。</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">新しいログインID</label>
              <input
                type="text"
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">新しいパスワード</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">パスワード確認</label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
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
              {loading ? "設定中..." : "設定する"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return <Suspense><ResetPasswordForm /></Suspense>;
}
