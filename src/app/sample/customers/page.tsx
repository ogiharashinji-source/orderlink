import { SampleNav } from "../_nav";

export const metadata = { title: "顧客管理 - OrderLink" };

const customers = [
  { id: 1, code: "001", name: "田中酒店", address: "長野県長野市", phone: "026-000-0001", email: "tanaka@example.com", approved: true },
  { id: 2, code: "002", name: "佐藤商店", address: "長野県松本市", phone: "0263-00-0002", email: "sato@example.com", approved: true },
  { id: 3, code: "003", name: "鈴木酒販", address: "長野県上田市", phone: "0268-00-0003", email: "suzuki@example.com", approved: true },
  { id: 4, code: "004", name: "高橋食品", address: "長野県飯田市", phone: "0265-00-0004", email: "takahashi@example.com", approved: true },
  { id: 5, code: "",    name: "伊藤酒店", address: "長野県諏訪市", phone: "0266-00-0005", email: "ito@example.com", approved: false },
];

export default function SampleCustomersPage() {
  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <SampleNav active="顧客" />
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">顧客管理</h1>
          <div className="flex gap-2 items-center">
            <span className="text-sm text-gray-500">{customers.length}件</span>
            <button className="border border-gray-300 bg-white text-sm px-4 py-1.5 rounded-lg text-gray-600">QRコード</button>
            <button className="bg-blue-600 text-white text-sm px-4 py-1.5 rounded-lg font-medium">＋ 新規登録</button>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow overflow-x-auto">
          <table className="w-full text-sm whitespace-nowrap">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
              <tr>
                <th className="px-3 py-3 text-left w-8"><input type="checkbox" className="rounded" /></th>
                <th className="px-4 py-3 text-left">会員コード</th>
                <th className="px-4 py-3 text-left">会社名</th>
                <th className="px-4 py-3 text-left">住所</th>
                <th className="px-4 py-3 text-left">電話番号</th>
                <th className="px-4 py-3 text-left">メールアドレス</th>
                <th className="px-4 py-3 text-center">承認</th>
                <th className="px-4 py-3 text-right">操作</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c, idx) => (
                <tr key={c.id} className={`border-t border-gray-100 ${idx % 2 === 1 ? "bg-gray-50" : "bg-white"}`}>
                  <td className="px-3 py-3"><input type="checkbox" className="rounded" /></td>
                  <td className="px-4 py-3 text-gray-500">{c.code || "—"}</td>
                  <td className="px-4 py-3 font-medium text-gray-800">{c.name}</td>
                  <td className="px-4 py-3 text-gray-500">{c.address}</td>
                  <td className="px-4 py-3 text-gray-500">{c.phone}</td>
                  <td className="px-4 py-3 text-gray-500">{c.email}</td>
                  <td className="px-4 py-3 text-center">
                    {c.approved
                      ? <span className="text-xs font-bold px-2 py-1 rounded-full bg-green-100 text-green-700">承認済</span>
                      : <span className="text-xs font-bold px-2 py-1 rounded-full bg-yellow-100 text-yellow-700">未承認</span>
                    }
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex gap-3 justify-end">
                      <button className="text-blue-600 text-xs hover:underline">編集</button>
                      <button className="text-red-400 text-xs hover:underline">削除</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
