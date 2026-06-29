import Link from "next/link";

export const metadata = { title: "ポータル会員向け操作マニュアル | OrderLink" };

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="space-y-3">
    <h2 className="text-lg font-bold text-blue-900 border-b-2 border-blue-100 pb-1">{title}</h2>
    <div className="space-y-2 text-sm text-gray-700 leading-relaxed">{children}</div>
  </section>
);

const Step = ({ n, children }: { n: number; children: React.ReactNode }) => (
  <div className="flex gap-3">
    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-700 text-white text-xs font-bold flex items-center justify-center">{n}</span>
    <p>{children}</p>
  </div>
);

const Note = ({ children }: { children: React.ReactNode }) => (
  <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 text-sm text-blue-800">{children}</div>
);

export default function PortalGuidePage() {
  return (
    <div className="bg-gray-50 py-12 px-4 print:bg-white print:py-4">
      <div className="max-w-3xl mx-auto space-y-10">

        {/* タイトル */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">マニュアル</h1>
          <p className="text-sm text-gray-500 mt-1">販売店・取引先担当者向け操作ガイド</p>
        </div>

        {/* 目次 */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="font-bold text-gray-800 mb-3">目次</h2>
          <ol className="list-decimal list-inside space-y-1 text-sm text-blue-600">
            <li><a href="#register" className="hover:underline">アカウント登録</a></li>
            <li><a href="#login" className="hover:underline">ログイン・ログアウト</a></li>
            <li><a href="#order" className="hover:underline">発注依頼の方法</a></li>
            <li><a href="#history" className="hover:underline">発注履歴の確認</a></li>
            <li><a href="#profile" className="hover:underline">プロフィール・パスワード変更</a></li>
          </ol>
        </div>

        {/* 1. アカウント登録 */}
        <div id="register" className="bg-white rounded-xl shadow p-6 space-y-4">
          <Section title="1. アカウント登録">
            <p className="font-medium text-gray-800">招待メールからの登録</p>
            <Step n={1}>招待メールまたは招待QRコードを開きます。</Step>
            <Step n={2}>メール内の「登録はこちら」をクリックします。</Step>
            <Step n={3}>登録フォームに必要事項（会社名・住所・電話番号・メールアドレス・ログインID・パスワード）を入力します。</Step>
            <Step n={4}>「登録する」ボタンをクリックすると、登録が完了します。</Step>
            <Step n={5}>酒蔵による承認が完了すると、OrderLinkポータルをご利用いただけます。</Step>
            <Note>招待リンクの有効期限は24時間です。期限が切れた場合は酒蔵の担当者に再送信を依頼してください。</Note>
            <Note>パスワードは6文字以上で設定してください。</Note>
          </Section>
        </div>

        {/* 2. ログイン */}
        <div id="login" className="bg-white rounded-xl shadow p-6 space-y-4">
          <Section title="2. ログイン・ログアウト">
            <p className="font-medium text-gray-800">ログイン</p>
            <Step n={1}>https://www.orderlink.jp/portal にアクセスします。</Step>
            <Step n={2}>設定したログインIDとパスワードを入力し「ログイン」を押します。</Step>

            <p className="font-medium text-gray-800 mt-4">パスワードを忘れた場合</p>
            <p>ログイン画面の「パスワードをお忘れの方」から再設定できます。</p>
          </Section>
        </div>

        {/* 3. 発注依頼 */}
        <div id="order" className="bg-white rounded-xl shadow p-6 space-y-4">
          <Section title="3. 発注依頼の方法">
            <p className="font-medium text-gray-800">メールのURLから発注する場合</p>
            <Step n={1}>酒蔵から届いた発注書メールを開きます。</Step>
            <Step n={2}>メール内のURLをクリックすると発注画面が開きます。</Step>
            <Step n={3}>商品一覧から注文したい商品の数量（ケース数）を入力します。</Step>
            <Step n={4}>備考・納品希望日などがあれば備考欄に入力します。</Step>
            <Step n={5}>「発注依頼を送信する」ボタンを押して完了です。</Step>
            <Note>有効期限が設定されている場合、期限を過ぎると発注できなくなります。</Note>

            <p className="font-medium text-gray-800 mt-4">ポータルから直接発注する場合</p>
            <Step n={1}>ログイン後、上部メニューの「発注依頼」をクリックします。</Step>
            <Step n={2}>商品一覧から数量を入力します。「+」「−」ボタンまたは直接数字を入力できます。</Step>
            <Step n={3}>「発注依頼を送信する」ボタンで送信完了です。</Step>
            <Note>在庫数が設定されている商品は、在庫数以上の数量は入力できません。</Note>
            <Note>「?」ボタンをクリックすると商品の詳細説明が表示されます。</Note>
          </Section>
        </div>

        {/* 4. 発注履歴 */}
        <div id="history" className="bg-white rounded-xl shadow p-6 space-y-4">
          <Section title="4. 発注履歴の確認">
            <Step n={1}>上部メニューの「発注管理」をクリックします。</Step>
            <Step n={2}>過去の発注履歴が一覧で表示されます。月ごとに絞り込みもできます。</Step>
            <Step n={3}>各注文の「詳細」ボタンをクリックすると、注文内容・金額の詳細が確認できます。</Step>

            <div className="mt-2 space-y-1">
              <p className="font-medium text-gray-800">ステータスの見方</p>
              <div className="flex flex-wrap gap-3 text-xs">
                <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full font-medium">確認待ち</span>
                <span className="text-gray-500">→ 酒蔵側で確認中</span>
              </div>
              <div className="flex flex-wrap gap-3 text-xs">
                <span className="bg-gray-100 text-gray-500 px-2 py-1 rounded-full font-medium">確定</span>
                <span className="text-gray-500">→ 注文が確定しました</span>
              </div>
              <div className="flex flex-wrap gap-3 text-xs">
                <span className="bg-red-100 text-red-600 px-2 py-1 rounded-full font-medium">在庫なし</span>
                <span className="text-gray-500">→ 在庫が確保できませんでした</span>
              </div>
            </div>
          </Section>
        </div>

        {/* 5. プロフィール */}
        <div id="profile" className="bg-white rounded-xl shadow p-6 space-y-4">
          <Section title="5. プロフィール・パスワード変更">
            <Step n={1}>画面右上の会社名をクリックします。</Step>
            <Step n={2}>会社情報（会社名・住所・電話番号など）を更新できます。</Step>
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
