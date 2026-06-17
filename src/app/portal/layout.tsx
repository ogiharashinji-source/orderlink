"use client";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const navItems = [
  { href: "/portal/order",  label: "発注依頼" },
  { href: "/portal/orders", label: "発注管理" },
];

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [customerName, setCustomerName] = useState("");

  useEffect(() => {
    if (pathname === "/portal/login" || pathname.startsWith("/portal/reset-password") || pathname.startsWith("/portal/register")) return;
    fetch("/api/customer/me").then((r) => {
      if (!r.ok) { window.location.href = "/portal/login"; return null; }
      return r.json();
    }).then((d) => {
      if (d) setCustomerName(d.name);
    });
  }, [pathname]);

  if (pathname === "/portal/login" || pathname.startsWith("/portal/reset-password") || pathname.startsWith("/portal/register")) {
    return <>{children}</>;
  }

  const handleLogout = async () => {
    await fetch("/api/customer/logout", { method: "POST" });
    window.location.href = "/portal/login";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-slate-800 text-white overflow-x-auto">
        <div className="flex flex-nowrap items-center h-16 gap-6 px-4 w-max">
            <span className="text-base font-bold text-white whitespace-nowrap">OrderLink</span>
            <div className="flex flex-nowrap items-center gap-3">
              {navItems.map((item) => {
                const active = pathname === item.href || (item.href !== "/portal/order" && pathname.startsWith(item.href));
                return (
                  <a key={item.href} href={item.href}
                    className={`whitespace-nowrap px-3 py-2 rounded text-sm font-medium transition-colors ${
                      active ? "bg-slate-600 text-white" : "text-slate-300 hover:bg-slate-700 hover:text-white"
                    }`}>
                    {item.label}
                  </a>
                );
              })}
            </div>
            {customerName && (
              <a href="/portal/profile" className="whitespace-nowrap text-white text-base font-semibold px-3 py-2 rounded hover:bg-slate-700 hover:text-slate-300 transition-colors">
                {customerName}
              </a>
            )}
            <button onClick={handleLogout}
              className="whitespace-nowrap text-slate-300 hover:text-white text-sm font-medium px-3 py-2 rounded hover:bg-slate-700 transition-colors">
              ログアウト
            </button>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
