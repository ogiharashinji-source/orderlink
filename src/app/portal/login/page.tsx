"use client";
import { useState, Suspense, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";

function CustomerLoginForm() {
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    fetch("/api/customer/me").then((r) => {
      if (r.ok) router.push("/portal/order");
      else setAuthChecking(false);
    }).catch(() => setAuthChecking(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
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
            setDone(true);
            return;
          }
        }
        setRedirecting(true);
        router.push("/portal/order");
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

  const [redirecting, setRedirecting] = useState(false);
  const [copied, setCopied] = useState(false);
  const PORTAL_URL = "https://www.orderlink.jp/portal/login";
  const handleCopy = () => {
    navigator.clipboard.writeText(PORTAL_URL).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (authChecking || loading || redirecting) return <div className="min-h-screen bg-[#1e3a5f]" />;

  if (done) return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden flex items-center justify-center p-4">
      <div className="w-full max-w-lg mx-auto">
        <div className="bg-white rounded-2xl shadow p-8 text-center space-y-5">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900">登録が完了しました</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            パソコンから下記URLにアクセスのうえ、ご利用ください。
          </p>
          <div className="bg-gray-50 rounded-xl px-4 py-3 flex items-center gap-3">
            <a href={PORTAL_URL} className="text-sm font-medium text-blue-700 break-all underline flex-1 text-left">{PORTAL_URL}</a>
            <button onClick={handleCopy} className="flex-shrink-0 text-xs font-bold px-3 py-1.5 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 transition">
              {copied ? "コピー済" : "コピー"}
            </button>
          </div>
          <p className="text-xs text-gray-400">承認完了後にご案内が届く場合があります。しばらくお待ちください。</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#1e3a5f] flex items-start justify-center pt-20 p-6">
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
            <a href="/portal/forgot-password" className="text-xs text-gray-400 hover:text-gray-600 hover:underline">パスワードをお忘れの方</a>
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
