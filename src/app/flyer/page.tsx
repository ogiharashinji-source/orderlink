import { Printer, Phone, FolderOpen, Smartphone, ClipboardList, ShieldCheck, Package, TrendingUp } from "lucide-react";
import Link from "next/link";

export const metadata = { title: "OrderLink - 販売店からの注文を、もっと簡単に。" };

export default function FlyerPage() {
  return (
    <div className="bg-white font-sans" style={{ fontFamily: "'Noto Sans JP', sans-serif" }}>
      <div className="max-w-2xl mx-auto border border-gray-200 shadow-sm">

        {/* ① ヘッダー */}
        <div className="bg-[#1e3a5f] px-5 py-4 flex items-center gap-3">
          <span className="text-white text-3xl leading-none">🍶</span>
          <p className="text-white text-xl md:text-2xl font-bold leading-snug">
            販売店からの注文を、<span className="text-amber-400">もっと簡単に。</span>
          </p>
        </div>

        {/* ② お悩み3項目 */}
        <div className="bg-[#f5f6f9] px-4 py-4">
          <div className="border-2 border-[#1e3a5f] rounded-md overflow-hidden">
            <div className="py-2 text-center border-b border-[#1e3a5f]/20 bg-white">
              <p className="text-[#1e3a5f] font-bold text-sm tracking-wide">
                酒蔵の受発注業務、こんなお悩みありませんか？
              </p>
            </div>
            <div className="grid grid-cols-3 bg-white">
              {[
                {
                  icon: <Printer size={44} strokeWidth={1.2} />,
                  title: "FAX 整理が大変",
                  desc: "注文書の管理や\n手入力に時間がかかる",
                },
                {
                  icon: <Phone size={44} strokeWidth={1.2} />,
                  title: "電話注文でミスが起きる",
                  desc: "聞き間違いや\n書き間違いが発生する",
                },
                {
                  icon: <FolderOpen size={44} strokeWidth={1.2} />,
                  title: "注文履歴が探せない",
                  desc: "過去の注文を\nすぐに確認できない",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className={`flex flex-col items-center text-center px-3 py-5 gap-2 ${i > 0 ? "border-l border-[#1e3a5f]/15" : ""}`}
                >
                  <div className="text-[#1e3a5f] opacity-60 mb-1">{item.icon}</div>
                  <p className="font-bold text-[#1e3a5f] text-sm leading-snug">{item.title}</p>
                  <p className="text-xs text-gray-500 whitespace-pre-line leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ③ 中央メイン */}
        <div className="bg-white px-5 py-5 flex flex-col md:flex-row items-center gap-4">
          {/* 左：テキスト */}
          <div className="flex-1">
            <p className="text-[#1e3a5f] font-bold text-sm mb-1">酒蔵の受発注を一元管理！</p>
            <h2 className="text-[#1e3a5f] font-black leading-tight" style={{ fontSize: "2.2rem", letterSpacing: "0.15em" }}>
              酒蔵専用
            </h2>
            <h2 className="text-[#1e3a5f] font-black leading-tight mb-3" style={{ fontSize: "2.2rem", letterSpacing: "0.1em" }}>
              受発注システム
            </h2>
            <div className="border-t border-b border-[#1e3a5f]/30 py-1.5 mb-1 text-center">
              <p className="text-[#1e3a5f] font-black text-lg tracking-widest">OrderLink</p>
            </div>
            <p className="text-center text-[10px] text-gray-400 tracking-widest">オーダーリンク</p>
          </div>

          {/* 右：デバイスモックアップ */}
          <div className="flex-1 relative flex items-end justify-center" style={{ minHeight: "180px" }}>
            {/* PCフレーム */}
            <div className="w-full max-w-[240px] bg-gray-800 rounded-t-lg rounded-b-sm shadow-lg border border-gray-600">
              <div className="bg-gray-700 px-2 py-1 rounded-t-lg flex gap-1 items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-yellow-400"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
                <span className="text-[9px] text-gray-400 ml-1">orderlink.jp</span>
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/manual/orders.png" alt="PC画面" className="w-full object-cover object-top" style={{ maxHeight: "140px" }} />
            </div>
            {/* スマホフレーム */}
            <div className="absolute bottom-0 -right-1 w-16 bg-gray-900 rounded-xl shadow-xl border-2 border-gray-700 overflow-hidden">
              <div className="bg-gray-800 h-2 flex items-center justify-center">
                <span className="w-5 h-0.5 bg-gray-600 rounded-full"></span>
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/manual/orders.png" alt="スマホ画面" className="w-full object-cover object-top" style={{ height: "90px" }} />
              <div className="bg-gray-800 h-3 flex items-center justify-center">
                <span className="w-3 h-3 rounded-full border border-gray-600"></span>
              </div>
            </div>
          </div>
        </div>

        {/* ④ メリット5カラム */}
        <div className="bg-[#f5f6f9] px-4 py-4">
          <div className="border-2 border-[#1e3a5f] rounded-md overflow-hidden bg-white">
            <div className="py-2 text-center border-b border-[#1e3a5f]/20">
              <p className="text-[#1e3a5f] font-bold text-sm">OrderLink導入のメリット</p>
            </div>
            <div className="grid grid-cols-5">
              {[
                {
                  icon: <Smartphone size={32} strokeWidth={1.3} />,
                  num: "①",
                  title: "FAX不要で\n簡単発注",
                  items: ["スマホ・PCで24時間注文", "FAX・電話不要", "いつでも簡単に発注"],
                },
                {
                  icon: <ClipboardList size={32} strokeWidth={1.3} />,
                  num: "②",
                  title: "注文を\n一元管理",
                  items: ["注文履歴をまとめて確認", "過去の注文もすぐ検索", "商品・数量も\n一目でわかる"],
                },
                {
                  icon: <ShieldCheck size={32} strokeWidth={1.3} />,
                  num: "③",
                  title: "発注ミス・\n漏れを防止",
                  items: ["入力ミスや聞き間違い防止", "注文漏れを防ぐ", "欠品リスクを軽減"],
                },
                {
                  icon: <Package size={32} strokeWidth={1.3} />,
                  num: "④",
                  title: "商品情報を\nいつでも確認",
                  items: ["商品一覧・価格表を\n常に最新で閲覧", "新商品情報もすぐ確認"],
                },
                {
                  icon: <TrendingUp size={32} strokeWidth={1.3} />,
                  num: "⑤",
                  title: "売上アップに\nつながる",
                  items: ["発注作業の負担を削減", "欠品防止で\n販売機会を逃さない"],
                },
              ].map((m, i) => (
                <div
                  key={i}
                  className={`flex flex-col items-center text-center px-1.5 py-4 gap-1.5 ${i > 0 ? "border-l border-[#1e3a5f]/15" : ""}`}
                >
                  <div className="text-[#1e3a5f] opacity-70 mb-0.5">{m.icon}</div>
                  <p className="font-black text-[#1e3a5f] text-[11px] leading-snug whitespace-pre-line">
                    {m.num} {m.title}
                  </p>
                  <ul className="text-left space-y-0.5 mt-0.5">
                    {m.items.map((item, j) => (
                      <li key={j} className="text-[10px] text-gray-600 whitespace-pre-line leading-tight flex items-start gap-0.5">
                        <span className="flex-shrink-0">・</span><span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ⑤ CTA下部 */}
        <div className="bg-white px-5 py-5 flex flex-col sm:flex-row items-center gap-5">
          {/* 完全無料バッジ */}
          <div className="flex-shrink-0 relative w-24 h-24 flex items-center justify-center">
            <div className="w-24 h-24 rounded-full border-4 border-amber-500 bg-amber-50 flex flex-col items-center justify-center shadow-md">
              <p className="text-[#1e3a5f] font-black text-lg leading-none">完全</p>
              <p className="text-[#1e3a5f] font-black text-lg leading-none">無料</p>
              <p className="text-[10px] text-gray-500 mt-0.5">※</p>
            </div>
          </div>

          {/* 中央：料金 */}
          <div className="flex-1 text-center sm:text-left">
            <p className="text-[#1e3a5f] font-black text-lg">
              初期費用 <span className="text-3xl">0</span>円　月額費用 <span className="text-3xl">0</span>円
            </p>
            <p className="text-amber-600 font-bold text-base mt-1">まずはお気軽にお試しください！</p>
          </div>

          {/* 右：登録ボックス */}
          <div className="flex-shrink-0 border-2 border-[#1e3a5f] rounded-md px-4 py-3 text-center w-44">
            <p className="text-[#1e3a5f] font-bold text-xs mb-2">今すぐ5分でカンタン登録！</p>
            <p className="text-[#1e3a5f] font-black text-base tracking-widest">OrderLink</p>
            <p className="text-[9px] text-gray-400 tracking-widest mb-2">オーダーリンク</p>
            {/* QRコードプレースホルダー */}
            <div className="w-16 h-16 border border-gray-300 mx-auto mb-2 flex items-center justify-center bg-gray-50">
              <span className="text-[9px] text-gray-400 text-center leading-tight">QR<br/>コード</span>
            </div>
            <p className="text-[9px] text-gray-500">https://www.orderlink.jp</p>
          </div>
        </div>

      </div>
    </div>
  );
}
