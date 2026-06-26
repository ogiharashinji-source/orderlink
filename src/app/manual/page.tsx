"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import ManualHeader from "@/components/ManualHeader";

const STEPS = [
  {
    id: "step1",
    num: 1,
    title: "酒蔵アカウント登録",
    icon: "🏯",
    summary: "まず酒蔵アカウントを作成します",
    body: [
      "OrderLinkをご利用いただくために、まず酒蔵アカウントを作成します。",
      "会社名・住所・電話番号・メールアドレス・ID・パスワードを入力し、「登録する」ボタンを押してください。",
      "登録完了後、管理画面へログインできるようになります。",
    ],
    image: "/manual/step1.png",
    imageAlt: "酒蔵アカウント登録画面",
    highlights: ["「登録する」ボタンを押して完了"],
  },
  {
    id: "step2",
    num: 2,
    title: "販売店（顧客）登録",
    icon: "🏪",
    summary: "お取引先の販売店を登録します",
    body: [
      "「顧客」メニューから、お取引のある販売店を登録します。",
      "QRコードや招待リンクを販売店へ共有し、販売店自身に登録していただきます。",
      "登録された販売店を承認すると、OrderLink上で受発注ができるようになります。",
    ],
    image: "/manual/step2-v2.png",
    imageAlt: "顧客管理画面",
    highlights: ["QRコードボタン：販売店へ招待リンクを共有", "承認：販売店を有効化します"],
  },
  {
    id: "step3",
    num: 3,
    title: "商品登録",
    icon: "🍶",
    summary: "販売する商品を登録します",
    body: [
      "「商品」メニューから、販売する商品を登録します。",
      "商品名・種別・酒米・容量・小売値・卸値・ロット・在庫数などを入力してください。",
      "公開状態を「公開中」にすると、販売店側に商品が表示されます。",
    ],
    image: "/manual/step3-v2.png",
    imageAlt: "商品管理画面",
    highlights: ["新規登録ボタン：商品を追加", "編集ボタン：登録済み商品を修正", "公開中 / 非公開：販売店への表示を切り替え"],
  },
  {
    id: "step4",
    num: 4,
    title: "販売店へのご案内（メール送信）",
    icon: "✉️",
    summary: "商品案内や資料を販売店へ送ります",
    body: [
      "「メール送信」メニューから、販売店へ商品の案内や資料を送信できます。",
      "送信先・件名・メッセージを入力し、必要に応じてPDF資料を添付して送信してください。",
      "新商品のご案内、価格表、資料送付などに活用できます。",
    ],
    image: "/manual/step4.png",
    imageAlt: "メール送信画面",
    highlights: ["送信先：販売店を選択", "件名・メッセージ：自由に入力可能", "添付ファイル：PDFを添付できます", "「送信する」ボタンで即時送信"],
  },
  {
    id: "step5",
    num: 5,
    title: "リクエスト確認",
    icon: "📋",
    summary: "販売店からの注文希望を確認します",
    body: [
      "販売店から商品購入の希望が届くと、「リクエスト」メニューに表示されます。",
      "商品内容・希望ケース数・価格などを確認し、販売可能な場合は「確認」ボタンから受注を確定してください。",
    ],
    image: "/manual/step5-v2.png",
    imageAlt: "リクエスト一覧画面",
    highlights: ["希望ケース数：販売店が希望する数量", "「確認」ボタン：受注を確定します"],
  },
  {
    id: "step6",
    num: 6,
    title: "受注管理",
    icon: "📦",
    summary: "確定した受注を一覧で管理します",
    body: [
      "確定した受注は「受注」メニューに一覧表示されます。",
      "受注日・販売店名・商品・販売数・備考などを確認できます。",
      "検索機能やCSV出力を使うことで、出荷準備や受注管理をスムーズに行えます。",
    ],
    image: "/manual/step6-v2.png",
    imageAlt: "受注管理画面",
    highlights: ["検索：会社名・商品名で絞り込み", "CSV出力：Excelで受注データを活用", "詳細ボタン：受注の詳細を確認", "販売数：確定したケース数"],
  },
];

export default function ManualPage() {
  const [activeStep, setActiveStep] = useState("step1");
  const [modalImg, setModalImg] = useState<string | null>(null);
  const [showTop, setShowTop] = useState(false);
  const stepRefs = useRef<Record<string, HTMLElement | null>>({});

  const setRef = useCallback((id: string) => (el: HTMLElement | null) => {
    stepRefs.current[id] = el;
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActiveStep(e.target.id);
        });
      },
      { rootMargin: "-30% 0px -60% 0px" }
    );
    Object.values(stepRefs.current).forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 400);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (id: string) => {
    stepRefs.current[id]?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <ManualHeader />

      {/* タイトル・説明 */}
      <div className="px-6 py-8 max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-xl font-bold text-gray-900">ご利用ガイド</span>
          <span className="bg-amber-400 text-[#1e3a5f] text-xs font-black px-3 py-1 rounded-full">酒蔵様向け</span>
        </div>
        <p className="text-gray-600 text-sm max-w-2xl">
          OrderLinkは、酒蔵と販売店の受発注をスムーズにするクラウドサービスです。
          このガイドでは、酒蔵アカウント登録から販売店登録、商品登録、リクエスト確認、受注管理までの基本操作をご説明します。
        </p>
      </div>

      <div className="max-w-5xl mx-auto px-4 pb-10">
        <main className="space-y-10">
          {STEPS.map((s) => (
            <section
              key={s.id}
              id={s.id}
              ref={setRef(s.id)}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden scroll-mt-6 print:break-inside-avoid print:border print:shadow-none"
            >
              <div className="bg-[#1e3a5f] px-6 py-4 flex items-center gap-3">
                <span className="bg-amber-400 text-[#1e3a5f] font-black text-lg w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0">
                  {s.num}
                </span>
                <div>
                  <h2 className="text-white font-black text-lg leading-tight">{s.title}</h2>
                  <p className="text-white/60 text-xs mt-0.5">{s.summary}</p>
                </div>
                <span className="ml-auto text-2xl">{s.icon}</span>
              </div>

              {[1, 4].includes(s.num) ? (
                <div className="p-6 flex flex-col md:flex-row gap-6">
                  <div className="md:w-1/3 space-y-3">
                    {s.body.map((p, i) => (
                      <p key={i} className="text-sm text-gray-700 leading-relaxed">{p}</p>
                    ))}
                    <div className="mt-4 space-y-2">
                      {s.highlights.map((h, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs text-gray-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                          <span className="text-amber-500 font-bold mt-0.5 flex-shrink-0">▶</span>
                          <span>{h}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="md:w-2/3">
                    <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm cursor-pointer hover:shadow-md transition-shadow" onClick={() => setModalImg(s.image)}>
                      <div className="bg-gray-100 px-3 py-1.5 flex items-center gap-1.5 border-b border-gray-200">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-400"></span>
                        <span className="w-2.5 h-2.5 rounded-full bg-yellow-400"></span>
                        <span className="w-2.5 h-2.5 rounded-full bg-green-400"></span>
                        <span className="text-[10px] text-gray-400 ml-2">orderlink.jp</span>
                        <span className="ml-auto text-[10px] text-gray-400">クリックで拡大</span>
                      </div>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={s.image} alt={s.imageAlt} className="w-full object-cover object-top bg-gray-50" style={{ minHeight: "180px" }} />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-6 space-y-4">
                  <div className="flex flex-wrap gap-4">
                    <div className="flex-1 min-w-[200px] space-y-2">
                      {s.body.map((p, i) => (
                        <p key={i} className="text-sm text-gray-700 leading-relaxed">{p}</p>
                      ))}
                    </div>
                    <div className="w-full md:w-1/3 space-y-2">
                      {s.highlights.map((h, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs text-gray-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                          <span className="text-amber-500 font-bold mt-0.5 flex-shrink-0">▶</span>
                          <span>{h}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="w-full">
                    <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm cursor-pointer hover:shadow-md transition-shadow" onClick={() => setModalImg(s.image)}>
                      <div className="bg-gray-100 px-3 py-1.5 flex items-center gap-1.5 border-b border-gray-200">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-400"></span>
                        <span className="w-2.5 h-2.5 rounded-full bg-yellow-400"></span>
                        <span className="w-2.5 h-2.5 rounded-full bg-green-400"></span>
                        <span className="text-[10px] text-gray-400 ml-2">orderlink.jp</span>
                        <span className="ml-auto text-[10px] text-gray-400">クリックで拡大</span>
                      </div>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={s.image} alt={s.imageAlt} className="w-full object-contain bg-gray-50" />
                    </div>
                  </div>
                </div>
              )}
            </section>
          ))}
        </main>
      </div>

      {/* フッター */}
      <footer className="border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 py-4 text-xs text-gray-400 text-center">
          <span>© {new Date().getFullYear()} OrderLink</span>
        </div>
      </footer>

      {/* 画像モーダル */}
      {modalImg && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setModalImg(null)}>
          <div className="relative max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={modalImg} alt="拡大表示" className="w-full rounded-xl shadow-2xl" />
            <button onClick={() => setModalImg(null)} className="absolute -top-4 -right-4 bg-white text-gray-700 rounded-full w-9 h-9 flex items-center justify-center font-bold shadow-lg hover:bg-gray-100 text-lg">
              ✕
            </button>
          </div>
        </div>
      )}

      {showTop && (
        <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="fixed bottom-6 right-6 bg-[#1e3a5f] text-white w-11 h-11 rounded-full shadow-lg flex items-center justify-center hover:bg-[#2d5a8e] transition" aria-label="ページトップへ">
          ↑
        </button>
      )}
    </div>
  );
}
