import { SampleNav } from "../_nav";

export const metadata = { title: "商品管理 - OrderLink" };

const products = [
  { id: 1, name: "〇〇 純米大吟醸", category: "純米大吟醸", rice: "山田錦", seimaiWari: "40%", alcohol: "16度", published: true,
    variants: [{ vol: "1800ml", retail: 3600, wholesale: 1900, lot: "6本", stock: 48 }, { vol: "720ml", retail: 1800, wholesale: 1000, lot: "12本", stock: 120 }] },
  { id: 2, name: "〇〇 スパークリング", category: "純米吟醸", rice: "山田錦", seimaiWari: "55%", alcohol: "13度", published: true,
    variants: [{ vol: "1800ml", retail: 3600, wholesale: 1700, lot: "6本", stock: 24 }, { vol: "720ml", retail: 1600, wholesale: 900, lot: "12本", stock: 60 }] },
  { id: 3, name: "〇〇 大吟醸 35", category: "大吟醸", rice: "山田錦", seimaiWari: "35%", alcohol: "17度", published: true,
    variants: [{ vol: "720ml", retail: 3200, wholesale: 1800, lot: "12本", stock: 36 }] },
  { id: 4, name: "〇〇 純米酒", category: "純米酒", rice: "山田錦", seimaiWari: "65%", alcohol: "15度", published: false,
    variants: [{ vol: "1800ml", retail: 2400, wholesale: 1300, lot: "6本", stock: 0 }] },
];

export default function SampleProductsPage() {
  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <SampleNav active="商品" />
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">商品管理</h1>
          <button className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg font-medium">＋ 新規登録</button>
        </div>
        <div className="bg-white rounded-xl shadow overflow-x-auto">
          <table className="w-full text-sm whitespace-nowrap">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
              <tr>
                <th className="px-3 py-3 text-left w-8"><input type="checkbox" className="rounded" /></th>
                <th className="px-4 py-3 text-left">商品名</th>
                <th className="px-4 py-3 text-left">種別</th>
                <th className="px-4 py-3 text-left">酒米</th>
                <th className="px-4 py-3 text-center">精米歩合</th>
                <th className="px-4 py-3 text-center">アルコール</th>
                <th className="px-4 py-3 text-center">容量</th>
                <th className="px-4 py-3 text-right">小売値</th>
                <th className="px-4 py-3 text-right">卸値</th>
                <th className="px-4 py-3 text-center">ロット</th>
                <th className="px-4 py-3 text-center">在庫</th>
                <th className="px-4 py-3 text-center">公開</th>
                <th className="px-4 py-3 text-right">操作</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p, pi) =>
                p.variants.map((v, vi) => (
                  <tr key={`${p.id}-${vi}`} className={`border-t border-gray-100 ${pi % 2 === 1 ? "bg-gray-50" : "bg-white"}`}>
                    {vi === 0 && (
                      <td className="px-3 py-3 align-middle" rowSpan={p.variants.length}>
                        <input type="checkbox" className="rounded" />
                      </td>
                    )}
                    {vi === 0 && (
                      <td className="px-4 py-3 font-medium text-gray-800 align-middle" rowSpan={p.variants.length}>{p.name}</td>
                    )}
                    {vi === 0 && (
                      <td className="px-4 py-3 text-gray-500 align-middle" rowSpan={p.variants.length}>{p.category}</td>
                    )}
                    {vi === 0 && (
                      <td className="px-4 py-3 text-gray-500 align-middle" rowSpan={p.variants.length}>{p.rice}</td>
                    )}
                    {vi === 0 && (
                      <td className="px-4 py-3 text-center text-gray-500 align-middle" rowSpan={p.variants.length}>{p.seimaiWari}</td>
                    )}
                    {vi === 0 && (
                      <td className="px-4 py-3 text-center text-gray-500 align-middle" rowSpan={p.variants.length}>{p.alcohol}</td>
                    )}
                    <td className="px-4 py-3 text-center text-gray-600">{v.vol}</td>
                    <td className="px-4 py-3 text-right text-gray-700">¥{v.retail.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right text-gray-700">¥{v.wholesale.toLocaleString()}</td>
                    <td className="px-4 py-3 text-center text-gray-600">{v.lot}</td>
                    <td className="px-4 py-3 text-center text-gray-600">{v.stock}</td>
                    {vi === 0 && (
                      <td className="px-4 py-3 text-center align-middle" rowSpan={p.variants.length}>
                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${p.published ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                          {p.published ? "公開中" : "非公開"}
                        </span>
                      </td>
                    )}
                    {vi === 0 && (
                      <td className="px-4 py-3 text-right align-middle" rowSpan={p.variants.length}>
                        <div className="flex gap-3 justify-end">
                          <button className="text-blue-600 text-xs hover:underline">編集</button>
                          <button className="text-red-400 text-xs hover:underline">削除</button>
                        </div>
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
