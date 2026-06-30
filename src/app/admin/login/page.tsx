"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/admin/nav").then((r) => {
      if (r.ok) router.replace("/requests");
      else setAuthChecking(false);
    }).catch(() => setAuthChecking(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  if (authChecking) return <div className="min-h-screen bg-[#1e3a5f]" />;

  return (
    <div className="min-h-screen bg-[#1e3a5f] flex flex-col">
      <header className="px-4 sm:px-6 py-4 flex items-center justify-between gap-2">
        <Link href="/" className="flex-shrink-0 leading-tight">
          <div className="flex items-baseline gap-2">
            <span className="text-lg sm:text-xl font-bold tracking-widest text-white">OrderLink</span>
            <span className="hidden sm:inline text-xs text-white/70">オーダーリンク</span>
          </div>
          <p className="sm:hidden text-[10px] text-white/70 tracking-widest text-center">オーダーリンク</p>
        </Link>
        <div className="flex gap-2">
          <Link href="/admin/login"
            className="border border-white text-white font-bold text-xs sm:text-sm px-3 sm:px-5 py-1.5 sm:py-2 rounded-full hover:bg-white hover:text-[#1e3a5f] transition">
            ログイン
          </Link>
          <Link href="/register"
            className="bg-amber-400 text-[#1e3a5f] font-bold text-xs sm:text-sm px-3 sm:px-5 py-1.5 sm:py-2 rounded-full hover:bg-amber-300 transition">
            新規登録
          </Link>
        </div>
      </header>
      <div className="flex-1 flex items-start justify-center px-4 pt-10">
      <div className="w-full max-w-sm">
        <p className="text-white text-center text-xl font-bold mb-6">酒蔵専用ログインページ</p>
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
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1e3a5f] text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-[#2d5a8e] disabled:opacity-50 transition-colors"
          >
            {loading ? "ログイン中..." : "ログイン"}
          </button>
          <div className="text-center">
            <Link href="/register" className="block text-sm text-slate-500 hover:text-slate-700">
              新規アカウント登録はこちら
            </Link>
          </div>
        </form>
      </div>
      </div>
    </div>
  );
}
