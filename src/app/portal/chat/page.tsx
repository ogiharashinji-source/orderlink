"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Room = { companyId: number; companyName: string; lastMessage: string; lastMessageAt: string; unreadCount: number };
type Company = { companyId: number; companyName: string };

export default function PortalChatListPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [approved, setApproved] = useState(false);
  const [newCompanyId, setNewCompanyId] = useState("");
  const router = useRouter();

  useEffect(() => {
    const load = () => {
      fetch("/api/portal/chat/rooms").then((r) => (r.ok ? r.json() : [])).then((d) => { setRooms(d); setLoading(false); });
    };
    load();
    const id = setInterval(load, 5000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    fetch("/api/portal/companies").then((r) => (r.ok ? r.json() : null)).then((d) => {
      if (!d) return;
      setCompanies(d.companies ?? []);
      setApproved(d.approved);
    });
  }, []);

  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-bold text-gray-900">チャット</h1>
        <div className="flex items-center gap-2">
          <select
            value={newCompanyId}
            onChange={(e) => setNewCompanyId(e.target.value)}
            disabled={!approved}
            className="w-56 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">送信先を選択...</option>
            {approved && companies.map((c) => (
              <option key={c.companyId} value={c.companyId}>{c.companyName}</option>
            ))}
          </select>
          <button
            onClick={() => newCompanyId && router.push(`/portal/chat/${newCompanyId}`)}
            disabled={!newCompanyId}
            className="px-4 py-2 rounded-lg text-sm font-bold text-white disabled:opacity-40 whitespace-nowrap"
            style={{ background: "#1e3a8a" }}
          >
            新規チャット
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow divide-y divide-gray-100">
        {loading ? (
          <p className="text-center py-8 text-gray-400">読み込み中...</p>
        ) : rooms.length === 0 ? (
          <p className="text-center py-8 text-gray-400">まだメッセージのあるチャットがありません</p>
        ) : (
          rooms.map((r) => (
            <button
              key={r.companyId}
              onClick={() => router.push(`/portal/chat/${r.companyId}`)}
              className={`w-full flex items-center gap-4 px-4 py-3 text-left hover:bg-gray-100 transition-colors ${r.unreadCount > 0 ? "bg-blue-50/60" : ""}`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className={`text-sm truncate ${r.unreadCount > 0 ? "font-bold text-gray-900" : "font-medium text-gray-800"}`}>
                    {r.companyName}
                  </span>
                  <span className="text-xs text-gray-400 shrink-0">
                    {new Date(r.lastMessageAt).toLocaleString("ja-JP", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
                <p className={`text-xs truncate mt-0.5 ${r.unreadCount > 0 ? "text-gray-700 font-medium" : "text-gray-400"}`}>
                  {r.lastMessage}
                </p>
              </div>
              {r.unreadCount > 0 && (
                <span className="shrink-0 bg-red-500 text-white text-xs font-bold min-w-[20px] h-5 px-1.5 rounded-full flex items-center justify-center">
                  {r.unreadCount}
                </span>
              )}
            </button>
          ))
        )}
      </div>
    </div>
  );
}
