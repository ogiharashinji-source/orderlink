"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, password }),
    });

    if (res.ok) {
      router.push("/requests");
    } else {
      const data = await res.json();
      setError(data.error ?? "ログインに失敗しました");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-800 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white tracking-wide">日本酒発注システム</h1>
          <p className="text-white text-xl font-semibold mt-1">酒蔵ログイン</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-2xl p-8 space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ID</label>
            <input
              type="text"
              value={id}
              onChange={(e) => setId(e.target.value)}
              required
              autoFocus
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">パスワード</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-800 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-slate-700 disabled:opacity-50 transition-colors"
          >
            {loading ? "ログイン中..." : "ログイン"}
          </button>
          <div className="text-center">
            <Link href="/register" className="text-sm text-slate-500 hover:text-slate-700">
              新規アカウント登録はこちら
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
