"use client";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

const navItems = [
  { href: "/requests", label: "リクエスト", badge: true },
  { href: "/orders", label: "受注管理" },
  { href: "/products", label: "商品管理" },
  { href: "/customers", label: "顧客管理", customerBadge: true },
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

  const fetchBadges = useCallback(() => {
    fetch("/api/requests")
      .then((r) => r.json())
      .then((data: Array<{ status: string }>) => {
        setPendingCount(data.filter((r) => r.status === "PENDING").length);
      })
      .catch(() => {});
    fetch("/api/customers?unapproved=1")
      .then((r) => r.ok ? r.json() : [])
      .then((data: Array<unknown>) => { setApprovalCount(data.length); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => {
        if (!r.ok || r.redirected) { window.location.href = "/admin/login"; return null; }
        return r.json();
      })
      .then((d) => { if (d?.companyName) setCompanyName(d.companyName); })
      .catch(() => { window.location.href = "/admin/login"; });
    fetchBadges();
  }, [pathname, fetchBadges]);

  useEffect(() => {
    const id = setInterval(fetchBadges, 15000);
    return () => clearInterval(id);
  }, [fetchBadges]);

  return (
    <nav className="bg-slate-800 text-white overflow-x-auto">
      <div className="max-w-7xl mx-auto px-4">
      <div className="flex flex-nowrap items-center h-16 gap-6 min-w-full">
        <span className="text-base font-bold text-white whitespace-nowrap">OrderLink</span>
          <div className="flex flex-nowrap gap-3">
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
