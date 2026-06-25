import { SampleNav } from "../_nav";

export const metadata = { title: "リクエスト - OrderLink" };

const requests = [
  {
    id: 1,
    date: "2026/6/25 09:45",
    customer: "田中酒店",
    items: [
      { product: "〇〇 純米大吟醸", volume: "1800ml", qty: 2, price: 1900 },
      { product: "〇〇 純米大吟醸", volume: "720ml",  qty: 3, price: 1000 },
    ],
    note: "",
  },
  {
    id: 2,
    date: "2026/6/25 08:30",
    customer: "佐藤商店",
    items: [
      { product: "〇〇 スパークリング", volume: "720ml", qty: 5, price: 900 },
    ],
    note: "6月末納品希望",
  },
  {
    id: 3,
    date: "2026/6/24 16:10",
    customer: "鈴木酒販",
    items: [
      { product: "〇〇 大吟醸", volume: "720ml", qty: 6, price: 1800 },
    ],
    note: "",
  },
];

export default function SampleRequestsPage() {
  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <SampleNav active="リクエスト" />
      <div className="p-6 space-y-4">
        <h1 className="text-xl font-bold text-gray-900">リクエスト一覧</h1>
        <div className="space-y-4">
          {requests.map((r) => (
            <div key={r.id} className="bg-white rounded-xl shadow p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-gray-800 text-base">{r.customer}</span>
                  <span className="text-xs text-gray-400 ml-3">{r.date}</span>
                </div>
                <div className="flex gap-2">
                  <button className="px-4 py-1.5 text-sm font-bold text-white rounded-lg bg-blue-600">受注確定</button>
                  <button className="px-4 py-1.5 text-sm font-medium text-red-500 rounded-lg border border-red-300">却下</button>
                </div>
              </div>
              <table className="w-full text-sm">
                <thead className="text-xs text-gray-500 border-b">
                  <tr>
                    <th className="text-left py-1">商品</th>
                    <th className="text-center py-1">容量</th>
                    <th className="text-center py-1">数量</th>
                    <th className="text-right py-1">卸値</th>
                  </tr>
                </thead>
                <tbody>
                  {r.items.map((item, i) => (
                    <tr key={i} className="border-b border-gray-50">
                      <td className="py-1.5 text-gray-700">{item.product}</td>
                      <td className="py-1.5 text-center text-gray-500">{item.volume}</td>
                      <td className="py-1.5 text-center font-bold text-blue-600">{item.qty}</td>
                      <td className="py-1.5 text-right text-gray-700">¥{item.price.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {r.note && <p className="text-xs text-gray-500 bg-gray-50 rounded px-3 py-1.5">備考：{r.note}</p>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
