"use client";
import { useEffect, useState } from "react";

type Announcement = { id: number; title: string; body: string; createdAt: string; _count: { reads: number } };

export default function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [saving, setSaving] = useState(false);

  const load = () => {
    fetch("/api/admin/announcements").then((r) => (r.ok ? r.json() : [])).then((d) => { setAnnouncements(d); setLoading(false); });
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    const t = title.trim();
    const b = body.trim();
    if (!t || !b || saving) return;
    setSaving(true);
    const res = await fetch("/api/admin/announcements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: t, body: b }),
    });
    const data = await res.json().catch(() => ({}));
    setSaving(false);
    if (res.ok) {
      setTitle("");
      setBody("");
      load();
    } else {
      alert(data.error ?? "登録に失敗しました");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("このお知らせを削除しますか？")) return;
    await fetch(`/api/admin/announcements/${id}`, { method: "DELETE" });
    load();
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900">お知らせ</h1>

      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <h2 className="font-semibold text-gray-800">新規登録</h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">タイトル</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">内容</label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={6}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>
        <button
          onClick={handleCreate}
          disabled={!title.trim() || !body.trim() || saving}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? "登録中..." : "登録する"}
        </button>
        <p className="text-xs text-gray-400">登録すると、承認済みの全ポータル会員のお知らせ一覧に表示されます。</p>
      </div>

      <div className="bg-white rounded-lg shadow divide-y divide-gray-100">
        {loading ? (
          <p className="text-center py-8 text-gray-400">読み込み中...</p>
        ) : announcements.length === 0 ? (
          <p className="text-center py-8 text-gray-400">まだお知らせがありません</p>
        ) : (
          announcements.map((a) => (
            <div key={a.id} className="px-5 py-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs text-gray-400">
                    {new Date(a.createdAt).toLocaleString("ja-JP", { year: "numeric", month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    <span className="ml-2">既読 {a._count.reads}件</span>
                  </p>
                  <h3 className="font-bold text-gray-900 mt-0.5">{a.title}</h3>
                  <p className="text-sm text-gray-600 whitespace-pre-wrap mt-1">{a.body}</p>
                </div>
                <button onClick={() => handleDelete(a.id)} className="text-xs text-red-500 hover:text-red-700 shrink-0">削除</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
