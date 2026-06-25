import { SampleNav } from "../_nav";

export const metadata = { title: "リクエスト - OrderLink" };

const requests = [
  {
    id: 1, date: "2026/6/25", time: "09:45", customer: "田中酒店",
    items: [
      { product: "〇〇 純米大吟醸", category: "純米大吟醸", rice: "山田錦", volume: "1800ml", retail: 3600, wholesale: 1900, lot: "6本", qty: 2 },
      { product: "〇〇 純米大吟醸", category: "純米大吟醸", rice: "山田錦", volume: "720ml",  retail: 1800, wholesale: 1000, lot: "12本", qty: 3 },
    ],
  },
  {
    id: 2, date: "2026/6/25", time: "08:30", customer: "佐藤商店",
    items: [
      { product: "〇〇 スパークリング", category: "純米吟醸", rice: "山田錦", volume: "720ml", retail: 1600, wholesale: 900, lot: "12本", qty: 5 },
    ],
  },
  {
    id: 3, date: "2026/6/24", time: "16:10", customer: "鈴木酒販",
    items: [
      { product: "〇〇 大吟醸 35", category: "大吟醸", rice: "山田錦", volume: "720ml",  retail: 3200, wholesale: 1800, lot: "12本", qty: 1 },
      { product: "〇〇 純米大吟醸", category: "純米大吟醸", rice: "山田錦", volume: "1800ml", retail: 3600, wholesale: 1900, lot: "6本",  qty: 2 },
    ],
  },
];

export default function SampleRequestsPage() {
  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <SampleNav active="リクエスト" />
      <div className="p-6 space-y-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900">リクエスト一覧</h1>
          <span className="bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">3件</span>
        </div>

        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full text-sm whitespace-nowrap">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
              <tr>
                <th className="px-4 py-3 text-center">リクエスト日</th>
                <th className="px-4 py-3 text-left">会社名</th>
                <th className="px-4 py-3 text-left">商品</th>
                <th className="px-4 py-3 text-left">種別</th>
                <th className="px-4 py-3 text-left">酒米</th>
                <th className="px-4 py-3 text-center">容量</th>
                <th className="px-4 py-3 text-center">小売値</th>
                <th className="px-4 py-3 text-center">卸売値</th>
                <th className="px-4 py-3 text-center">ロット</th>
                <th className="px-4 py-3 text-center">希望ケース</th>
                <th className="px-4 py-3 text-center">操作</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req, ri) =>
                req.items.map((item, idx) => (
                  <tr key={`${req.id}-${idx}`}
                    className={`border-t border-gray-100 ${idx === req.items.length - 1 ? "border-b-2 border-b-gray-200" : ""}`}>
                    {idx === 0 && (
                      <td className="px-4 py-3 text-gray-500 align-middle text-center whitespace-nowrap" rowSpan={req.items.length}>
                        <div>{req.date}</div>
                        <div className="mt-0.5 text-xs">{req.time}</div>
                      </td>
                    )}
                    {idx === 0 && (
                      <td className="px-4 py-3 text-left text-gray-800 font-medium align-middle" rowSpan={req.items.length}>
                        {req.customer}
                      </td>
                    )}
                    <td className="px-4 py-3 text-left text-gray-800 font-medium">{item.product}</td>
                    <td className="px-4 py-3 text-left text-gray-500 text-xs">{item.category}</td>
                    <td className="px-4 py-3 text-left text-gray-500 text-xs">{item.rice}</td>
                    <td className="px-4 py-3 text-center text-gray-700">{item.volume}</td>
                    <td className="px-4 py-3 text-center text-gray-700">¥{item.retail.toLocaleString()}</td>
                    <td className="px-4 py-3 text-center text-gray-700">¥{item.wholesale.toLocaleString()}</td>
                    <td className="px-4 py-3 text-center text-gray-700">{item.lot}</td>
                    <td className="px-4 py-3 text-center text-gray-700">{item.qty}</td>
                    {idx === 0 && (
                      <td className="px-4 py-3 text-center align-middle" rowSpan={req.items.length}>
                        <button className="bg-red-600 text-white px-5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap">
                          確認
                        </button>
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
