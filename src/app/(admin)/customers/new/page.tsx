"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

type BulkInviteRow = {
  email: string;
  status: "pending" | "sending" | "done" | "error";
  errorMsg?: string;
};

function QRSection() {
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [inviteUrl, setInviteUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/brewery-invite")
      .then((r) => r.json())
      .then((data) => {
        setQrDataUrl(data.qrDataUrl);
        setInviteUrl(data.inviteUrl);
        setLoading(false);
      });
  }, []);

  const handleDownload = () => {
    const a = document.createElement("a");
    a.href = qrDataUrl;
    a.download = "orderlink-invite-qr.png";
    a.click();
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 max-w-sm text-center space-y-4">
      <p className="text-sm text-gray-500">このQRコードを販売店様へ共有してください。<br />販売店様が登録すると自動的に貴社アカウントへ紐付けられます。</p>
      {loading ? (
        <div className="h-48 flex items-center justify-center text-gray-400 text-sm">生成中...</div>
      ) : (
        <img src={qrDataUrl} alt="招待QRコード" className="mx-auto w-48 h-48" />
      )}
      <div className="flex gap-2 justify-center">
        <button onClick={handleDownload} disabled={loading}
          className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50">
          PNGダウンロード
        </button>
        <button onClick={handleCopy} disabled={loading}
          className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50">
          {copied ? "コピーしました！" : "URLコピー"}
        </button>
      </div>
    </div>
  );
}

export default function InviteCustomerPage() {
  const [mode, setMode] = useState<"single" | "multi" | "qr">("single");
  const [companyName, setCompanyName] = useState("");

  useEffect(() => {
    fetch("/api/admin/nav").then((r) => r.ok ? r.json() : null).then((d) => {
      if (d?.companyName) setCompanyName(d.companyName);
    });
  }, []);

  // single
  const [email, setEmail] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [sending, setSending] = useState(false);
  const [sentEmail, setSentEmail] = useState("");
  const [singleError, setSingleError] = useState("");

  // multi invite
  const [emailText, setEmailText] = useState("");
  const [multiRows, setMultiRows] = useState<BulkInviteRow[]>([]);
  const [multiConfirming, setMultiConfirming] = useState(false);
  const [multiSending, setMultiSending] = useState(false);
  const [multiDone, setMultiDone] = useState(false);

  // --- single ---
  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { setSingleError("メールアドレスを入力してください"); return; }
    setSingleError("");
    setConfirming(true);
  };

  const handleSingleSubmit = async () => {
    setSending(true);
    const res = await fetch("/api/customers/invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setSending(false);
    if (res.ok) {
      setConfirming(false);
      setSentEmail(email);
    } else {
      const data = await res.json();
      setConfirming(false);
      setSingleError(data.error ?? "送信に失敗しました");
    }
  };

  // --- multi invite ---
  const parseEmails = (text: string): string[] => {
    return text
      .split(/[\n,，\s]+/)
      .map((s) => s.trim())
      .filter((s) => s.includes("@"));
  };

  const handleMultiConfirm = () => {
    const emails = parseEmails(emailText);
    if (emails.length === 0) return;
    setMultiRows(emails.map((e) => ({ email: e, status: "pending" })));
    setMultiConfirming(true);
  };

  const handleMultiSend = async () => {
    setMultiSending(true);
    const updated = [...multiRows];
    for (let i = 0; i < updated.length; i++) {
      updated[i] = { ...updated[i], status: "sending" };
      setMultiRows([...updated]);
      const res = await fetch("/api/customers/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: updated[i].email }),
      });
      if (res.ok) {
        updated[i] = { ...updated[i], status: "done" };
      } else {
        const data = await res.json();
        updated[i] = { ...updated[i], status: "error", errorMsg: data.error ?? "送信失敗" };
      }
      setMultiRows([...updated]);
    }
    setMultiSending(false);
    setMultiDone(true);
    setMultiConfirming(false);
  };

  const emailPreview = (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div className="bg-[#1e3a8a] text-white text-center py-4 font-bold text-xl tracking-widest">OrderLink</div>
      <div className="p-6 space-y-4 text-gray-700 bg-white text-sm leading-relaxed">
        <p><strong>{companyName}</strong>様より OrderLink ポータルへご招待されました。</p>
        <p>OrderLinkにご登録いただくことで、商品をオンラインで簡単にご注文いただけるようになります。下記のリンクよりアカウントを作成し、ご利用を開始してください。</p>
        <div className="text-center py-1">
          <span className="text-[#1e3a8a] underline text-sm">アカウントを登録する</span>
        </div>
        <p className="text-xs text-gray-400 border-t pt-3">なお、本メールにお心当たりがない場合は、お手数ですが本メールを削除いただきますようお願いいたします。</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* 単体確認モーダル */}
      {confirming && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
            <div className="p-6 space-y-5">
              <h2 className="text-lg font-bold text-gray-900">送信内容の確認</h2>
              <div className="text-sm space-y-2 bg-gray-50 rounded-lg p-4">
                <div className="flex gap-3">
                  <span className="text-gray-500 w-16 shrink-0">送信先</span>
                  <span className="font-medium text-gray-900">{email}</span>
                </div>
                <div className="flex gap-3">
                  <span className="text-gray-500 w-16 shrink-0">件名</span>
                  <span className="text-gray-700">【OrderLink】ポータル登録のご案内</span>
                </div>
              </div>
              {emailPreview}
              <p className="text-sm font-medium text-gray-700 text-center">こちらの内容で送信します。よろしいですか？</p>
              <div className="flex gap-3">
                <button onClick={handleSingleSubmit} disabled={sending}
                  className="flex-1 py-3 rounded-lg text-sm font-bold text-white disabled:opacity-50"
                  style={{ background: "#1e3a8a" }}>
                  {sending ? "送信中..." : "送信する"}
                </button>
                <button onClick={() => setConfirming(false)} disabled={sending}
                  className="flex-1 py-3 rounded-lg text-sm font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50">
                  戻る
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 一斉招待確認モーダル */}
      {multiConfirming && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
            <div className="p-6 space-y-5">
              <h2 className="text-lg font-bold text-gray-900">送信内容の確認</h2>
              <div className="text-sm bg-gray-50 rounded-lg p-4 space-y-1 max-h-40 overflow-y-auto">
                <p className="text-gray-500 mb-2">送信先（{multiRows.length}件）</p>
                {multiRows.map((r, i) => (
                  <div key={i} className="font-medium text-gray-900">{r.email}</div>
                ))}
              </div>
              <div className="text-sm bg-gray-50 rounded-lg px-4 py-2">
                <div className="flex gap-3">
                  <span className="text-gray-500 w-16 shrink-0">件名</span>
                  <span className="text-gray-700">【OrderLink】ポータル登録のご案内</span>
                </div>
              </div>
              {emailPreview}
              <p className="text-sm font-medium text-gray-700 text-center">こちらの内容で{multiRows.length}件送信します。よろしいですか？</p>
              <div className="flex gap-3">
                <button onClick={handleMultiSend} disabled={multiSending}
                  className="flex-1 py-3 rounded-lg text-sm font-bold text-white disabled:opacity-50"
                  style={{ background: "#1e3a8a" }}>
                  {multiSending ? "送信中..." : "送信する"}
                </button>
                <button onClick={() => setMultiConfirming(false)} disabled={multiSending}
                  className="flex-1 py-3 rounded-lg text-sm font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50">
                  戻る
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/customers" className="hover:text-blue-600">顧客管理</Link>
        <span>›</span>
        <span>顧客招待</span>
      </div>
      <h1 className="text-2xl font-bold text-gray-900">顧客登録</h1>

      <div className="flex gap-2 border-b border-gray-200">
        {(["single", "multi", "qr"] as const).map((m) => (
          <button key={m} onClick={() => setMode(m)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              mode === m ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"
            }`}>
            {m === "single" ? "招待メールを送信" : m === "multi" ? "一斉招待" : "QRコード"}
          </button>
        ))}
      </div>

      {/* single */}
      {mode === "single" && (
        <div className="bg-white rounded-lg shadow p-6 max-w-md">
          {sentEmail ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-green-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                <p className="font-semibold">招待メールを送信しました</p>
              </div>
              <p className="text-sm text-gray-600"><span className="font-medium">{sentEmail}</span> に登録用URLを送信しました。</p>
              <div className="flex gap-3 pt-2">
                <button onClick={() => { setSentEmail(""); setEmail(""); setConfirming(false); }}
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
            <form onSubmit={handleConfirm} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  メールアドレス <span className="text-red-500">*</span>
                </label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@company.com"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              {singleError && <p className="text-sm text-red-500">{singleError}</p>}
              <button type="submit"
                className="w-full py-2.5 rounded-lg text-sm font-bold text-white"
                style={{ background: "#1e3a8a" }}>
                確認する
              </button>
            </form>
          )}
        </div>
      )}

      {/* QR */}
      {mode === "qr" && <QRSection />}

      {/* multi invite */}
      {mode === "multi" && (
        <div className="bg-white rounded-lg shadow p-6 max-w-lg space-y-4">
          {multiDone ? (
            <div className="space-y-4">
              <p className="text-sm font-medium text-gray-700">
                {multiRows.filter((r) => r.status === "done").length}件送信完了
                {multiRows.filter((r) => r.status === "error").length > 0 && `（${multiRows.filter((r) => r.status === "error").length}件エラー）`}
              </p>
              <div className="border border-gray-200 rounded-lg divide-y divide-gray-100">
                {multiRows.map((r, i) => (
                  <div key={i} className="flex items-center justify-between px-3 py-2 text-sm">
                    <span className="text-gray-700">{r.email}</span>
                    {r.status === "done" && <span className="text-green-600 font-medium">完了</span>}
                    {r.status === "error" && <span className="text-red-500 text-xs">{r.errorMsg}</span>}
                  </div>
                ))}
              </div>
              <div className="flex gap-3">
                <button onClick={() => { setMultiDone(false); setEmailText(""); setMultiRows([]); }}
                  className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-50">
                  続けて招待する
                </button>
                <Link href="/customers"
                  className="flex-1 text-center border border-gray-300 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-50">
                  顧客管理に戻る
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  メールアドレス（1行に1件、またはカンマ区切り）
                </label>
                <textarea
                  value={emailText}
                  onChange={(e) => setEmailText(e.target.value)}
                  rows={8}
                  placeholder={"example1@company.com\nexample2@company.com\nexample3@company.com"}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                />
                {emailText && (
                  <p className="text-xs text-gray-500 mt-1">{parseEmails(emailText).length}件のメールアドレスを検出</p>
                )}
              </div>
              <button
                onClick={handleMultiConfirm}
                disabled={parseEmails(emailText).length === 0}
                className="w-full py-2.5 rounded-lg text-sm font-bold text-white disabled:opacity-40"
                style={{ background: "#1e3a8a" }}>
                確認する
              </button>
            </>
          )}
        </div>
      )}

    </div>
  );
}
