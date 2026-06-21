"use client";
import { useEffect, useRef, useState } from "react";

type LinkItem = {
  id: number;
  token: string;
  title: string | null;
  message: string | null;
  createdAt: string;
  attachmentPath: string | null;
  batchId: string | null;
  sendMode: string | null;
  customer: { name: string; company: string | null; email: string | null } | null;
};

type Batch = {
  batchId: string;
  sendMode: string | null;
  createdAt: string;
  title: string | null;
  message: string | null;
  attachmentPath: string | null;
  recipients: { name: string; email: string | null }[];
};

export default function FaxLinkList() {
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [openBatch, setOpenBatch] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const allCheckRef = useRef<HTMLInputElement>(null);

  const load = () =>
    fetch("/api/order-links")
      .then((r) => r.json())
      .then((data) => {
        setLinks(data);
        setSelected(new Set());
      });

  useEffect(() => { load(); }, []);

  // batchId でグループ化（null の場合は id を仮キーに）
  const batchMap = new Map<string, Batch>();
  for (const link of links) {
    const key = link.batchId ?? `solo-${link.id}`;
    if (!batchMap.has(key)) {
      batchMap.set(key, {
        batchId: key,
        sendMode: link.sendMode,
        createdAt: link.createdAt,
        title: link.title,
        message: link.message,
        attachmentPath: link.attachmentPath,
        recipients: [],
      });
    }
    if (link.customer) {
      batchMap.get(key)!.recipients.push({
        name: link.customer.name,
        email: link.customer.email,
      });
    }
  }

  const batches = Array.from(batchMap.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  // 全選択チェックのindeterminate管理
  useEffect(() => {
    if (!allCheckRef.current) return;
    allCheckRef.current.indeterminate =
      selected.size > 0 && selected.size < batches.length;
  }, [selected, batches.length]);

  const toggleAll = () => {
    if (selected.size === batches.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(batches.map((b) => b.batchId)));
    }
  };

  const toggleOne = (batchId: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(batchId) ? next.delete(batchId) : next.add(batchId);
      return next;
    });
  };

  const deleteOne = async (batchId: string) => {
    const isSolo = batchId.startsWith("solo-");
    const body = isSolo
      ? { id: Number(batchId.replace("solo-", "")) }
      : { batchId };
    await fetch("/api/order-links", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  };

  const handleDelete = async (batchId: string) => {
    if (!confirm("この送信履歴を削除しますか？")) return;
    setDeleting(batchId);
    await deleteOne(batchId);
    setDeleting(null);
    load();
  };

  const handleBulkDelete = async () => {
    if (selected.size === 0) return;
    if (!confirm(`選択した${selected.size}件の送信履歴を削除しますか？`)) return;
    setBulkDeleting(true);
    await Promise.all([...selected].map(deleteOne));
    setBulkDeleting(false);
    load();
  };

  if (links.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow p-8 text-center text-gray-400">
        送信済みのメールはありません
      </div>
    );
  }

  return (
    <>
      {/* 一括削除ボタン */}
      <div className="flex justify-end mb-2">
        <button
          onClick={handleBulkDelete}
          disabled={selected.size === 0 || bulkDeleting}
          className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-red-500 hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {bulkDeleting
            ? "削除中..."
            : selected.size > 0
            ? `${selected.size}件を削除`
            : "一括削除"}
        </button>
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-left text-xs text-gray-500 font-medium">
              <th className="px-3 py-3 text-center w-10">
                <input
                  ref={allCheckRef}
                  type="checkbox"
                  checked={batches.length > 0 && selected.size === batches.length}
                  onChange={toggleAll}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
              </th>
              <th className="px-4 py-3">送信日時</th>
              <th className="px-4 py-3">宛先</th>
              <th className="px-4 py-3">タイトル・メッセージ</th>
              <th className="px-4 py-3">添付ファイル</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {batches.map((batch) => (
              <tr
                key={batch.batchId}
                className={`hover:bg-gray-50 ${selected.has(batch.batchId) ? "bg-blue-50" : ""}`}
              >
                <td className="px-3 py-3 text-center">
                  <input
                    type="checkbox"
                    checked={selected.has(batch.batchId)}
                    onChange={() => toggleOne(batch.batchId)}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                </td>
                <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                  {new Date(batch.createdAt).toLocaleString("ja-JP", {
                    month: "numeric",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() =>
                      setOpenBatch(openBatch === batch.batchId ? null : batch.batchId)
                    }
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-colors hover:bg-gray-100 border-gray-300 text-gray-700"
                  >
                    {batch.sendMode === "全体"
                      ? "全体"
                      : batch.sendMode === "個別"
                      ? "個別"
                      : "—"}
                    <span className="text-gray-400">({batch.recipients.length}件)</span>
                    <span className="text-gray-400 text-[10px]">▼</span>
                  </button>
                </td>
                <td className="px-4 py-3 max-w-xs">
                  {batch.title && (
                    <div className="font-medium text-gray-800 mb-0.5">{batch.title}</div>
                  )}
                  {batch.message && (
                    <div className="text-gray-500 text-xs line-clamp-2">{batch.message}</div>
                  )}
                  {!batch.title && !batch.message && (
                    <span className="text-gray-300">—</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {batch.attachmentPath ? (
                    batch.attachmentPath.startsWith("http") ? (
                      <a
                        href={batch.attachmentPath}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 bg-blue-50 border border-blue-200 text-blue-700 text-xs px-2 py-1 rounded hover:bg-blue-100 whitespace-nowrap"
                      >
                        📎{" "}
                        {decodeURIComponent(
                          batch.attachmentPath.split("/").pop() ?? "開く"
                        )}
                      </a>
                    ) : (
                      <span className="text-xs text-gray-400">📎 {batch.attachmentPath}</span>
                    )
                  ) : (
                    <span className="text-gray-300">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => handleDelete(batch.batchId)}
                    disabled={deleting === batch.batchId}
                    className="text-xs text-red-400 hover:text-red-600 disabled:opacity-40"
                  >
                    削除
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 宛先ポップアップ */}
      {openBatch &&
        (() => {
          const batch = batchMap.get(openBatch);
          if (!batch) return null;
          return (
            <div
              className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
              onClick={() => setOpenBatch(null)}
            >
              <div
                className="bg-white rounded-xl shadow-2xl w-full max-w-sm"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="px-5 py-4 border-b flex items-center justify-between">
                  <h2 className="font-bold text-gray-900 text-sm">
                    送信先一覧
                    <span className="ml-2 text-gray-400 font-normal">
                      ({batch.recipients.length}件)
                    </span>
                  </h2>
                  <button
                    onClick={() => setOpenBatch(null)}
                    className="text-gray-400 hover:text-gray-600 text-xl"
                  >
                    &times;
                  </button>
                </div>
                <div className="overflow-y-auto max-h-72 divide-y divide-gray-100">
                  {batch.recipients.map((r, i) => (
                    <div key={i} className="px-5 py-2.5">
                      <div className="text-sm font-medium text-gray-900">{r.name}</div>
                      {r.email && (
                        <div className="text-xs text-gray-400">{r.email}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })()}
    </>
  );
}
