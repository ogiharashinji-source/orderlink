import Link from "next/link";

export const metadata = { title: "管理者向け操作マニュアル | OrderLink" };

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="space-y-3">
    <h2 className="text-lg font-bold text-slate-800 border-b-2 border-slate-200 pb-1">{title}</h2>
    <div className="space-y-2 text-sm text-gray-700 leading-relaxed">{children}</div>
  </section>
);

const Step = ({ n, children }: { n: number; children: React.ReactNode }) => (
  <div className="flex gap-3">
    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-700 text-white text-xs font-bold flex items-center justify-center">{n}</span>
    <p>{children}</p>
  </div>
);

const Note = ({ children }: { children: React.ReactNode }) => (
  <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-2 text-sm text-amber-800">{children}</div>
);

export default function AdminGuidePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 print:bg-white print:py-4">
      <div className="max-w-3xl mx-auto space-y-10">

        {/* ヘッダー */}
        <div className="bg-slate-800 text-white rounded-xl p-8">
          <p className="text-slate-300 text-sm mb-1">OrderLink</p>
          <h1 className="text-3xl font-bold">管理者向け操作マニュアル</h1>
          <p className="text-slate-300 text-sm mt-2">酒蔵・メーカー担当者向け</p>
        </div>

        {/* 目次 */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="font-bold text-gray-800 mb-3">目次</h2>
          <ol className="list-decimal list-inside space-y-1 text-sm text-blue-600">
            <li><a href="#login" className="hover:underline">ログイン</a></li>
            <li><a href="#products" className="hover:underline">商品管理</a></li>
            <li><a href="#customers" className="hover:underline">顧客管理（販売店の登録・招待）</a></li>
            <li><a href="#orders" className="hover:underline">受注管理</a></li>
            <li><a href="#email" className="hover:underline">メール送信（発注書）</a></li>
            <li><a href="#csv" className="hover:underline">CSV出力</a></li>
            <li><a href="#settings" className="hover:underline">設定</a></li>
          </ol>
        </div>

        {/* 1. ログイン */}
        <div id="login" className="bg-white rounded-xl shadow p-6 space-y-4">
          <Section title="1. ログイン">
            <Step n={1}>ブラウザで OrderLink のURLにアクセスします。</Step>
            <Step n={2}>ログインID とパスワードを入力し「ログイン」ボタンを押します。</Step>
            <Step n={3}>ログインするとダッシュボード（リクエスト一覧）が表示されます。</Step>
            <Note>ログインIDとパスワードはアカウント登録時に設定したものです。</Note>
          </Section>
        </div>

        {/* 2. 商品管理 */}
        <div id="products" className="bg-white rounded-xl shadow p-6 space-y-4">
          <Section title="2. 商品管理">
            <p className="font-medium text-gray-800">商品の登録</p>
            <Step n={1}>上部メニューの「商品管理」をクリックします。</Step>
            <Step n={2}>「+ 新規商品」ボタンをクリックします。</Step>
            <Step n={3}>商品名・種別・酒米・精米歩合・アルコール度数・価格（小売値・卸売値）・ロット数などを入力します。</Step>
            <Step n={4}>「保存する」ボタンで登録完了です。</Step>
            <Note>卸売値を未入力にすると、発注書・受注一覧で「—」と表示され合計金額から除外されます。</Note>

            <p className="font-medium text-gray-800 mt-4">在庫数の管理</p>
            <p>商品編集画面で1800ml・720mlそれぞれの在庫数（限定数）を設定できます。設定すると発注画面で上限として機能します。</p>
          </Section>
        </div>

        {/* 3. 顧客管理 */}
        <div id="customers" className="bg-white rounded-xl shadow p-6 space-y-4">
          <Section title="3. 顧客管理（販売店の登録・招待）">
            <p className="font-medium text-gray-800">販売店の新規登録</p>
            <Step n={1}>上部メニューの「顧客管理」をクリックします。</Step>
            <Step n={2}>「+ 新規顧客」ボタンをクリックします。</Step>
            <Step n={3}>「顧客情報入力」タブで会社名・住所・電話番号などを入力し「登録する」をクリックします。</Step>

            <p className="font-medium text-gray-800 mt-4">ポータル招待メールの送信</p>
            <Step n={1}>「+ 新規顧客」→「招待メールを送信」タブを選択します。</Step>
            <Step n={2}>販売店のメールアドレスを入力し「招待メールを送信」ボタンを押します。</Step>
            <Step n={3}>販売店担当者にメールが届き、リンクからポータルアカウントを作成してもらいます。</Step>
            <Step n={4}>登録後、顧客管理画面で「承認」ボタンを押すとポータルが利用可能になります。</Step>
            <Note>招待リンクの有効期限は24時間です。期限切れの場合は再送信してください。</Note>
          </Section>
        </div>

        {/* 4. 受注管理 */}
        <div id="orders" className="bg-white rounded-xl shadow p-6 space-y-4">
          <Section title="4. 受注管理">
            <p className="font-medium text-gray-800">受注一覧の確認</p>
            <Step n={1}>上部メニューの「受注管理」をクリックします。</Step>
            <Step n={2}>月・検索キーワード（会社名・商品名）で絞り込みができます。</Step>
            <Step n={3}>「詳細」ボタンで個別の注文内容を確認できます。</Step>

            <p className="font-medium text-gray-800 mt-4">管理者による新規受注登録</p>
            <Step n={1}>受注管理画面右上の「+ 新規登録」ボタンをクリックします。</Step>
            <Step n={2}>顧客（販売店）を選択し、商品・数量を入力します。</Step>
            <Step n={3}>「販売登録する」ボタンで登録完了です。登録された注文はポータル会員の発注管理にも反映されます。</Step>

            <p className="font-medium text-gray-800 mt-4">ポータルからのリクエスト確認</p>
            <Step n={1}>上部メニューの「リクエスト」をクリックします（件数バッジが表示されます）。</Step>
            <Step n={2}>リクエスト内容を確認し「確定」または「在庫なし」を選択します。</Step>
          </Section>
        </div>

        {/* 5. メール送信 */}
        <div id="email" className="bg-white rounded-xl shadow p-6 space-y-4">
          <Section title="5. メール送信（発注書）">
            <Step n={1}>上部メニューの「メール送信」をクリックします。</Step>
            <Step n={2}>送信先を「全体」または「個別」から選択します。個別の場合は顧客をチェックボックスで選択します。</Step>
            <Step n={3}>発注書タイトル・メッセージ・有効期限を入力します。</Step>
            <Step n={4}>「送信する」ボタンを押すと、選択した販売店にメールが届きます。</Step>
            <Step n={5}>販売店はメール内のURLからポータルにアクセスし、発注操作を行います。</Step>
            <Note>メールアドレスが登録されていない顧客、または未承認の顧客にはメールは送信されません。</Note>
          </Section>
        </div>

        {/* 6. CSV出力 */}
        <div id="csv" className="bg-white rounded-xl shadow p-6 space-y-4">
          <Section title="6. CSV出力">
            <p>各管理画面右上の「CSV出力」ボタンから、データをExcel対応のCSVファイルでダウンロードできます。</p>
            <div className="grid grid-cols-3 gap-3 mt-2">
              {[
                { page: "顧客管理", content: "販売店名・担当者・メール・電話番号" },
                { page: "商品管理", content: "商品名・規格・価格" },
                { page: "受注管理", content: "注文日・販売店名・商品名・数量・金額" },
              ].map((item) => (
                <div key={item.page} className="bg-gray-50 rounded-lg p-3">
                  <p className="font-medium text-gray-800 text-xs">{item.page}</p>
                  <p className="text-xs text-gray-500 mt-1">{item.content}</p>
                </div>
              ))}
            </div>
          </Section>
        </div>

        {/* 7. 設定 */}
        <div id="settings" className="bg-white rounded-xl shadow p-6 space-y-4">
          <Section title="7. 設定">
            <Step n={1}>右上の会社名をクリックして設定画面を開きます。</Step>
            <Step n={2}>会社情報（会社名・住所・電話番号・FAX・メール）を変更できます。</Step>
            <Step n={3}>パスワードを変更する場合は「現在のパスワード」と「新しいパスワード（6文字以上）」を入力します。</Step>
            <Step n={4}>「保存する」ボタンで変更が反映されます。</Step>
          </Section>
        </div>

        {/* フッター */}
        <div className="text-center text-xs text-gray-400 pb-4">
          <span>© OrderLink</span>
        </div>
      </div>
    </div>
  );
}
