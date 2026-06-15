"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

type LinkItem = {
  id: number;
  token: string;
  title: string | null;
  createdAt: string;
  expiresAt: string | null;
  submittedAt: string | null;
  customer: { name: string; company: string | null };
  request: { id: number; requestNumber: string; status: string } | null;
};

export default function FaxLinkList() {
  const [links, setLinks] = useState<LinkItem[]>([]);

  useEffect(() => {
    fetch("/api/order-links").then((r) => r.json()).then(setLinks);
  }, []);

  const getStatus = (link: LinkItem) => {
    if (link.request?.status === "CONFIRMED") return { label: "受注確定済", color: "bg-green-100 text-green-800" };
    if (link.submittedAt) return { label: "リクエスト受信済", color: "bg-blue-100 text-blue-800" };
    if (link.expiresAt && new Date(link.expiresAt) < new Date()) return { label: "期限切れ", color: "bg-gray-100 text-gray-500" };
    return { label: "未送信", color: "bg-yellow-100 text-yellow-800" };
  };

  return (
    <div className="space-y-3">
      {links.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-8 text-center text-gray-400">
          発行済みの発注書がありません
        </div>
      ) : (
        links.map((link) => {
          const status = getStatus(link);
          return (
            <div key={link.id} className="bg-white rounded-xl shadow p-4 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-gray-900">{link.customer.name}</span>
                  {link.customer.company && <span className="text-sm text-gray-400">({link.customer.company})</span>}
                </div>
                {link.title && <p className="text-sm text-gray-600 mb-1">{link.title}</p>}
                <div className="flex items-center gap-3 text-xs text-gray-400">
                  <span>作成: {new Date(link.createdAt).toLocaleDateString("ja-JP")}</span>
                  {link.expiresAt && <span>期限: {new Date(link.expiresAt).toLocaleDateString("ja-JP")}</span>}
                  {link.submittedAt && <span>受信: {new Date(link.submittedAt).toLocaleString("ja-JP", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>}
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                {link.request && (
                  <Link
                    href={`/requests/${link.request.id}`}
                    className="text-sm text-blue-600 hover:underline font-medium"
                  >
                    リクエストを確認
                  </Link>
                )}
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${status.color}`}>
                  {status.label}
                </span>
                <Link
                  href={`/fax/${link.token}`}
                  target="_blank"
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg text-xs font-medium"
                >
                  印刷プレビュー
                </Link>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
