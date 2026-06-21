import Link from "next/link";
import CloseButton from "@/components/CloseButton";

export const metadata = { title: "プライバシーポリシー | OrderLink" };

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow p-8 space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">プライバシーポリシー</h1>
          <p className="text-sm text-gray-500 mt-1">最終更新日：2026年6月21日</p>
        </div>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-gray-800">1. 取得する情報</h2>
          <p className="text-sm text-gray-600 leading-relaxed">本サービスでは、以下の情報を取得します。</p>
          <ul className="text-sm text-gray-600 leading-relaxed list-disc list-inside space-y-1">
            <li>会社名・担当者名・住所・電話番号・FAX番号・メールアドレス</li>
            <li>ログインID・パスワード（暗号化して保管）</li>
            <li>注文情報（商品名・数量・金額・発注日時）</li>
            <li>サービス利用ログ</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-gray-800">2. 利用目的</h2>
          <ul className="text-sm text-gray-600 leading-relaxed list-disc list-inside space-y-1">
            <li>受発注業務の管理・処理</li>
            <li>本サービスに関するご連絡・通知</li>
            <li>サービスの品質改善・不正利用の防止</li>
            <li>法令に基づく対応</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-gray-800">3. 第三者への提供</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            当社は、以下の場合を除き、取得した個人情報を第三者に提供しません。
          </p>
          <ul className="text-sm text-gray-600 leading-relaxed list-disc list-inside space-y-1">
            <li>ご本人の同意がある場合</li>
            <li>法令に基づく場合</li>
            <li>人の生命・身体・財産の保護に必要な場合</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-gray-800">4. 委託</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            本サービスの運営にあたり、データベース・インフラ等の業務を外部事業者（Neon、Vercel等）に委託することがあります。委託先に対しては適切な安全管理を求めます。
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-gray-800">5. 安全管理</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            取得した個人情報は、不正アクセス・紛失・漏洩等を防ぐため、適切な技術的・組織的安全管理措置を講じます。
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-gray-800">6. 保存期間</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            個人情報は、利用目的の達成に必要な期間、または法令で定める期間保管し、不要となった場合は適切に削除します。
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-gray-800">7. 開示・訂正・削除</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            ご本人から個人情報の開示・訂正・削除のご要望があった場合、本人確認の上、合理的な期間内に対応します。下記お問い合わせ先までご連絡ください。
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-gray-800">8. Cookieの利用</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            本サービスはログイン状態の維持のためCookieを使用します。広告目的のCookieは使用しません。
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-gray-800">9. ポリシーの変更</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            本ポリシーは必要に応じて改定することがあります。重要な変更がある場合はサービス内でお知らせします。
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-gray-800">10. お問い合わせ</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            個人情報の取り扱いに関するお問い合わせは、本サービスの管理者までご連絡ください。
          </p>
        </section>

        <div className="pt-4 border-t border-gray-100 flex gap-4 text-sm text-blue-600">
          <Link href="/terms" className="hover:underline">利用規約</Link>
          <CloseButton />
        </div>
      </div>
    </div>
  );
}
