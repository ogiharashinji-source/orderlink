export const metadata = { title: "受注管理 - OrderLink" };

const orders = [
  {
    id: 1,
    date: "2026/6/25",
    time: "09:12",
    company: "田中酒店",
    items: [
      { product: "〇〇 純米大吟醸", type: "純米大吟醸", rice: "山田錦", volume: "1800ml", retail: "¥3,600", wholesale: "¥1,900", lot: 6, qty: 2 },
      { product: "〇〇 純米大吟醸", type: "純米大吟醸", rice: "山田錦", volume: "720ml", retail: "¥1,800", wholesale: "¥1,000", lot: 12, qty: 3 },
    ],
    note: "",
  },
  {
    id: 2,
    date: "2026/6/25",
    time: "08:45",
    company: "佐藤商店",
    items: [
      { product: "〇〇 スパークリング", type: "純米吟醸", rice: "山恵錦", volume: "720ml", retail: "¥1,600", wholesale: "¥900", lot: 12, qty: 5 },
    ],
    note: "6月末納品希望",
  },
  {
    id: 3,
    date: "2026/6/24",
    time: "17:30",
    company: "鈴木酒販",
    items: [
      { product: "〇〇 金紋錦 大吟醸 35", type: "大吟醸", rice: "金紋錦", volume: "720ml", retail: "¥3,200", wholesale: "¥1,800", lot: 12, qty: 1 },
      { product: "〇〇 純米大吟醸", type: "純米大吟醸", rice: "山田錦", volume: "1800ml", retail: "¥3,600", wholesale: "¥1,900", lot: 6, qty: 2 },
      { product: "〇〇 スパークリング", type: "純米吟醸", rice: "山恵錦", volume: "1800ml", retail: "¥3,600", wholesale: "¥1,700", lot: 6, qty: 1 },
    ],
    note: "",
  },
  {
    id: 4,
    date: "2026/6/24",
    time: "14:22",
    company: "高橋食品",
    items: [
      { product: "〇〇 純米大吟醸", type: "純米大吟醸", rice: "山田錦", volume: "720ml", retail: "¥1,800", wholesale: "¥1,000", lot: 12, qty: 6 },
    ],
    note: "",
  },
  {
    id: 5,
    date: "2026/6/23",
    time: "11:05",
    company: "伊藤酒店",
    items: [
      { product: "〇〇 スパークリング", type: "純米吟醸", rice: "山恵錦", volume: "720ml", retail: "¥1,600", wholesale: "¥900", lot: 12, qty: 4 },
      { product: "〇〇 金紋錦 大吟醸 35", type: "大吟醸", rice: "金紋錦", volume: "720ml", retail: "¥3,200", wholesale: "¥1,800", lot: 12, qty: 2 },
    ],
    note: "7月上旬納品",
  },
];

export default function SamplePage() {
  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      {/* ナビ */}
      <nav className="bg-[#1e3a5f] text-white px-6 py-3 flex items-center gap-8 text-sm">
        <span className="font-bold text-base tracking-widest mr-4">OrderLink</span>
        {["リクエスト", "受注", "商品", "顧客", "メール送信"].map((n) => (
          <span key={n} className={`cursor-pointer ${n === "受注" ? "border-b-2 border-amber-400 pb-1 font-bold" : "opacity-70"}`}>{n}</span>
        ))}
        <span className="ml-auto opacity-70">〇〇酒造株式会社</span>
      </nav>

      <div className="p-6 space-y-4">
        {/* タイトル・フィルター */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h1 className="text-xl font-bold text-gray-900">受注管理</h1>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1 bg-white border border-gray-300 rounded-lg px-3 py-1.5 text-sm text-gray-700">
              <span>2026/05/25</span>
              <span className="mx-1 text-gray-400">〜</span>
              <span>2026/06/25</span>
            </div>
            <input className="bg-white border border-gray-300 rounded-lg px-3 py-1.5 text-sm w-48 text-gray-400" placeholder="会社名・商品名で検索..." readOnly />
            <button className="bg-[#1e3a5f] text-white text-sm px-4 py-1.5 rounded-lg font-medium">検索</button>
            <button className="border border-gray-300 bg-white text-sm px-4 py-1.5 rounded-lg text-gray-700">CSV出力</button>
            <button className="bg-blue-600 text-white text-sm px-4 py-1.5 rounded-lg font-medium">＋ 新規登録</button>
          </div>
        </div>

        {/* テーブル */}
        <div className="bg-white rounded-xl shadow overflow-x-auto">
          <table className="w-full text-sm whitespace-nowrap">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
              <tr>
                <th className="px-4 py-3 text-center">受注日時</th>
                <th className="px-4 py-3 text-left">会社名</th>
                <th className="px-4 py-3 text-left">商品</th>
                <th className="px-4 py-3 text-left">種別</th>
                <th className="px-4 py-3 text-left">酒米</th>
                <th className="px-4 py-3 text-center">容量</th>
                <th className="px-4 py-3 text-right">小売値</th>
                <th className="px-4 py-3 text-right">卸値</th>
                <th className="px-4 py-3 text-center">ロット</th>
                <th className="px-4 py-3 text-center">販売数</th>
                <th className="px-4 py-3 text-left">備考</th>
                <th className="px-4 py-3 text-right">操作</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o, oi) =>
                o.items.map((item, ii) => (
                  <tr key={`${o.id}-${ii}`} className={`border-t border-gray-100 ${oi % 2 === 1 ? "bg-gray-50" : "bg-white"}`}>
                    {ii === 0 && (
                      <td className="px-4 py-3 text-gray-500 align-middle text-center whitespace-nowrap" rowSpan={o.items.length}>
                        <div>{o.date}</div>
                        <div className="text-xs">{o.time}</div>
                      </td>
                    )}
                    {ii === 0 && (
                      <td className="px-4 py-3 font-medium text-gray-800 align-middle" rowSpan={o.items.length}>
                        {o.company}
                      </td>
                    )}
                    <td className="px-4 py-3 text-gray-700">{item.product}</td>
                    <td className="px-4 py-3 text-gray-500">{item.type}</td>
                    <td className="px-4 py-3 text-gray-500">{item.rice}</td>
                    <td className="px-4 py-3 text-center text-gray-600">{item.volume}</td>
                    <td className="px-4 py-3 text-right text-gray-700">{item.retail}</td>
                    <td className="px-4 py-3 text-right text-gray-700">{item.wholesale}</td>
                    <td className="px-4 py-3 text-center text-gray-600">{item.lot}</td>
                    <td className="px-4 py-3 text-center font-bold text-blue-600">{item.qty}</td>
                    {ii === 0 && (
                      <td className="px-4 py-3 text-gray-400 text-xs align-middle" rowSpan={o.items.length}>
                        {o.note || "—"}
                      </td>
                    )}
                    {ii === 0 && (
                      <td className="px-4 py-3 text-right align-middle" rowSpan={o.items.length}>
                        <button className="text-blue-600 text-xs hover:underline">詳細</button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
