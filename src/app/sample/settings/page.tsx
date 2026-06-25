import { SampleNav } from "../_nav";

export const metadata = { title: "設定 - OrderLink" };

const inputCls = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-500";

export default function SampleSettingsPage() {
  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <SampleNav active="" />
      <div className="p-6 max-w-lg space-y-6">
        <h1 className="text-xl font-bold text-gray-900">設定</h1>

        {/* 会社情報 */}
        <div className="bg-white rounded-xl shadow p-6 space-y-4">
          <h2 className="font-bold text-gray-800">会社情報</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">会社名 <span className="text-red-500">*</span></label>
            <div className={inputCls}>〇〇酒造株式会社</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">住所</label>
            <div className={inputCls}>長野県〇〇市〇〇町1-2-3</div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">電話番号</label>
              <div className={inputCls}>000-0000-0000</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">FAX番号</label>
              <div className={inputCls}>000-0000-0001</div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">メールアドレス</label>
            <div className={inputCls}>info@example-sake.jp</div>
          </div>
          <button className="px-5 py-2 rounded-lg text-sm font-bold text-white" style={{ background: "#1e3a5f" }}>
            保存する
          </button>
        </div>

        {/* ログイン情報変更 */}
        <div className="bg-white rounded-xl shadow p-6 space-y-4">
          <h2 className="font-bold text-gray-800">ログイン情報の変更</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">現在のログインID</label>
            <div className={inputCls}>yamasan</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">現在のパスワード</label>
            <div className={inputCls}>••••••••</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">新しいログインID</label>
            <div className={`${inputCls} text-gray-300`}>新しいIDを入力</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">新しいパスワード</label>
            <div className={`${inputCls} text-gray-300`}>6文字以上</div>
          </div>
          <button className="px-5 py-2 rounded-lg text-sm font-bold text-white bg-gray-500">
            変更する
          </button>
        </div>
      </div>
    </div>
  );
}
