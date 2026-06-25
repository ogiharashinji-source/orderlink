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
        <h2 className="text-center text-2xl font-black text-gray-900 mb-10">OrderLink導入のメリット</h2>
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              num: "①", title: "FAX不要で発注が簡単",
              items: ["FAX送信・電話確認が不要", "スマホやPCからすぐ発注", "24時間いつでも注文可能"],
            },
            {
              num: "②", title: "注文を一元管理",
              items: ["注文履歴をまとめて確認", "過去の発注内容もすぐ検索", "どの商品をいつ注文したか一目でわかる"],
            },
            {
              num: "③", title: "発注ミス・漏れを防止",
              items: ["FAX未送信やメール送信忘れを防ぐ", "注文内容の見間違いがなくなる", "発注漏れによる欠品リスクを軽減"],
            },
            {
              num: "④", title: "商品情報をいつでも確認",
              items: ["商品一覧や価格表を常に最新状態で閲覧", "カタログを探す手間が不要", "新商品情報もすぐ確認できる"],
            },
            {
              num: "⑤", title: "売上アップにつながる",
              items: ["発注作業の負担を削減", "注文しやすくなり機会損失を防ぐ", "欠品防止で販売チャンスを逃さない"],
            },
          ].map((m) => (
            <div key={m.num} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-amber-500 font-black text-lg">{m.num}</span>
                <h3 className="font-black text-gray-900 text-base">{m.title}</h3>
              </div>
              <ul className="space-y-1.5">
                {m.items.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-gray-600">
                    <span className="text-amber-400 font-bold mt-0.5 flex-shrink-0">▶</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
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
