"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!token) router.push("/portal/login");
  }, [token, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) { setError("パスワードが一致しません"); return; }
    if (password.length < 6) { setError("パスワードは6文字以上にしてください"); return; }
    setLoading(true);
    const res = await fetch("/api/customer/password-reset", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    if (res.ok) {
      setDone(true);
    } else {
      const data = await res.json();
      setError(data.error ?? "エラーが発生しました");
      setLoading(false);
    }
  };

  if (done) return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow p-8 w-full max-w-sm text-center space-y-4">
        <p className="text-2xl">✅</p>
        <p className="font-bold text-gray-900">パスワードを設定しました</p>
        <button onClick={() => router.push("/portal/login")} className="w-full py-2.5 rounded-lg text-sm font-bold text-white" style={{ background: "#1e3a8a" }}>
          ログインへ
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow p-8 w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-xl font-bold text-gray-900">パスワード設定</h1>
          <p className="text-sm text-gray-500 mt-1">新しいパスワードを入力してください</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">新しいパスワード</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">パスワード確認</label>
            <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button type="submit" disabled={loading} className="w-full py-2.5 rounded-lg text-sm font-bold text-white disabled:opacity-50" style={{ background: "#1e3a8a" }}>
            {loading ? "設定中..." : "パスワードを設定する"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return <Suspense><ResetPasswordForm /></Suspense>;
}
