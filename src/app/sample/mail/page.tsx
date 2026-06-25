import { SampleNav } from "../_nav";

export const metadata = { title: "メール送信 - OrderLink" };

const sent = [
  { id: 1, customer: "田中酒店", title: "新商品のご案内", sent: "2026/6/24 14:30", attachment: "商品案内2026.pdf" },
  { id: 2, customer: "佐藤商店", title: "夏季限定商品のご案内", sent: "2026/6/23 10:15", attachment: "" },
  { id: 3, customer: "鈴木酒販", title: "価格改定のお知らせ", sent: "2026/6/20 09:00", attachment: "価格表2026.pdf" },
];

export default function SampleMailPage() {
  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <SampleNav active="メール送信" />
      <div className="p-6 space-y-4">
        <h1 className="text-xl font-bold text-gray-900">メール送信</h1>

        {/* タブ */}
        <div className="flex border-b border-gray-200">
          <span className="px-5 py-2.5 text-sm font-medium border-b-2 border-blue-600 text-blue-600 cursor-pointer">発注書を作成</span>
          <span className="px-5 py-2.5 text-sm font-medium text-gray-500 cursor-pointer">送信済み一覧</span>
        </div>

        {/* フォーム */}
        <div className="bg-white rounded-xl shadow p-6 space-y-4 max-w-2xl">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">送信先 <span className="text-red-500">*</span></label>
            <div className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-400 bg-gray-50">田中酒店</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">件名</label>
            <div className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-400 bg-gray-50">新商品のご案内</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">メッセージ</label>
            <div className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-300 bg-gray-50 h-24">いつもお世話になっております。新商品のご案内をお送りいたします。</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">添付ファイル</label>
            <div className="border-2 border-dashed border-gray-200 rounded-lg px-4 py-6 text-center text-sm text-gray-400">
              PDFをドラッグ＆ドロップ、またはクリックして選択
            </div>
          </div>
          <button className="px-6 py-2 rounded-lg text-sm font-bold text-white" style={{ background: "#1e3a5f" }}>
            送信する
          </button>
        </div>

        {/* 送信済みプレビュー */}
        <div className="bg-white rounded-xl shadow overflow-hidden max-w-2xl">
          <div className="px-4 py-3 bg-gray-50 text-xs font-bold text-gray-500 uppercase">送信済み一覧</div>
          <table className="w-full text-sm">
            <thead className="text-xs text-gray-500 border-b">
              <tr>
                <th className="px-4 py-2 text-left">送信先</th>
                <th className="px-4 py-2 text-left">件名</th>
                <th className="px-4 py-2 text-left">添付</th>
                <th className="px-4 py-2 text-right">送信日時</th>
              </tr>
            </thead>
            <tbody>
              {sent.map((s, i) => (
                <tr key={s.id} className={`border-t border-gray-100 ${i % 2 === 1 ? "bg-gray-50" : ""}`}>
                  <td className="px-4 py-2.5 font-medium text-gray-700">{s.customer}</td>
                  <td className="px-4 py-2.5 text-gray-600">{s.title}</td>
                  <td className="px-4 py-2.5 text-gray-400 text-xs">{s.attachment || "—"}</td>
                  <td className="px-4 py-2.5 text-right text-gray-400 text-xs">{s.sent}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
