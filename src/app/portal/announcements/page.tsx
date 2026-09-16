"use client";
import { useEffect, useState } from "react";

type Announcement = { id: number; title: string; body: string; createdAt: string; companyName: string; read: boolean };

export default function PortalAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/portal/announcements").then((r) => (r.ok ? r.json() : [])).then((d) => { setAnnouncements(d); setLoading(false); });
  }, []);

  const handleOpen = (a: Announcement) => {
    setOpenId(openId === a.id ? null : a.id);
    if (!a.read) {
      fetch(`/api/portal/announcements/${a.id}/read`, { method: "POST" });
      setAnnouncements((prev) => prev.map((x) => (x.id === a.id ? { ...x, read: true } : x)));
    }
  };

  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900">お知らせ</h1>

      <div className="bg-white rounded-lg shadow divide-y divide-gray-100">
        {loading ? (
          <p className="text-center py-8 text-gray-400">読み込み中...</p>
        ) : announcements.length === 0 ? (
          <p className="text-center py-8 text-gray-400">お知らせはありません</p>
        ) : (
          announcements.map((a) => (
            <div key={a.id}>
              <button
                onClick={() => handleOpen(a)}
                className={`w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-gray-50 transition-colors ${!a.read ? "bg-blue-50/60" : ""}`}
              >
                {!a.read && (
                  <span className="shrink-0 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">NEW</span>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-400">
                    {new Date(a.createdAt).toLocaleString("ja-JP", { year: "numeric", month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    <span className="ml-2">{a.companyName}</span>
                  </p>
                  <h3 className={`mt-0.5 ${!a.read ? "font-bold text-gray-900" : "font-medium text-gray-700"}`}>{a.title}</h3>
                </div>
              </button>
              {openId === a.id && (
                <div className="px-5 pb-4 -mt-1">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{a.body}</p>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
