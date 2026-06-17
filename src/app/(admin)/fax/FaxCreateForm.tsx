"use client";
import { useEffect, useRef, useState } from "react";

type Customer = { id: number; name: string; company: string | null; faxNumber: string | null };

export default function FaxCreateForm({ onCreated }: { onCreated: () => void }) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [sendMode, setSendMode] = useState<"全体" | "個別">("全体");
  const [customerId, setCustomerId] = useState("");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/customers").then((r) => r.json()).then(setCustomers);
  }, []);

  const readFileAsBase64 = (): Promise<{ fileData: string; fileName: string; fileType: string } | null> => {
    if (!attachmentFile) return Promise.resolve(null);
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = (reader.result as string).split(",")[1];
        resolve({ fileData: base64, fileName: attachmentFile.name, fileType: attachmentFile.type });
      };
      reader.readAsDataURL(attachmentFile);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const fileAttachment = await readFileAsBase64();

    const payload = {
      title: title || null,
      message: message || null,
      productIds: [],
      expiresAt: expiresAt || null,
      ...(fileAttachment ?? {}),
    };

    if (sendMode === "全体") {
      if (customers.length === 0) { alert("顧客が登録されていません"); setSaving(false); return; }
      const results = await Promise.all(
        customers.map((c) =>
          fetch("/api/order-links", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...payload, customerId: c.id }),
          })
        )
      );
      if (results.every((r) => r.ok)) { setSaving(false); onCreated(); }
      else { alert("一部の送信に失敗しました"); setSaving(false); }
    } else {
      if (!customerId) { alert("顧客を選択してください"); setSaving(false); return; }
      const res = await fetch("/api/order-links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, customerId }),
      });
      if (res.ok) { setSaving(false); onCreated(); }
      else { alert("送信に失敗しました"); setSaving(false); }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-2xl">
      <div className="bg-white rounded-lg shadow p-5 space-y-4">
        <h2 className="font-semibold text-gray-800">基本設定</h2>

        {/* 送信先 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">送信先</label>
          <div className="flex gap-2 mb-3">
            {(["全体", "個別"] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setSendMode(mode)}
                className={`px-5 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                  sendMode === mode
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-600 border-gray-300 hover:border-gray-400"
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
          {sendMode === "個別" ? (
            <select
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              className={selectCls}
            >
              <option value="">顧客を選択...</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}{c.company ? ` (${c.company})` : ""}{c.faxNumber ? ` FAX: ${c.faxNumber}` : ""}
                </option>
              ))}
            </select>
          ) : (
            <p className="text-sm text-gray-500">登録済みの全顧客（{customers.length}件）に発注書リンクを作成します</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">発注書タイトル</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="例: 2026年6月 ご注文書"
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">有効期限</label>
            <input
              type="date"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              className={inputCls}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">メッセージ</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={8}
            placeholder="例: いつもお世話になっております。ご注文をQRコードよりお願いいたします。"
            className={inputCls}
          />
        </div>

        {/* データ添付 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">データ添付</label>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              ファイルを選択
            </button>
            {attachmentFile ? (
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <span className="truncate max-w-xs">{attachmentFile.name}</span>
                <button
                  type="button"
                  onClick={() => { setAttachmentFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                  className="text-red-400 hover:text-red-600 text-xs"
                >
                  ✕
                </button>
              </div>
            ) : (
              <span className="text-sm text-gray-400">PDF・画像・Excelなど</span>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.png,.jpg,.jpeg,.xlsx,.xls,.csv"
            className="hidden"
            onChange={(e) => setAttachmentFile(e.target.files?.[0] ?? null)}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={saving}
        className="bg-blue-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
      >
        {saving ? "送信中..." : sendMode === "全体" ? `送信（${customers.length}件）` : "送信"}
      </button>
    </form>
  );
}

const inputCls = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";
const selectCls = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";
