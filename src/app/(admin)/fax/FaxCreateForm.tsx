"use client";
import { useEffect, useRef, useState } from "react";

type Customer = { id: number; name: string; company: string | null; email: string | null };

export default function FaxCreateForm({ onCreated }: { onCreated: () => void }) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [sendMode, setSendMode] = useState<"全体" | "個別">("全体");
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [confirmTargets, setConfirmTargets] = useState<Customer[] | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/customers?approved=1").then((r) => r.json()).then(setCustomers);
  }, []);

  const toggleCustomer = (id: number) =>
    setSelectedIds((prev) => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });
  const toggleAll = () =>
    setSelectedIds(selectedIds.size === customers.length ? new Set() : new Set(customers.map((c) => c.id)));

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

  // 送信ボタン → まず確認モーダル表示（メールアドレスありのみ）
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const base = sendMode === "全体" ? customers : customers.filter((c) => selectedIds.has(c.id));
    const targets = base.filter((c) => c.email);
    if (targets.length === 0) { alert("メールアドレスが登録されている顧客がいません"); return; }
    setConfirmTargets(targets);
  };

  // 確認後に実際に送信
  const executeSend = async () => {
    if (!confirmTargets) return;
    setSaving(true);
    setConfirmTargets(null);

    const fileAttachment = await readFileAsBase64();
    const batchId = crypto.randomUUID();
    const payload = {
      title: title || null,
      message: message || null,
      productIds: [],
      expiresAt: null,
      batchId,
      sendMode,
      ...(fileAttachment ?? {}),
    };

    const results = await Promise.allSettled(
      confirmTargets.map(async (c) => {
        const res = await fetch("/api/order-links", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...payload, customerId: c.id }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(`${c.name}: ${data.error ?? res.status}`);
        }
      })
    );

    const failures = results.filter((r) => r.status === "rejected") as PromiseRejectedResult[];
    if (failures.length > 0) {
      alert("送信に失敗しました:\n" + failures.map((f) => f.reason?.message ?? "不明なエラー").join("\n"));
    } else {
      onCreated();
    }
    setSaving(false);
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-5 max-w-2xl">
        <div className="bg-white rounded-lg shadow p-5 space-y-4">
          <h2 className="font-semibold text-gray-800">基本設定</h2>

          {/* 送信先 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">送信先</label>
            <div className="flex gap-2 mb-3">
              {(["全体", "個別"] as const).map((mode) => (
                <button key={mode} type="button" onClick={() => setSendMode(mode)}
                  className={`px-5 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                    sendMode === mode ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-300 hover:border-gray-400"
                  }`}>
                  {mode}
                </button>
              ))}
            </div>
            {sendMode === "個別" ? (
              <div className="border border-gray-300 rounded-lg overflow-hidden">
                <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border-b border-gray-200">
                  <input type="checkbox" id="select-all"
                    checked={selectedIds.size === customers.length && customers.length > 0}
                    onChange={toggleAll} className="rounded" />
                  <label htmlFor="select-all" className="text-xs text-gray-600 cursor-pointer select-none">
                    全選択（{selectedIds.size}/{customers.length}件選択中）
                  </label>
                </div>
                <div className="max-h-48 overflow-y-auto divide-y divide-gray-100">
                  {customers.map((c) => (
                    <label key={c.id} className={`flex items-center gap-3 px-3 py-2 ${c.email ? "hover:bg-gray-50 cursor-pointer" : "opacity-40 cursor-not-allowed"}`}>
                      <input type="checkbox" checked={selectedIds.has(c.id)} onChange={() => c.email && toggleCustomer(c.id)} disabled={!c.email} className="rounded" />
                      <span className="text-sm text-gray-800 flex-1">{c.name}{c.company ? ` (${c.company})` : ""}</span>
                      {!c.email && <span className="text-xs text-gray-400">メールなし</span>}
                    </label>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500">承認済みの全顧客（{customers.length}件）にメールを送信します</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">発注書タイトル</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)}
              placeholder="例: 2026年6月 ご注文書" className={inputCls} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">メッセージ</label>
            <textarea value={message} onChange={(e) => setMessage(e.target.value)}
              rows={8} placeholder="例: いつもお世話になっております。" className={inputCls} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">データ添付</label>
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                ファイルを選択
              </button>
              {attachmentFile ? (
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <span className="truncate max-w-xs">{attachmentFile.name}</span>
                  <button type="button"
                    onClick={() => { setAttachmentFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                    className="text-red-400 hover:text-red-600 text-xs">✕</button>
                </div>
              ) : (
                <span className="text-sm text-gray-400">PDF・画像・Excelなど</span>
              )}
            </div>
            <input ref={fileInputRef} type="file" accept=".pdf,.png,.jpg,.jpeg,.xlsx,.xls,.csv"
              className="hidden" onChange={(e) => setAttachmentFile(e.target.files?.[0] ?? null)} />
          </div>
        </div>

        <button type="submit" disabled={saving}
          className="bg-blue-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
          {saving ? "送信中..." : sendMode === "全体" ? `送信（${customers.length}件）` : `送信（${selectedIds.size}件）`}
        </button>
      </form>

      {/* 送信先確認モーダル */}
      {confirmTargets && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md flex flex-col max-h-[80vh]">
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <h2 className="font-bold text-gray-900">送信先の確認</h2>
              <button onClick={() => setConfirmTargets(null)} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
            </div>
            <p className="px-6 py-3 text-sm text-gray-600">
              以下 <span className="font-bold text-gray-900">{confirmTargets.length}件</span> にメールを送信します。よろしいですか？
            </p>
            <div className="overflow-y-auto flex-1 px-6 pb-4">
              <div className="border border-gray-200 rounded-lg divide-y divide-gray-100">
                {confirmTargets.map((c) => (
                  <div key={c.id} className="px-3 py-2.5">
                    <div className="font-medium text-sm text-gray-900">{c.name}</div>
                    <div className="text-xs text-gray-400">{c.email}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="px-6 py-4 border-t flex gap-3">
              <button onClick={() => setConfirmTargets(null)}
                className="flex-1 py-2 rounded-lg text-sm text-gray-600 bg-gray-100 hover:bg-gray-200">
                キャンセル
              </button>
              <button onClick={executeSend}
                className="flex-1 py-2 rounded-lg text-sm font-bold text-white bg-blue-600 hover:bg-blue-700">
                送信する
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const inputCls = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";
