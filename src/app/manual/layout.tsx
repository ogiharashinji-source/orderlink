import { cookies } from "next/headers";
import { verifyAdminToken } from "@/lib/adminToken";
import Navbar from "@/components/Navbar";
import Link from "next/link";

export default async function ManualLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  const isLoggedIn = !!token && verifyAdminToken(token) !== null;

  return (
    <div className="min-h-screen bg-gray-50 font-sans print:bg-white">
      {isLoggedIn ? (
        <div className="print:hidden"><Navbar /></div>
      ) : (
        <header className="bg-[#1e3a5f] text-white px-6 py-4 flex items-center justify-between print:hidden">
          <Link href="/">
            <span className="text-xl font-bold tracking-widest">OrderLink</span>
            <span className="text-xs ml-2 opacity-70">オーダーリンク</span>
          </Link>
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
      )}
      {children}
    </div>
  );
}
