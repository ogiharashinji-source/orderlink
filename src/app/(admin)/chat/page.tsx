"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Room = { customerId: number; customerName: string; lastMessage: string; lastMessageAt: string; unreadCount: number };

export default function AdminChatListPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const load = () => {
      fetch("/api/admin/chat").then((r) => (r.ok ? r.json() : [])).then((d) => { setRooms(d); setLoading(false); });
    };
    load();
    const id = setInterval(load, 5000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">チャット</h1>
      <div className="bg-white rounded-lg shadow divide-y divide-gray-100">
        {loading ? (
          <p className="text-center py-8 text-gray-400">読み込み中...</p>
        ) : rooms.length === 0 ? (
          <p className="text-center py-8 text-gray-400">まだメッセージのあるチャットがありません</p>
        ) : (
          rooms.map((r) => (
            <button
              key={r.customerId}
              onClick={() => router.push(`/chat/${r.customerId}`)}
              className={`w-full flex items-center gap-4 px-4 py-3 text-left hover:bg-gray-50 transition-colors ${r.unreadCount > 0 ? "bg-blue-50/60" : ""}`}
            >
              <div className="w-11 h-11 rounded-full bg-[#1e3a5f] text-white flex items-center justify-center font-bold text-sm shrink-0">
                {r.customerName.slice(0, 1)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className={`text-sm truncate ${r.unreadCount > 0 ? "font-bold text-gray-900" : "font-medium text-gray-800"}`}>
                    {r.customerName}
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
