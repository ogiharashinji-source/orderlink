"use client";
import { useState } from "react";
import Link from "next/link";
import CloseButton from "@/components/CloseButton";

const inputCls = "w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] transition";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", company: "", email: "", phone: "", message: "" });
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setError("");
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSending(false);
    if (res.ok) {
      setDone(true);
    } else {
      const d = await res.json().catch(() => ({}));
      setError(d.error ?? "送信に失敗しました");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1 flex items-center justify-center px-6 py-14">
        <div className="w-full max-w-xl">
          {done ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center space-y-4">
              <div className="text-5xl">✅</div>
              <h2 className="text-xl font-black text-[#1e3a5f]">送信が完了しました</h2>
              <p className="text-sm text-gray-500">お問い合わせありがとうございます。<br />内容を確認のうえ、担当者よりご連絡いたします。</p>
              <Link href="/" className="inline-block mt-4 text-sm text-[#1e3a5f] font-bold hover:underline">
                トップページへ戻る
              </Link>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-6">
              <div>
                <h1 className="text-2xl font-black text-[#1e3a5f]">お問い合わせ</h1>
                <p className="text-sm text-gray-500 mt-1">ご不明な点やご相談はお気軽にどうぞ。</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      お名前 <span className="text-red-500">*</span>
                    </label>
                    <input required value={form.name} onChange={set("name")} placeholder="山田 太郎" className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">会社名</label>
                    <input value={form.company} onChange={set("company")} placeholder="〇〇酒造株式会社" className={inputCls} />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      メールアドレス <span className="text-red-500">*</span>
                    </label>
                    <input required type="email" value={form.email} onChange={set("email")} placeholder="example@email.com" className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">電話番号</label>
                    <input value={form.phone} onChange={set("phone")} placeholder="03-0000-0000" className={inputCls} />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    お問い合わせ内容 <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    value={form.message}
                    onChange={set("message")}
                    rows={5}
                    placeholder="ご質問・ご相談内容をご記入ください"
                    className={inputCls + " resize-none"}
                  />
                </div>

                {error && <p className="text-sm text-red-500">{error}</p>}

                <button
                  type="submit"
                  disabled={sending}
                  className="w-full bg-[#1e3a5f] text-white font-black py-3 rounded-xl hover:bg-[#2d5a8e] disabled:opacity-50 transition text-base"
                >
                  {sending ? "送信中..." : "送信する →"}
                </button>

              </form>
              <div className="pt-4 border-t border-gray-100">
                <CloseButton />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
