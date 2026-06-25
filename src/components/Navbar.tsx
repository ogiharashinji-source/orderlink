"use client";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { setAdminLoggedIn } from "@/lib/authState";
import Link from "next/link";

const navItems = [
  { href: "/requests", label: "リクエスト", badge: true },
  { href: "/orders", label: "受注" },
  { href: "/products", label: "商品" },
  { href: "/customers", label: "顧客", customerBadge: true },
  { href: "/fax", label: "メール送信" },
];

let _cachedCompanyName = "";

export default function Navbar() {
  const pathname = usePathname();
  const [pendingCount, setPendingCount] = useState(0);
  const [approvalCount, setApprovalCount] = useState(0);
  const [companyName, setCompanyName] = useState("");

  // マウント後にキャッシュ or localStorage から即座に反映
  useEffect(() => {
    if (_cachedCompanyName) {
      setCompanyName(_cachedCompanyName);
    } else {
      const stored = localStorage.getItem("nav_company");
      if (stored) {
        _cachedCompanyName = stored;
        setCompanyName(stored);
      }
    }
  }, []);

  const handleLogout = async () => {
    if (!confirm("ログアウトしますか？")) return;
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  };

  const fetchNav = useCallback((redirectOnUnauth = false, currentPath = "") => {
    fetch("/api/admin/nav")
      .then((r) => {
        if (r.status === 401 && redirectOnUnauth && currentPath !== "/manual") {
          window.location.href = "/admin/login";
          return null;
        }
        if (!r.ok) return null;
        return r.json();
      })
      .then((d) => {
        if (!d) return;
        setAdminLoggedIn(true);
        if (d.companyName) {
          _cachedCompanyName = d.companyName;
          localStorage.setItem("nav_company", d.companyName);
          setCompanyName(d.companyName);
        }
        setPendingCount(d.pendingCount ?? 0);
        setApprovalCount(d.approvalCount ?? 0);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchNav(true, pathname);
  }, [pathname, fetchNav]);

  useEffect(() => {
    const id = setInterval(() => fetchNav(false), 60000);
    return () => clearInterval(id);
  }, [fetchNav]);

  return (
    <nav className="bg-slate-800 text-white overflow-x-auto">
      <div className="max-w-7xl mx-auto px-4">
      <div className="flex flex-nowrap items-center h-16 gap-6 min-w-full">
        <a href="/requests" className="text-base font-bold text-white whitespace-nowrap hover:text-slate-300">OrderLink</a>
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
          <Link href="/manual" className="whitespace-nowrap text-slate-300 hover:text-white text-sm px-3 py-2 rounded hover:bg-slate-700 transition-colors">ご利用ガイド</Link>
          {companyName && (
            <a href="/settings" className="whitespace-nowrap text-white text-base font-semibold px-3 py-2 rounded hover:bg-slate-700 transition-colors">{companyName}</a>
          )}
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
