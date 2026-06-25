import Link from "next/link";
import { Printer, Phone, FolderOpen, Smartphone, ClipboardList, ShieldCheck, Package } from "lucide-react";
import LandingHeaderActions from "@/components/LandingHeaderActions";

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
        <LandingHeaderActions />
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
        <p className="text-base opacity-60 mt-3">※初期費用・月額費用ともに0円でご利用いただけます。</p>
      </section>

      {/* お悩み3項目 */}
      <section className="bg-[#f5f6f9] px-6 py-8">
        <div className="max-w-3xl mx-auto border-2 border-[#1e3a5f] rounded-md overflow-hidden">
          <div className="py-3 text-center border-b border-[#1e3a5f]/20 bg-white">
            <p className="text-[#1e3a5f] font-bold text-sm tracking-wide">
              酒蔵の受発注業務、こんなお悩みありませんか？
            </p>
          </div>
          <div className="grid grid-cols-3 bg-white">
            {[
              {
                icon: <Printer size={48} strokeWidth={1.2} />,
                title: "FAX 整理が大変",
                desc: "注文書の管理や\n手入力に時間がかかる",
              },
              {
                icon: <Phone size={48} strokeWidth={1.2} />,
                title: "電話注文でミスが起きる",
                desc: "聞き間違いや\n書き間違いが発生する",
              },
              {
                icon: <FolderOpen size={48} strokeWidth={1.2} />,
                title: "注文履歴が探せない",
                desc: "過去の注文を\nすぐに確認できない",
              },
            ].map((item, i) => (
              <div
                key={i}
                className={`flex flex-col items-center text-center px-6 py-8 gap-3 ${i > 0 ? "border-l border-[#1e3a5f]/15" : ""}`}
              >
                <div className="text-[#1e3a5f] opacity-60 mb-1">{item.icon}</div>
                <p className="font-bold text-[#1e3a5f] text-base leading-snug">{item.title}</p>
                <p className="text-sm text-gray-500 whitespace-pre-line leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 酒蔵専用受発注システム */}
      <section className="bg-white px-6 pt-10 pb-8">
        <div className="max-w-3xl mx-auto flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1">
            <p className="text-[#1e3a5f] font-bold text-sm mb-2">酒蔵の受発注を一元管理！</p>
            <h2 className="text-[#1e3a5f] font-black leading-tight" style={{ fontSize: "2.4rem", letterSpacing: "0.15em" }}>
              酒蔵専用
            </h2>
            <h2 className="text-[#1e3a5f] font-black leading-tight mb-4" style={{ fontSize: "2.4rem", letterSpacing: "0.1em" }}>
              受発注システム
            </h2>
            <div className="border-t border-b border-[#1e3a5f]/30 py-2 mb-1">
              <p className="text-center text-xl font-black text-[#1e3a5f] tracking-widest">OrderLink</p>
            </div>
            <p className="text-center text-xs text-gray-400 tracking-widest">オーダーリンク</p>
          </div>

          {/* デバイスモックアップ */}
          <div className="flex-1 relative flex items-end justify-center" style={{ minHeight: "220px" }}>
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

      {/* メリット4項目 */}
      <section className="bg-[#f5f6f9] px-6 py-8">
        <div className="max-w-3xl mx-auto border-2 border-[#1e3a5f] rounded-md overflow-hidden bg-white">
          <div className="py-3 text-center border-b border-[#1e3a5f]/20">
            <p className="text-[#1e3a5f] font-bold text-sm">OrderLink導入のメリット</p>
          </div>
          <div className="grid grid-cols-4">
            {[
              {
                icon: <Smartphone size={36} strokeWidth={1.3} />,
                num: "①",
                title: "FAX不要で\n簡単発注",
                items: ["スマホ・PCで24時間注文", "FAX・電話不要", "いつでも簡単に発注"],
              },
              {
                icon: <ClipboardList size={36} strokeWidth={1.3} />,
                num: "②",
                title: "注文を\n一元管理",
                items: ["注文履歴をまとめて確認", "過去の注文もすぐ検索", "商品・数量も一目でわかる"],
              },
              {
                icon: <ShieldCheck size={36} strokeWidth={1.3} />,
                num: "③",
                title: "発注ミス・\n漏れを防止",
                items: ["入力ミスや聞き間違い防止", "注文漏れを防ぐ", "欠品リスクを軽減"],
              },
              {
                icon: <Package size={36} strokeWidth={1.3} />,
                num: "④",
                title: "商品情報を\nいつでも確認",
                items: ["商品一覧・価格表を常に最新で閲覧", "新商品情報もすぐ確認"],
              },
            ].map((m, i) => (
              <div
                key={i}
                className={`flex flex-col items-center text-center px-4 py-7 gap-3 ${i > 0 ? "border-l border-[#1e3a5f]/15" : ""}`}
              >
                <div className="text-[#1e3a5f] opacity-70 mb-1">{m.icon}</div>
                <p className="font-black text-[#1e3a5f] text-sm leading-snug whitespace-pre-line">
                  {m.num} {m.title}
                </p>
                <ul className="text-left space-y-1 mt-1">
                  {m.items.map((item, j) => (
                    <li key={j} className="text-xs text-gray-600 leading-snug flex items-start gap-0.5">
                      <span className="flex-shrink-0">・</span><span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-white py-8 flex flex-col items-center gap-5">
        <div className="flex flex-row items-center gap-6">
          <div className="w-28 h-28 rounded-full border-4 border-amber-500 bg-amber-50 flex flex-col items-center justify-center shadow-md flex-shrink-0">
            <p className="text-[#1e3a5f] font-black text-xl leading-none">完全</p>
            <p className="text-[#1e3a5f] font-black text-xl leading-none">無料</p>
          </div>
          <div>
            <p className="text-[#1e3a5f] font-black text-xl">
              初期費用 <span className="text-4xl">0</span>円　月額費用 <span className="text-4xl">0</span>円
            </p>
            <p className="text-amber-600 font-bold text-base mt-1">まずはお気軽にお試しください！</p>
          </div>
        </div>
        <Link href="/register"
          className="inline-block bg-amber-400 text-[#1e3a5f] font-black text-base px-8 py-3 rounded-full shadow hover:bg-amber-300 transition">
          今すぐ5分でカンタン登録！
        </Link>
      </section>

      {/* フッター */}
      <footer className="bg-[#0f2340] text-white px-6 py-8 text-center text-xs space-y-4">
        <p className="font-bold text-base">OrderLink</p>
        <Link href="/contact"
          className="inline-block border border-white/50 text-white/80 text-sm px-6 py-2 rounded-full hover:bg-white hover:text-[#0f2340] transition">
          お問い合わせ
        </Link>
      </footer>

    </div>
  );
}
