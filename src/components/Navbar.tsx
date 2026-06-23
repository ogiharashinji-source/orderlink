"use client";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

const navItems = [
  { href: "/requests", label: "リクエスト", badge: true },
  { href: "/orders", label: "受注" },
  { href: "/products", label: "商品" },
  { href: "/customers", label: "顧客", customerBadge: true },
  { href: "/fax", label: "メール送信" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [pendingCount, setPendingCount] = useState(0);
  const [approvalCount, setApprovalCount] = useState(0);
  const [companyName, setCompanyName] = useState("");

  const handleLogout = async () => {
    if (!confirm("ログアウトしますか？")) return;
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  };

  const fetchNav = useCallback((redirectOnUnauth = false) => {
    fetch("/api/admin/nav")
      .then((r) => {
        if (!r.ok) {
          if (redirectOnUnauth) window.location.href = "/admin/login";
          return null;
        }
        return r.json();
      })
      .then((d) => {
        if (!d) return;
        if (d.companyName) setCompanyName(d.companyName);
        setPendingCount(d.pendingCount ?? 0);
        setApprovalCount(d.approvalCount ?? 0);
      })
      .catch(() => { if (redirectOnUnauth) window.location.href = "/admin/login"; });
  }, []);

  useEffect(() => {
    fetchNav(true);
  }, [pathname, fetchNav]);

  useEffect(() => {
    const id = setInterval(() => fetchNav(false), 60000);
    return () => clearInterval(id);
  }, [fetchNav]);

  return (
    <nav className="bg-slate-800 text-white overflow-x-auto">
      <div className="max-w-7xl mx-auto px-4">
      <div className="flex flex-nowrap items-center h-16 gap-6 min-w-full">
        <span className="text-base font-bold text-white whitespace-nowrap">OrderLink</span>
          <div className="flex flex-nowrap gap-6">
            {navItems.map((item) => {
              const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
              return (
                <a
                  key={item.href}
                  href={item.href}
                  className={`relative whitespace-nowrap px-3 py-2 rounded text-sm font-medium transition-colors ${
                    active ? "bg-slate-600 text-white" : "text-slate-300 hover:bg-slate-700 hover:text-white"
                  }`}
                >
                  {item.label}
                  {item.badge && pendingCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                      {pendingCount > 9 ? "9+" : pendingCount}
                    </span>
                  )}
                  {item.customerBadge && approvalCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                      {approvalCount > 9 ? "9+" : approvalCount}
                    </span>
                  )}
                </a>
              );
            })}
          </div>
          <div className="flex-1" />
          <a href="/guide/admin" target="_blank" className="whitespace-nowrap text-slate-300 hover:text-white text-sm px-3 py-2 rounded hover:bg-slate-700 transition-colors">マニュアル</a>
          <a href="/settings" className="whitespace-nowrap text-white text-base font-semibold px-3 py-2 rounded hover:bg-slate-700 transition-colors">{companyName || "マイページ"}</a>
          <button
            onClick={handleLogout}
            className="whitespace-nowrap text-slate-300 hover:text-white text-sm font-medium px-3 py-2 rounded hover:bg-slate-700 transition-colors"
          >
            ログアウト
          </button>
      </div>
      </div>
    </nav>
  );
}
