import Link from "next/link";

export const metadata = { title: "OrderLink - 酒蔵向け受発注システム" };

export default function RootPage() {
  return (
    <div className="min-h-screen bg-white font-sans">

      {/* ヘッダー */}
      <header className="bg-[#1e3a5f] text-white px-6 py-4 flex items-center justify-between">
        <div>
          <span className="text-xl font-bold tracking-widest">OrderLink</span>
          <span className="text-xs ml-2 opacity-70">オーダーリンク</span>
        </div>
        <div className="flex gap-3">
          <Link href="/admin/login"
            className="border border-white text-white font-bold text-sm px-5 py-2 rounded-full hover:bg-white hover:text-[#1e3a5f] transition">
            ログイン
          </Link>
          <Link href="/register"
            className="bg-amber-400 text-[#1e3a5f] font-bold text-sm px-5 py-2 rounded-full hover:bg-amber-300 transition">
            新規登録
          </Link>
        </div>
      </header>

      {/* ヒーロー */}
      <section className="bg-[#1e3a5f] text-white text-center px-6 py-16">
        <div className="inline-block border-2 border-amber-400 rounded-xl px-6 py-3 mb-6">
          <p className="text-amber-400 font-black text-xl md:text-2xl tracking-widest">酒蔵向け受発注システム</p>
        </div>
        <h1 className="text-4xl md:text-5xl font-black leading-tight mb-2">
          FAX受注、<br />まだ続けますか？
        </h1>
        <p className="text-base opacity-80 mt-4 mb-10">販売店からの注文を、もっと簡単に。</p>

        {/* バッジ */}
        <div className="flex justify-center gap-4 flex-wrap mb-10">
          {[
            { label: "完全", sub: "無料※", color: "bg-amber-400 text-[#1e3a5f]" },
            { label: "5分で", sub: "始められる", color: "bg-white text-[#1e3a5f]" },
            { label: "FAX", sub: "不要", color: "bg-amber-400 text-[#1e3a5f]" },
          ].map((b) => (
            <div key={b.label} className={`${b.color} rounded-full w-24 h-24 flex flex-col items-center justify-center font-black shadow-lg`}>
              <span className="text-lg leading-none">{b.label}</span>
              <span className="text-sm leading-none">{b.sub}</span>
            </div>
          ))}
        </div>

        <Link href="/register"
          className="inline-block bg-amber-400 text-[#1e3a5f] font-black text-lg px-10 py-4 rounded-full shadow-lg hover:bg-amber-300 transition">
          今すぐ無料で始める →
        </Link>
        <p className="text-xs opacity-60 mt-3">※酒蔵様限定で、初期費用・月額費用ともに0円でご利用いただけます。</p>
      </section>

      {/* お悩みセクション */}
      <section className="bg-gray-50 px-6 py-14">
        <h2 className="text-center text-xl font-bold text-gray-800 mb-8">
          酒蔵の受発注業務、こんなお悩みありませんか？
        </h2>
        <div className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: "🖨️", title: "FAX整理が大変", desc: "注文書の管理や\n手入力に時間がかかる" },
            { icon: "📞", title: "電話注文でミスが起きる", desc: "聞き間違いや\n書き間違いが発生する" },
            { icon: "📁", title: "注文履歴が探せない", desc: "過去の注文を\nすぐに確認できない" },
          ].map((p) => (
            <div key={p.title} className="bg-white rounded-xl shadow p-6 text-center border border-gray-100">
              <div className="text-4xl mb-3">{p.icon}</div>
              <p className="font-bold text-gray-800 mb-2">{p.title}</p>
              <p className="text-sm text-gray-500 whitespace-pre-line">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 解決策 */}
      <section className="px-6 py-14 bg-white text-center">
        <p className="text-sm font-bold text-[#1e3a5f] tracking-widest mb-2">酒蔵の受発注を一元管理！</p>
        <h2 className="text-3xl font-black text-gray-900 mb-1">酒蔵専用</h2>
        <h2 className="text-3xl font-black text-[#1e3a5f] mb-2">受発注システム</h2>
        <p className="text-lg font-bold tracking-widest text-gray-700 mb-10">— OrderLink —</p>

        {/* スクリーンショット placeholder */}
        <div className="max-w-2xl mx-auto mb-12 bg-gray-100 rounded-2xl border-4 border-gray-200 overflow-hidden shadow-xl">
          <div className="bg-gray-200 px-4 py-2 flex gap-2 items-center">
            <span className="w-3 h-3 rounded-full bg-red-400 inline-block"></span>
            <span className="w-3 h-3 rounded-full bg-yellow-400 inline-block"></span>
            <span className="w-3 h-3 rounded-full bg-green-400 inline-block"></span>
            <span className="text-xs text-gray-500 ml-2">orderlink.jp</span>
          </div>
          <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
            ※ スクリーンショット準備中
          </div>
        </div>

        {/* メリット */}
        <h3 className="text-base font-bold text-gray-600 mb-6">酒蔵のメリット</h3>
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-3 gap-5">
          {[
            { icon: "📋", title: "FAX整理不要", desc: "紙の注文書整理や\n手入力の手間を削減" },
            { icon: "🔍", title: "注文履歴を一元管理", desc: "過去の注文をすぐに\n検索・確認" },
            { icon: "✅", title: "電話注文の聞き間違い削減", desc: "聞き間違いや書き間違い\nによるミスを防止" },
            { icon: "⏱️", title: "発注業務の時短縮", desc: "受注処理にかかる\n時間を大幅に削減" },
            { icon: "👤", title: "人手不足対策", desc: "少人数でも効率的に\n受注業務を運用" },
            { icon: "🤝", title: "販売店とのやり取りを効率化", desc: "スムーズなコミュニケーションで\n信頼関係を強化" },
          ].map((m) => (
            <div key={m.title} className="bg-gray-50 rounded-xl p-5 text-center border border-gray-100">
              <div className="text-3xl mb-2">{m.icon}</div>
              <p className="font-bold text-sm text-gray-800 mb-1">{m.title}</p>
              <p className="text-xs text-gray-500 whitespace-pre-line">{m.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 料金・CTA */}
      <section className="bg-[#1e3a5f] text-white px-6 py-14 text-center">
        <div className="max-w-2xl mx-auto">
          <div className="inline-block bg-amber-400 text-[#1e3a5f] font-black rounded-full px-6 py-2 text-sm mb-6">
            酒蔵様限定　完全無料
          </div>
          <div className="flex justify-center gap-10 mb-4">
            <div>
              <p className="text-sm opacity-70 mb-1">初期費用</p>
              <p className="text-5xl font-black">¥0</p>
            </div>
            <div>
              <p className="text-sm opacity-70 mb-1">月額費用</p>
              <p className="text-5xl font-black">¥0</p>
            </div>
          </div>
          <p className="text-sm opacity-70 mb-8">まずはお気軽にお試しください！</p>
          <p className="text-amber-400 font-bold text-lg mb-6">先着 30蔵限定　モニター募集中！</p>
          <Link href="/register"
            className="inline-block bg-amber-400 text-[#1e3a5f] font-black text-lg px-10 py-4 rounded-full shadow-lg hover:bg-amber-300 transition">
            今すぐ5分でカンタン登録！
          </Link>
        </div>
      </section>

      {/* フッター */}
      <footer className="bg-[#0f2340] text-white px-6 py-6 text-center text-xs space-y-1">
        <p className="font-bold text-base mb-2">OrderLink　オーダーリンク</p>
        <p>https://www.orderlink.jp</p>
        <p className="opacity-60 mt-3">お問い合わせ：support@orderlink.jp</p>
      </footer>

    </div>
  );
}
