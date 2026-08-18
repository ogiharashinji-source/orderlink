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
  { href: "/chat", label: "チャット", chatBadge: true },
  { href: "/fax", label: "メール" },
];

let _cachedCompanyName = "";

export default function Navbar() {
  const pathname = usePathname();
  const [pendingCount, setPendingCount] = useState(0);
  const [approvalCount, setApprovalCount] = useState(0);
  const [chatUnreadCount, setChatUnreadCount] = useState(0);
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
        setChatUnreadCount(d.chatUnreadCount ?? 0);
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
    <nav className="bg-[#1e3a5f] text-white overflow-x-auto">
      <div className="max-w-7xl mx-auto px-4">
      <div className="flex flex-nowrap items-center h-16 gap-6 min-w-full">
        <a href="/requests" className="flex-shrink-0 hover:opacity-80">
          <span className="text-lg font-bold tracking-widest text-white whitespace-nowrap">OrderLink</span>
        </a>
          <div className="flex flex-nowrap gap-6">
            {navItems.map((item) => {
              const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
              return (
                <a
                  key={item.href}
                  href={item.href}
                  className={`relative whitespace-nowrap px-3 py-2 rounded text-sm font-medium transition-colors ${
                    active ? "bg-white/20 text-white" : "text-slate-300 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {item.label}
                  {item.badge && pendingCount > 0 && (
                    <span style={{ position: "absolute", top: -4, right: -4, background: "#ef4444", color: "white", fontSize: 10, fontWeight: 700, minWidth: 16, height: 16, padding: "0 3px", borderRadius: 9999, display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1 }}>
                      {pendingCount}
                    </span>
                  )}
                  {item.customerBadge && approvalCount > 0 && (
                    <span style={{ position: "absolute", top: -4, right: -4, background: "#ef4444", color: "white", fontSize: 10, fontWeight: 700, minWidth: 16, height: 16, padding: "0 3px", borderRadius: 9999, display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1 }}>
                      {approvalCount}
                    </span>
                  )}
                  {item.chatBadge && chatUnreadCount > 0 && (
                    <span style={{ position: "absolute", top: -4, right: -4, background: "#ef4444", color: "white", fontSize: 10, fontWeight: 700, minWidth: 16, height: 16, padding: "0 3px", borderRadius: 9999, display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1 }}>
                      {chatUnreadCount}
                    </span>
                  )}
                </a>
              );
            })}
          </div>
          <div className="flex-1" />
          <a href="/contact" target="_blank" rel="noopener noreferrer" className="whitespace-nowrap text-slate-300 hover:text-white text-sm px-3 py-2 rounded hover:bg-white/10 transition-colors">お問合せ</a>
          <Link href="/manual" className="whitespace-nowrap text-slate-300 hover:text-white text-sm px-3 py-2 rounded hover:bg-white/10 transition-colors">ご利用ガイド</Link>
          {companyName && (
            <a href="/settings" className="whitespace-nowrap text-white text-base font-semibold px-3 py-2 rounded hover:bg-white/10 transition-colors">{companyName}</a>
          )}
      </div>
      </div>
    </nav>
  );
}
