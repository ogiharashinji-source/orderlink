"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

const inputCls = "w-full border border-gray-300 rounded-lg px-3 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-blue-500";

const PORTAL_URL = "https://www.orderlink.jp/portal/login";

const CompletionScreen = () => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(PORTAL_URL).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
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
};

function RegisterForm() {
  const searchParams = useSearchParams();
  const inviteToken = searchParams.get("token") ?? "";
  const breweryInviteToken = searchParams.get("invite") ?? "";

  const [tokenValid, setTokenValid] = useState<boolean | null>(null);

  useEffect(() => {
    if (!inviteToken && !breweryInviteToken) { setTokenValid(false); return; }
    const params = new URLSearchParams();
    if (breweryInviteToken) params.set("invite", breweryInviteToken);
    else params.set("token", inviteToken);
    fetch(`/api/portal/validate-invite?${params}`)
      .then((r) => setTokenValid(r.ok))
      .catch(() => setTokenValid(false));
  }, [inviteToken, breweryInviteToken]);

  const [mode, setMode] = useState<"register" | "login">("register");
  const [done, setDone] = useState(false);

  // 新規登録フォーム
  const [form, setForm] = useState({
    name: "", address: "", phone: "", faxNumber: "", email: "",
    loginId: "", password: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));
  const toHankaku = (str: string) =>
    str.replace(/[Ａ-Ｚａ-ｚ０-９]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xfee0)).replace(/　/g, " ");
  const setHankaku = (key: keyof typeof form) => (e: React.FocusEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: toHankaku(e.target.value) }));

  // 既存アカウントログイン
  const [loginId, setLoginId] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
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
        setDone(true);
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError("");
    try {
      const res = await fetch("/api/customer/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ loginId, password: loginPass }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setLoginError(data.error ?? "ログインに失敗しました");
        return;
      }
      // 招待トークンで酒蔵に紐付け
      const assocRes = await fetch("/api/portal/associate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inviteToken: inviteToken || undefined,
          breweryInviteToken: breweryInviteToken || undefined,
        }),
      });
      if (assocRes.ok) {
        setDone(true);
      } else {
        setLoginError("紐付けに失敗しました。管理者にお問い合わせください。");
      }
    } catch {
      setLoginError("通信エラーが発生しました。再度お試しください。");
    } finally {
      setLoginLoading(false);
    }
  };

  if (done) return <CompletionScreen />;

  if (tokenValid === null) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-gray-400 text-sm">確認中...</p>
    </div>
  );

  if (tokenValid === false) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow p-8 text-center space-y-4 max-w-sm w-full">
        <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto">
          <svg className="w-7 h-7 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h2 className="text-lg font-bold text-gray-900">この招待リンクは無効です</h2>
        <p className="text-sm text-gray-500">リンクの有効期限が切れているか、無効なURLです。<br />酒蔵担当者にお問い合わせください。</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      <div className="w-full max-w-lg mx-auto px-4 py-4 space-y-3">
        <div className="text-center mb-1">
          <h1 className="text-xl font-bold text-gray-900">OrderLink</h1>
          <p className="text-gray-500 text-sm">紹介者名アカウント登録</p>
          <button
            onClick={() => { setMode(mode === "register" ? "login" : "register"); setError(""); setLoginError(""); }}
            className="text-sm text-blue-600 hover:underline mt-1"
          >
            {mode === "register" ? "すでにアカウントをお持ちの方はこちら" : "← 新規登録に戻る"}
          </button>
        </div>

        {mode === "login" ? (
          <form onSubmit={handleLogin} className="bg-white rounded-2xl shadow p-5 space-y-4">
            <p className="text-sm font-medium text-gray-700">既存のアカウントでログインして紐付けします</p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ログインID</label>
              <input required value={loginId} onChange={(e) => setLoginId(e.target.value)} className={inputCls} placeholder="例: yamada2025" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">パスワード</label>
              <input required type="text" value={loginPass} onChange={(e) => setLoginPass(e.target.value)} className={inputCls} placeholder="パスワード" />
            </div>
            {loginError && <p className="text-sm text-red-500">{loginError}</p>}
            <button type="submit" disabled={loginLoading}
              className="w-full py-3 rounded-xl text-base font-bold text-white disabled:opacity-50"
              style={{ background: "#1e3a8a" }}>
              {loginLoading ? "ログイン中..." : "ログインして紐付ける"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="bg-white rounded-2xl shadow p-5 space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">会社名 <span className="text-red-500">*</span></label>
              <input required value={form.name} onChange={set("name")} className={inputCls} placeholder="例: 山田酒店" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">住所 <span className="text-red-500">*</span></label>
              <input required value={form.address} onChange={set("address")} className={inputCls} placeholder="例: 東京都渋谷区..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">電話番号 <span className="text-red-500">*</span><span className="text-xs text-gray-400 font-normal ml-1">（ハイフンなし）</span></label>
              <input required type="tel" value={form.phone} onChange={set("phone")} onBlur={setHankaku("phone")} className={inputCls} placeholder="例: 0312345678" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">FAX番号<span className="text-xs text-gray-400 font-normal ml-1">（ハイフンなし）</span></label>
              <input type="tel" value={form.faxNumber} onChange={set("faxNumber")} onBlur={setHankaku("faxNumber")} className={inputCls} placeholder="例: 0312345679" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">メールアドレス <span className="text-red-500">*</span></label>
              <input required type="email" value={form.email} onChange={set("email")} className={inputCls} placeholder="例: info@yamada.co.jp" />
            </div>
            <div className="border-t pt-3 space-y-3">
              <p className="text-xs text-gray-500">ログインに使うIDとパスワードを設定してください</p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ログインID <span className="text-red-500">*</span></label>
                <input required value={form.loginId} onChange={set("loginId")} onBlur={setHankaku("loginId")} placeholder="例: yamada2025" className={inputCls} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">パスワード <span className="text-red-500">*</span></label>
                <input required type="text" value={form.password} onChange={set("password")} onBlur={setHankaku("password")} placeholder="6文字以上" className={inputCls} />
              </div>
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <button type="submit" disabled={saving}
              className="w-full py-3 rounded-xl text-base font-bold text-white disabled:opacity-50 mt-2"
              style={{ background: "#1e3a8a" }}>
              {saving ? "登録中..." : "登録する"}
            </button>
          </form>
        )}
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
