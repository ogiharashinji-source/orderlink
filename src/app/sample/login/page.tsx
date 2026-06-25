export const metadata = { title: "ログイン - OrderLink" };

export default function SampleLoginPage() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center font-sans">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-black text-[#1e3a5f] tracking-widest">OrderLink</h1>
          <p className="text-sm text-gray-500 mt-1">管理者ログイン</p>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-8 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ログインID</label>
            <div className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-400 bg-gray-50">your-login-id</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">パスワード</label>
            <div className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-400 bg-gray-50">••••••••</div>
          </div>
          <button className="w-full py-2.5 rounded-lg text-sm font-bold text-white" style={{ background: "#1e3a5f" }}>
            ログイン
          </button>
        </div>
      </div>
    </div>
  );
}
