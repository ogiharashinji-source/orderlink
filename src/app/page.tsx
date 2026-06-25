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
        <p className="text-2xl font-bold opacity-90 mt-4 mb-10">販売店からの注文を、もっと簡単に。</p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/manual"
            className="inline-block border-2 border-white text-white font-bold text-base px-8 py-4 rounded-full hover:bg-white hover:text-[#1e3a5f] transition">
            📖 ご利用ガイドを見る
          </Link>
          <Link href="/register"
            className="inline-block bg-amber-400 text-[#1e3a5f] font-black text-lg px-10 py-4 rounded-full shadow-lg hover:bg-amber-300 transition">
            今すぐ無料で始める →
          </Link>
        </div>
        <p className="text-xs opacity-60 mt-3">※初期費用・月額費用ともに0円でご利用いただけます。</p>
      </section>

      {/* メリットセクション */}
      <section className="bg-white px-6 py-16">
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-xs font-bold tracking-widest text-amber-500 mb-2">— WHY ORDERLINK —</p>
          <h2 className="text-center text-2xl font-black text-[#1e3a5f] mb-12">OrderLink導入のメリット</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              {
                num: "01", icon: "🛒", title: "FAX不要で\n簡単発注",
                items: ["スマホ・PCからいつでも発注", "24時間注文受付", "FAX・電話不要"],
                color: "from-blue-50 to-indigo-50",
                border: "border-blue-100",
              },
              {
                num: "02", icon: "📋", title: "注文を\n一元管理",
                items: ["履歴をすぐ検索", "商品・数量を一目確認", "過去の発注もすぐわかる"],
                color: "from-amber-50 to-yellow-50",
                border: "border-amber-100",
              },
              {
                num: "03", icon: "🛡️", title: "発注ミス\n防止",
                items: ["聞き間違いゼロ", "見間違いを防止", "欠品リスクを軽減"],
                color: "from-green-50 to-emerald-50",
                border: "border-green-100",
              },
              {
                num: "04", icon: "📦", title: "商品情報を\nいつでも確認",
                items: ["最新商品一覧を閲覧", "価格表もすぐ確認", "新商品情報をリアルタイム共有"],
                color: "from-purple-50 to-violet-50",
                border: "border-purple-100",
              },
              {
                num: "05", icon: "📈", title: "売上アップ\nにつながる",
                items: ["発注作業の負担削減", "機会損失を防ぐ", "欠品防止で販売チャンス確保"],
                color: "from-rose-50 to-pink-50",
                border: "border-rose-100",
              },
            ].map((m) => (
              <div key={m.num} className={`bg-gradient-to-b ${m.color} border ${m.border} rounded-2xl p-5 flex flex-col gap-3`}>
                <div className="flex items-center justify-between">
                  <span className="text-3xl">{m.icon}</span>
                  <span className="text-xs font-black text-gray-300 tracking-widest">{m.num}</span>
                </div>
                <h3 className="font-black text-[#1e3a5f] text-sm leading-snug whitespace-pre-line">{m.title}</h3>
                <ul className="space-y-1.5 mt-auto">
                  {m.items.map((item) => (
                    <li key={item} className="flex items-start gap-1.5 text-xs text-gray-600">
                      <span className="text-amber-400 font-black flex-shrink-0 mt-0.5">▶</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 料金・CTA */}
      <section className="bg-[#1e3a5f] text-white px-6 py-14 text-center">
        <div className="max-w-2xl mx-auto">
          <div className="inline-block bg-amber-400 text-[#1e3a5f] font-black rounded-full px-6 py-2 text-sm mb-6">
            完全無料
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
