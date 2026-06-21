"use client";
import { useState } from "react";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setError("");
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, message }),
    });
    if (res.ok) {
      setDone(true);
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "送信に失敗しました");
    }
    setSending(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-lg bg-white rounded-xl shadow p-8">
        <h1 className="text-xl font-bold text-gray-900 mb-6">お問い合わせ</h1>

        {done ? (
          <div className="text-center space-y-4">
            <p className="text-green-600 font-medium">送信が完了しました。</p>
            <p className="text-sm text-gray-500">内容を確認の上、ご連絡いたします。</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">お名前</label>
              <input
                value={name} onChange={(e) => setName(e.target.value)}
                required className={inputCls} placeholder="山三 太郎"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">メールアドレス</label>
              <input
                type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                required className={inputCls} placeholder="example@email.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">お問い合わせ内容</label>
              <textarea
                value={message} onChange={(e) => setMessage(e.target.value)}
                required rows={6} className={inputCls}
              />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <button
              type="submit" disabled={sending}
              className="w-full bg-blue-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {sending ? "送信中..." : "送信する"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

const inputCls = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";
