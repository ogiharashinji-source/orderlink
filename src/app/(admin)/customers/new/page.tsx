"use client";
import { useState } from "react";
import Link from "next/link";

export default function InviteCustomerPage() {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [inviteUrl, setInviteUrl] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setError("");
    const res = await fetch("/api/customers/invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email || undefined }),
    });
    setSending(false);
    if (res.ok) {
      const data = await res.json();
      setInviteUrl(data.inviteUrl ?? "");
    } else {
      const data = await res.json();
      setError(data.error ?? "生成に失敗しました");
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteUrl);
    alert("コピーしました");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/customers" className="hover:text-blue-600">顧客管理</Link>
        <span>›</span>
        <span>顧客招待</span>
      </div>
      <h1 className="text-2xl font-bold text-gray-900">顧客招待</h1>

      <div className="bg-white rounded-lg shadow p-6 max-w-md">
        {inviteUrl ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-green-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
              <p className="font-semibold">招待URLを作成しました</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">登録用URL（24時間有効）</p>
              <div className="flex items-center gap-2">
                <input
                  readOnly
                  value={inviteUrl}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-700 bg-gray-50 focus:outline-none"
                />
                <button
                  onClick={handleCopy}
                  className="px-3 py-2 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50 whitespace-nowrap"
                >
                  コピー
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-1">このURLを顧客に共有してください</p>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => { setInviteUrl(""); setEmail(""); }}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
                続けて招待する
              </button>
              <Link href="/customers"
                className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50">
                顧客管理に戻る
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                メールアドレス <span className="text-gray-400 text-xs font-normal">（任意・入力するとメールも送信）</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@company.com"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <button type="submit" disabled={sending}
              className="w-full py-2.5 rounded-lg text-sm font-bold text-white disabled:opacity-50"
              style={{ background: "#1e3a8a" }}>
              {sending ? "生成中..." : "招待URLを生成する"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
