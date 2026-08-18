"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type Message = { id: number; senderType: "ADMIN" | "CUSTOMER"; body: string; createdAt: string };

export default function AdminChatRoomPage() {
  const params = useParams();
  const router = useRouter();
  const customerId = Number(params.customerId);
  const [customerName, setCustomerName] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const compositionEndAtRef = useRef(0);

  const load = useCallback((silent = false) => {
    fetch(`/api/admin/chat/${customerId}`).then((r) => {
      if (!r.ok) { setNotFound(true); return null; }
      return r.json();
    }).then((d) => {
      if (!d) return;
      setCustomerName(d.customer?.name ?? "");
      setMessages(d.messages ?? []);
      if (!silent) setLoaded(true);
    });
  }, [customerId]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const id = setInterval(() => load(true), 5000);
    return () => clearInterval(id);
  }, [load]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || sending) return;
    setSending(true);
    setInput("");
    const res = await fetch(`/api/admin/chat/${customerId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: text }),
    });
    if (res.ok) {
      const msg = await res.json();
      setMessages((prev) => [...prev, msg]);
    } else {
      setInput(text);
    }
    setSending(false);
  };

  if (notFound) {
    return (
      <div className="bg-white rounded-xl shadow p-8 text-center text-gray-400 text-sm">
        このチャットは表示できません
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <button onClick={() => router.push("/chat")} className="text-sm text-gray-500 hover:text-blue-600">
          ← チャット一覧
        </button>
      </div>
      <div className="bg-white rounded-xl shadow flex flex-col h-[calc(100vh-220px)] min-h-[420px] max-w-2xl mx-auto">
        <div className="px-4 py-3 border-b border-gray-100 shrink-0">
          <h2 className="text-sm font-bold text-gray-900">{customerName}</h2>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {!loaded ? (
            <p className="text-center text-gray-400 text-sm py-8">読み込み中...</p>
          ) : messages.length === 0 ? (
            <p className="text-center text-gray-400 text-sm py-8">まだメッセージはありません</p>
          ) : (
            messages.map((m) => (
              <div key={m.id} className={`flex ${m.senderType === "ADMIN" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm whitespace-pre-wrap break-words ${
                  m.senderType === "ADMIN" ? "bg-blue-600 text-white rounded-br-sm" : "bg-gray-100 text-gray-800 rounded-bl-sm"
                }`}>
                  <p>{m.body}</p>
                  <p className={`text-[10px] mt-1 ${m.senderType === "ADMIN" ? "text-blue-100" : "text-gray-400"}`}>
                    {new Date(m.createdAt).toLocaleString("ja-JP", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            ))
          )}
          <div ref={bottomRef} />
        </div>
        <div className="border-t border-gray-100 p-3 flex items-end gap-2 shrink-0">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onCompositionEnd={() => { compositionEndAtRef.current = Date.now(); }}
            onKeyDown={(e) => {
              if (e.key !== "Enter" || e.shiftKey) return;
              if (e.nativeEvent.isComposing) return;
              // Safariはcomposition確定Enterでcompositionendがkeydownより先に発火しisComposingが既にfalseになるため、直後は無視する
              if (Date.now() - compositionEndAtRef.current < 100) return;
              e.preventDefault();
              handleSend();
            }}
            rows={1}
            placeholder="メッセージを入力..."
            className="flex-1 border border-gray-300 rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 max-h-32"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || sending}
            className="shrink-0 px-4 py-2 rounded-xl text-sm font-bold text-white disabled:opacity-40"
            style={{ background: "#1e3a8a" }}
          >
            送信
          </button>
        </div>
      </div>
    </div>
  );
}
