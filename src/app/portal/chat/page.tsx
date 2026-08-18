"use client";
import { useCallback, useEffect, useMemo, useRef, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

type Message = { id: number; senderType: "ADMIN" | "CUSTOMER"; body: string; createdAt: string };
type RoomData = { companyId: number; companyName: string; messages: Message[] };

function PortalChatContent() {
  const [companies, setCompanies] = useState<{ companyId: number; companyName: string }[]>([]);
  const [approved, setApproved] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(null);
  const [data, setData] = useState<RoomData | null>(null);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();

  // data が selectedCompanyId のものと一致する間だけ「読み込み済み」とみなす。
  // company切替時に明示的なリセット処理(setState)を effect 内で行わずに済む。
  const loaded = data?.companyId === selectedCompanyId;
  const companyName = loaded ? data!.companyName : "";
  const messages = useMemo(() => (loaded ? data!.messages : []), [loaded, data]);

  useEffect(() => {
    fetch("/api/portal/companies").then((r) => (r.ok ? r.json() : null)).then((d) => {
      if (d?.companies?.length) {
        setCompanies(d.companies);
        setApproved(d.approved);
        const urlCompanyId = searchParams.get("companyId");
        const target = urlCompanyId ? d.companies.find((c: { companyId: number }) => c.companyId === Number(urlCompanyId)) : null;
        if (target) setSelectedCompanyId(target.companyId);
        else if (d.approved && d.companies.length === 1) setSelectedCompanyId(d.companies[0].companyId);
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const load = useCallback((targetCompanyId: number) => {
    fetch(`/api/portal/chat?companyId=${targetCompanyId}`).then((r) => (r.ok ? r.json() : null)).then((d) => {
      if (!d) return;
      setData({ companyId: targetCompanyId, companyName: d.companyName ?? "", messages: d.messages ?? [] });
    });
  }, []);

  useEffect(() => {
    if (!selectedCompanyId) return;
    load(selectedCompanyId);
  }, [selectedCompanyId, load]);

  useEffect(() => {
    if (!selectedCompanyId) return;
    const id = setInterval(() => load(selectedCompanyId), 5000);
    return () => clearInterval(id);
  }, [selectedCompanyId, load]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || !selectedCompanyId || sending) return;
    setSending(true);
    setInput("");
    const res = await fetch("/api/portal/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ companyId: selectedCompanyId, body: text }),
    });
    if (res.ok) {
      const msg = await res.json();
      setData((prev) => (prev ? { ...prev, messages: [...prev.messages, msg] } : prev));
    } else {
      setInput(text);
    }
    setSending(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-bold text-gray-900 shrink-0">チャット相手</h1>
          <select
            className="w-56 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={!approved}
            value={selectedCompanyId ?? ""}
            onChange={(e) => setSelectedCompanyId(e.target.value ? Number(e.target.value) : null)}
          >
            <option value="">選択してください</option>
            {approved && companies.map((c) => (
              <option key={c.companyId} value={c.companyId}>{c.companyName}</option>
            ))}
          </select>
        </div>
      </div>

      {!selectedCompanyId ? (
        <div className="bg-white rounded-xl shadow p-8 text-center text-gray-400 text-sm">
          チャット相手を選択してください
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow flex flex-col h-[calc(100vh-220px)] min-h-[420px]">
          <div className="px-4 py-3 border-b border-gray-100 shrink-0">
            <h2 className="text-sm font-bold text-gray-900">{companyName}</h2>
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {!loaded ? (
              <p className="text-center text-gray-400 text-sm py-8">読み込み中...</p>
            ) : messages.length === 0 ? (
              <p className="text-center text-gray-400 text-sm py-8">まだメッセージはありません</p>
            ) : (
              messages.map((m) => (
                <div key={m.id} className={`flex ${m.senderType === "CUSTOMER" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm whitespace-pre-wrap break-words ${
                    m.senderType === "CUSTOMER" ? "bg-blue-600 text-white rounded-br-sm" : "bg-gray-100 text-gray-800 rounded-bl-sm"
                  }`}>
                    <p>{m.body}</p>
                    <p className={`text-[10px] mt-1 ${m.senderType === "CUSTOMER" ? "text-blue-100" : "text-gray-400"}`}>
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
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
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
      )}
    </div>
  );
}

export default function PortalChatPage() {
  return (
    <Suspense>
      <PortalChatContent />
    </Suspense>
  );
}
