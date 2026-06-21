"use client";
import { useEffect, useState } from "react";

type LinkItem = {
  id: number;
  token: string;
  title: string | null;
  message: string | null;
  createdAt: string;
  expiresAt: string | null;
  attachmentPath: string | null;
  customer: { name: string; company: string | null; email: string | null } | null;
};

export default function FaxLinkList() {
  const [links, setLinks] = useState<LinkItem[]>([]);

  useEffect(() => {
    fetch("/api/order-links").then((r) => r.json()).then(setLinks);
  }, []);

  if (links.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow p-8 text-center text-gray-400">
        送信済みのメールはありません
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200 text-left text-xs text-gray-500 font-medium">
            <th className="px-4 py-3">送信日時</th>
            <th className="px-4 py-3">宛先</th>
            <th className="px-4 py-3">タイトル・メッセージ</th>
            <th className="px-4 py-3">有効期限</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {links.map((link) => (
            <tr key={link.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                {new Date(link.createdAt).toLocaleString("ja-JP", {
                  month: "numeric", day: "numeric",
                  hour: "2-digit", minute: "2-digit",
                })}
              </td>
              <td className="px-4 py-3">
                <div className="font-medium text-gray-900">{link.customer?.name ?? "—"}</div>
                {link.customer?.email && (
                  <div className="text-xs text-gray-400">{link.customer.email}</div>
                )}
              </td>
              <td className="px-4 py-3 max-w-xs">
                {link.title && (
                  <div className="font-medium text-gray-800 mb-0.5">{link.title}</div>
                )}
                {link.message && (
                  <div className="text-gray-500 text-xs line-clamp-2">{link.message}</div>
                )}
                {link.attachmentPath && (
                  <span className="inline-flex items-center gap-1 mt-1 text-xs text-gray-500">
                    📎 {link.attachmentPath}
                  </span>
                )}
                {!link.title && !link.message && !link.attachmentPath && (
                  <span className="text-gray-300">—</span>
                )}
              </td>
              <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                {link.expiresAt
                  ? new Date(link.expiresAt).toLocaleDateString("ja-JP", { month: "numeric", day: "numeric" })
                  : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
