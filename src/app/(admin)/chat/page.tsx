"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Room = { customerId: number; customerName: string; lastMessage: string; lastMessageAt: string; unreadCount: number };
type Customer = { id: number; name: string };

export default function AdminChatListPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [newCustomerId, setNewCustomerId] = useState("");
  const [showBroadcast, setShowBroadcast] = useState(false);
  const [broadcastText, setBroadcastText] = useState("");
  const [broadcasting, setBroadcasting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const load = () => {
      fetch("/api/admin/chat").then((r) => (r.ok ? r.json() : [])).then((d) => { setRooms(d); setLoading(false); });
    };
    load();
    const id = setInterval(load, 5000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    fetch("/api/customers?approved=1").then((r) => (r.ok ? r.json() : [])).then(setCustomers);
  }, []);

  const handleBroadcast = async () => {
    const text = broadcastText.trim();
    if (!text || broadcasting) return;
    if (!confirm(`承認済みの全会員（${customers.length}件）にこのメッセージを送信します。よろしいですか？`)) return;
    setBroadcasting(true);
    const res = await fetch("/api/admin/chat/broadcast", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: text }),
    });
    const data = await res.json().catch(() => ({}));
    setBroadcasting(false);
    if (res.ok) {
      alert(`${data.count}件の会員に送信しました`);
      setShowBroadcast(false);
      setBroadcastText("");
    } else {
      alert(data.error ?? "送信に失敗しました");
    }
  };

  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">チャット</h1>
        <div className="flex items-center gap-2">
          <select
            value={newCustomerId}
            onChange={(e) => setNewCustomerId(e.target.value)}
            className="w-56 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">会員を選択...</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <button
            onClick={() => newCustomerId && router.push(`/chat/${newCustomerId}`)}
            disabled={!newCustomerId}
            className="px-4 py-2 rounded-lg text-sm font-bold text-white disabled:opacity-40 whitespace-nowrap"
            style={{ background: "#1e3a8a" }}
          >
            新規チャット
          </button>
          <button
            onClick={() => setShowBroadcast(true)}
            className="px-4 py-2 rounded-lg text-sm font-bold text-white whitespace-nowrap bg-amber-600 hover:bg-amber-700"
          >
            全員に一斉送信
          </button>
        </div>
      </div>

      {showBroadcast && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md flex flex-col">
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <h2 className="font-bold text-gray-900">全員に一斉送信</h2>
              <button onClick={() => setShowBroadcast(false)} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
            </div>
            <div className="px-6 py-4 space-y-2">
              <p className="text-sm text-gray-500">承認済みの全会員（{customers.length}件）のチャットに同じメッセージを送信します。</p>
              <textarea
                value={broadcastText}
                onChange={(e) => setBroadcastText(e.target.value)}
                rows={6}
                placeholder="メッセージを入力..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>
            <div className="px-6 py-4 border-t flex gap-3">
              <button onClick={() => setShowBroadcast(false)} className="flex-1 py-2 rounded-lg text-sm text-gray-600 bg-gray-100 hover:bg-gray-200">
                キャンセル
              </button>
              <button
                onClick={handleBroadcast}
                disabled={!broadcastText.trim() || broadcasting}
                className="flex-1 py-2 rounded-lg text-sm font-bold text-white bg-amber-600 hover:bg-amber-700 disabled:opacity-50"
              >
                {broadcasting ? "送信中..." : "送信する"}
              </button>
            </div>
          </div>
        </div>
      )}
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
              className={`w-full flex items-center gap-4 px-4 py-3 text-left hover:bg-gray-100 transition-colors ${r.unreadCount > 0 ? "bg-blue-50/60" : ""}`}
            >
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
