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
      <section className="bg-gray-50 px-6 py-14">
        <h2 className="text-center text-xl font-black text-[#1e3a5f] mb-8">OrderLink導入のメリット</h2>
        <div className="max-w-5xl mx-auto border border-gray-200 rounded-2xl bg-white shadow-sm overflow-hidden">
          <div className="grid grid-cols-1 sm:grid-cols-5 divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
            {[
              {
                num: "①", icon: "🛒", title: "FAX不要で\n簡単発注",
                items: ["スマホ・PCで\n24時間注文", "FAX・電話不要"],
              },
              {
                num: "②", icon: "📋", title: "注文を\n一元管理",
                items: ["履歴をすぐ検索", "商品・数量も\n一目でわかる"],
              },
              {
                num: "③", icon: "🛡️", title: "発注ミス\n防止",
                items: ["聞き間違い防止", "発注漏れ・欠品\nリスクを軽減"],
              },
              {
                num: "④", icon: "📦", title: "商品情報を\nいつでも確認",
                items: ["最新の商品一覧", "価格表・新商品\nをすぐ確認"],
              },
              {
                num: "⑤", icon: "📈", title: "売上アップ\nにつながる",
                items: ["発注作業を削減", "欠品防止で販売\n機会を逃さない"],
              },
            ].map((m) => (
              <div key={m.num} className="flex flex-col items-center text-center px-4 py-6 gap-2">
                <div className="text-3xl mb-1">{m.icon}</div>
                <div className="text-amber-500 font-black text-sm">{m.num}</div>
                <h3 className="font-black text-[#1e3a5f] text-sm leading-snug whitespace-pre-line">{m.title}</h3>
                <ul className="mt-1 space-y-1 text-left w-full">
                  {m.items.map((item) => (
                    <li key={item} className="flex items-start gap-1 text-xs text-gray-600 whitespace-pre-line">
                      <span className="text-amber-400 font-bold flex-shrink-0 mt-0.5">・</span>
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
