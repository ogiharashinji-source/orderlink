"use client";
import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import ManualModal from "@/components/ManualModal";

function CustomerLoginForm() {
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const inviteToken = searchParams.get("token") ?? "";
  const breweryInviteToken = searchParams.get("invite") ?? "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000);
      const res = await fetch("/api/customer/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ loginId, password }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (res.ok) {
        if (inviteToken || breweryInviteToken) {
          const assocRes = await fetch("/api/portal/associate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ inviteToken: inviteToken || undefined, breweryInviteToken: breweryInviteToken || undefined }),
          });
          if (assocRes.ok) {
            const assocData = await assocRes.json();
            if (assocData.companyId) {
              window.location.href = `/portal/order?companyId=${assocData.companyId}`;
              return;
            }
          }
        }
        window.location.href = "/portal/order";
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "ログインに失敗しました");
        setLoading(false);
      }
    } catch {
      setError("接続エラーが発生しました。しばらく経ってから再試行してください。");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-800 flex items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-4">
        <div className="text-center mb-2">
          <h1 className="text-2xl font-bold text-white tracking-wide">OrderLink</h1>
          <p className="text-white text-xl font-semibold mt-1">販売店ログイン</p>
        </div>
        <div className="bg-white rounded-2xl shadow p-8 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ログインID</label>
              <input
                type="text"
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">パスワード</label>
              <input
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
              {loading ? "ログイン中..." : "ログイン"}
            </button>
          </form>
          <div className="text-center pt-2">
            <ManualModal type="portal" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CustomerLoginPage() {
  return (
    <Suspense>
      <CustomerLoginForm />
    </Suspense>
  );
}
