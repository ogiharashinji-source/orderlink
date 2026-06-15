"use client";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

const navItems = [
  { href: "/portal/order",  label: "注文依頼" },
  { href: "/portal/orders", label: "注文管理" },
];

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [customerName, setCustomerName] = useState("");

  useEffect(() => {
    if (pathname === "/portal/login" || pathname.startsWith("/portal/reset-password") || pathname.startsWith("/portal/register")) return;
    fetch("/api/customer/me").then((r) => {
      if (!r.ok) { router.push("/portal/login"); return null; }
      return r.json();
    }).then((d) => {
      if (d) setCustomerName(d.name);
    });
  }, [pathname, router]);

  if (pathname === "/portal/login" || pathname.startsWith("/portal/reset-password") || pathname.startsWith("/portal/register")) {
    return <>{children}</>;
  }

  const handleLogout = async () => {
    await fetch("/api/customer/logout", { method: "POST" });
    router.push("/portal/login");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-slate-800 text-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center h-16 gap-6">
            <span className="text-base font-bold text-white whitespace-nowrap">発注システム</span>
            <div className="flex items-center gap-3 flex-1">
              {navItems.map((item) => {
                const active = pathname === item.href || (item.href !== "/portal/order" && pathname.startsWith(item.href));
                return (
                  <Link key={item.href} href={item.href}
                    className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                      active ? "bg-slate-600 text-white" : "text-slate-300 hover:bg-slate-700 hover:text-white"
                    }`}>
                    {item.label}
                  </Link>
                );
              })}
            </div>
            {customerName && (
              <Link href="/portal/profile" className="text-white text-base font-semibold px-3 py-2 rounded hover:bg-slate-700 hover:text-slate-300 transition-colors">
                {customerName}
              </Link>
            )}
            <button onClick={handleLogout}
              className="text-slate-300 hover:text-white text-sm font-medium px-3 py-2 rounded hover:bg-slate-700 transition-colors">
              ログアウト
            </button>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
