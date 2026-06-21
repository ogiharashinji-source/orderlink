import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white mt-12">
      <div className="max-w-7xl mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-2 text-xs text-gray-400">
        <span>© {new Date().getFullYear()} OrderLink</span>
        <div className="flex gap-4">
          <Link href="/terms" className="hover:text-gray-600 hover:underline">利用規約</Link>
          <Link href="/privacy" className="hover:text-gray-600 hover:underline">プライバシーポリシー</Link>
          <Link href="/contact" className="hover:text-gray-600 hover:underline">お問い合わせ</Link>
        </div>
      </div>
    </footer>
  );
}
