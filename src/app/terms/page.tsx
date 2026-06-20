import Link from "next/link";

export const metadata = { title: "利用規約 | OrderLink" };

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow p-8 space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">利用規約</h1>
          <p className="text-sm text-gray-500 mt-1">最終更新日：2026年6月21日</p>
        </div>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-gray-800">第1条（適用）</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            本利用規約（以下「本規約」）は、OrderLink（以下「本サービス」）の利用に関する条件を定めるものです。ユーザーは本規約に同意の上、本サービスをご利用ください。
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-gray-800">第2条（サービスの内容）</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            本サービスは、酒蔵と販売店の間における受発注業務をオンラインで管理・効率化するためのシステムです。現在、本サービスは無料で提供しています。将来的に有料プランを導入する場合は、事前にユーザーへ通知します。
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-gray-800">第3条（アカウント）</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            ユーザーは、登録情報を正確かつ最新の状態に保つ義務を負います。ログインIDおよびパスワードの管理はユーザー自身の責任とし、第三者への譲渡・貸与を禁止します。
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-gray-800">第4条（禁止事項）</h2>
          <ul className="text-sm text-gray-600 leading-relaxed list-disc list-inside space-y-1">
            <li>虚偽の情報による登録</li>
            <li>本サービスの運営を妨害する行為</li>
            <li>第三者の著作権・知的財産権を侵害する行為</li>
            <li>法令または公序良俗に反する行為</li>
            <li>その他、当社が不適切と判断する行為</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-gray-800">第5条（サービスの変更・停止）</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            当社は、ユーザーへの事前通知なく本サービスの内容を変更、または提供を一時停止・終了することがあります。これによりユーザーに生じた損害について、当社は責任を負いません。
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-gray-800">第6条（免責事項）</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            本サービスは現状有姿で提供するものとし、特定の目的への適合性・正確性・完全性を保証しません。本サービスの利用により生じた損害について、当社の故意または重大な過失によるものを除き、当社は責任を負いません。
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-gray-800">第7条（規約の変更）</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            当社は必要に応じて本規約を変更できるものとします。変更後の規約はサービス内に掲示した時点から効力を生じ、ユーザーが変更後に本サービスを利用した場合、変更に同意したものとみなします。
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-gray-800">第8条（準拠法・管轄）</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            本規約は日本法に準拠し、本サービスに関する紛争については、当社所在地を管轄する裁判所を第一審の専属的合意管轄裁判所とします。
          </p>
        </section>

        <div className="pt-4 border-t border-gray-100 flex gap-4 text-sm text-blue-600">
          <Link href="/privacy" className="hover:underline">プライバシーポリシー</Link>
          <Link href="/" className="hover:underline text-gray-500">トップへ戻る</Link>
        </div>
      </div>
    </div>
  );
}
