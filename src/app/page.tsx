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

      {/* 解決策セクション */}
      <section className="bg-white px-6 pb-12">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1">
            <p className="text-[#1e3a5f] font-bold text-sm mb-2">酒蔵の受発注を一元管理！</p>
            <h2 className="text-4xl font-black text-[#1e3a5f] leading-tight tracking-wider mb-1">
              酒 蔵 専 用
            </h2>
            <h2 className="text-4xl font-black text-[#1e3a5f] leading-tight tracking-wider mb-4">
              受 発 注 シ ス テ ム
            </h2>
            <div className="border-t border-b border-[#1e3a5f]/30 py-2 mb-1">
              <p className="text-center text-xl font-black text-[#1e3a5f] tracking-widest">OrderLink</p>
            </div>
            <p className="text-center text-xs text-gray-400 tracking-widest">オーダーリンク</p>
          </div>
          {/* デバイスモックアップ */}
          <div className="flex-1 relative flex items-end justify-center" style={{ minHeight: "220px" }}>
            {/* PCフレーム */}
            <div className="w-full max-w-xs bg-gray-800 rounded-t-xl rounded-b-md shadow-xl border border-gray-700">
              <div className="bg-gray-700 px-3 py-1.5 rounded-t-xl flex gap-1.5 items-center">
                <span className="w-2 h-2 rounded-full bg-red-400"></span>
                <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
                <span className="w-2 h-2 rounded-full bg-green-400"></span>
                <span className="text-[10px] text-gray-400 ml-1">orderlink.jp</span>
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/manual/orders.png" alt="OrderLink受注管理" className="w-full object-cover object-top rounded-b-md" style={{ maxHeight: "180px" }} />
            </div>
            {/* スマホフレーム */}
            <div className="absolute -bottom-2 -right-2 w-20 bg-gray-900 rounded-2xl shadow-2xl border-2 border-gray-700 overflow-hidden">
              <div className="bg-gray-800 h-2 flex items-center justify-center">
                <span className="w-6 h-0.5 rounded-full bg-gray-600"></span>
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/manual/orders.png" alt="OrderLinkモバイル" className="w-full object-cover object-top" style={{ height: "110px" }} />
              <div className="bg-gray-800 h-3 flex items-center justify-center">
                <span className="w-4 h-4 rounded-full border border-gray-600"></span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* メリットセクション */}
      <section className="bg-white px-6 pb-14">
        <div className="max-w-4xl mx-auto border-2 border-[#1e3a5f] rounded-2xl overflow-hidden">
          <div className="bg-white border-b border-[#1e3a5f]/20 text-center py-3">
            <p className="font-bold text-[#1e3a5f] text-base">OrderLink導入のメリット</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#1e3a5f]/20">
            {[
              {
                num: "❶", icon: "📱", title: "FAX不要で\n簡単発注",
                items: ["スマホ・PCで\n24時間注文", "FAX・電話不要"],
              },
              {
                num: "❷", icon: "📋", title: "注文を\n一元管理",
                items: ["履歴をすぐ検索", "商品・数量も\n一目でわかる"],
              },
              {
                num: "❸", icon: "🛡️", title: "発注ミス\n防止",
                items: ["聞き間違い防止", "発注漏れ・欠品\nリスクを軽減"],
              },
              {
                num: "❹", icon: "📦", title: "商品情報を\nいつでも確認",
                items: ["最新の商品一覧", "価格表・新商品\nをすぐ確認"],
              },
            ].map((m) => (
              <div key={m.num} className="flex flex-col items-center text-center px-4 py-8 gap-3">
                <div className="text-5xl mb-1">{m.icon}</div>
                <p className="font-black text-[#1e3a5f] text-base leading-snug whitespace-pre-line">
                  <span>{m.num} </span>{m.title}
                </p>
                <ul className="mt-1 space-y-1.5 text-left w-full px-2">
                  {m.items.map((item) => (
                    <li key={item} className="flex items-start gap-1 text-sm text-gray-600 whitespace-pre-line">
                      <span className="flex-shrink-0 mt-0.5">・</span>
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
      <footer className="bg-[#0f2340] text-white px-6 py-8 text-center text-xs space-y-2">
        <p className="font-bold text-base mb-3">OrderLink　オーダーリンク</p>
        <p>https://www.orderlink.jp</p>
        <div className="flex justify-center gap-6 mt-3 opacity-70">
          <Link href="/terms" className="hover:opacity-100 hover:underline">利用規約</Link>
          <Link href="/privacy" className="hover:opacity-100 hover:underline">プライバシーポリシー</Link>
          <Link href="/contact" className="hover:opacity-100 hover:underline">お問い合わせ</Link>
        </div>
      </footer>

    </div>
  );
}
