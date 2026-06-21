"use client";
import { useState } from "react";

type Section = { title: string; steps: string[]; note?: string };

const adminSections: Section[] = [
  {
    title: "1. ログイン",
    steps: ["ブラウザでOrderLinkのURLにアクセスします。", "ログインIDとパスワードを入力し「ログイン」を押します。"],
  },
  {
    title: "2. 商品管理",
    steps: ["上部メニュー「商品管理」→「+ 新規商品」で登録します。", "商品名・種別・酒米・価格（小売値・卸売値）・ロット数などを入力します。", "在庫数を設定すると発注画面で上限として機能します。"],
    note: "卸売値が未入力の場合、合計金額から除外されます。",
  },
  {
    title: "3. 顧客管理（販売店の登録・招待）",
    steps: ["「顧客管理」→「+ 新規顧客」で販売店を登録します。", "「招待メールを送信」タブからメールアドレスを入力して招待を送ります。", "販売店が登録後、「承認」ボタンを押すとポータルが利用可能になります。"],
    note: "招待リンクの有効期限は24時間です。",
  },
  {
    title: "4. 受注管理",
    steps: ["「受注管理」で注文一覧を確認・検索できます。", "「+ 新規登録」から管理者が直接注文を登録できます。", "「リクエスト」メニューでポータルからの発注依頼を確定・却下できます。"],
  },
  {
    title: "5. メール送信（発注書）",
    steps: ["「メール送信」→送信先（全体/個別）を選択します。", "タイトル・メッセージ・有効期限を入力して「送信する」を押します。", "販売店にメールが届き、URLから発注できます。"],
    note: "未承認の顧客にはメールが送信されません。",
  },
  {
    title: "6. CSV出力",
    steps: ["各管理画面右上の「CSV出力」でデータをダウンロードできます。", "顧客・商品・受注データに対応しています。"],
  },
];

const portalSections: Section[] = [
  {
    title: "1. アカウント登録",
    steps: ["酒蔵から届いた招待メールのリンクをクリックします。", "会社名・住所・電話番号・メールアドレス・ログインID・パスワードを入力します。", "「登録する」を押すと登録完了です。酒蔵側の承認後に利用できます。"],
    note: "招待リンクの有効期限は24時間です。期限切れの場合は酒蔵に再送信を依頼してください。",
  },
  {
    title: "2. ログイン・ログアウト",
    steps: ["ポータルのURLにアクセスし、ログインIDとパスワードを入力します。", "画面右上の「ログアウト」ボタンでログアウトできます。"],
  },
  {
    title: "3. 発注依頼",
    steps: ["酒蔵からのメール内URLをクリック、またはポータルの「発注依頼」から注文画面を開きます。", "注文したい商品のケース数を入力します。", "備考・納品希望日があれば備考欄に入力し「発注依頼を送信する」を押します。"],
    note: "在庫数が設定されている商品はその数量を超えて入力できません。",
  },
  {
    title: "4. 発注履歴の確認",
    steps: ["「発注管理」で過去の注文履歴を確認できます。", "「詳細」ボタンで注文内容・金額の詳細を確認できます。"],
  },
  {
    title: "5. プロフィール変更",
    steps: ["右上の会社名をクリックしてプロフィール画面を開きます。", "会社情報やパスワードを変更できます。"],
  },
];

export default function ManualModal({ type }: { type: "admin" | "portal" }) {
  const [open, setOpen] = useState(false);
  const sections = type === "admin" ? adminSections : portalSections;
  const title = type === "admin" ? "管理者向け操作マニュアル" : "ポータル会員向け操作マニュアル";

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="text-sm text-slate-400 hover:text-slate-600">
        操作マニュアル
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setOpen(false)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="text-lg font-bold text-gray-900">{title}</h2>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
            </div>
            <div className="overflow-y-auto p-6 space-y-6">
              {sections.map((sec) => (
                <div key={sec.title} className="space-y-2">
                  <h3 className="font-bold text-gray-800 text-sm border-b pb-1">{sec.title}</h3>
                  <ol className="space-y-1">
                    {sec.steps.map((step, i) => (
                      <li key={i} className="flex gap-2 text-sm text-gray-700">
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-slate-700 text-white text-xs font-bold flex items-center justify-center mt-0.5">{i + 1}</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                  {sec.note && (
                    <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-3 py-1.5">{sec.note}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
