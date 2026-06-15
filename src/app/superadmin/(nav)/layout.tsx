"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    if (!confirm("ログアウトしますか？")) return;
    await fetch("/api/superadmin/auth", { method: "DELETE" });
    router.push("/superadmin/login");
  };

  const navItems = [
    { href: "/superadmin/companies", label: "管理者一覧" },
    { href: "/superadmin/customers", label: "ポータル会員一覧" },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-slate-800 text-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center h-14 gap-6">
            <span className="text-sm font-bold text-white whitespace-nowrap">運営管理システム</span>
            <div className="flex gap-2 flex-1">
              {navItems.map((item) => {
                const active = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                      active ? "bg-slate-600 text-white" : "text-slate-300 hover:bg-slate-700 hover:text-white"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
            <button
              onClick={handleLogout}
              className="text-slate-300 hover:text-white text-sm font-medium px-3 py-2 rounded hover:bg-slate-700 transition-colors"
            >
              ログアウト
            </button>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
