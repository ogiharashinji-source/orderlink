"use client";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Footer from "@/components/Footer";

const navItems = [
  { href: "/portal/order",  label: "発注依頼" },
  { href: "/portal/orders", label: "発注管理" },
];

const LS_KEY = "portal_customer_name";
let _cachedCustomerName = "";

export default function PortalLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [customerName, setCustomerName] = useState("");
  const [redirecting, setRedirecting] = useState(false);

  // マウント直後にキャッシュ/localStorageから即座に反映
  useEffect(() => {
    if (pathname === "/portal/login" || pathname.startsWith("/portal/reset-password") || pathname.startsWith("/portal/register")) {
      _cachedCustomerName = "";
      localStorage.removeItem(LS_KEY);
      setCustomerName("");
      return;
    }
    if (_cachedCustomerName) {
      setCustomerName(_cachedCustomerName);
    } else {
      const stored = localStorage.getItem(LS_KEY);
      if (stored) {
        _cachedCustomerName = stored;
        setCustomerName(stored);
      }
    }
  }, [pathname]);

  useEffect(() => {
    if (pathname === "/portal/login" || pathname.startsWith("/portal/reset-password") || pathname.startsWith("/portal/register")) return;
    fetch("/api/customer/me").then((r) => {
      if (!r.ok) { setRedirecting(true); window.location.href = "/portal/login"; return; }
      fetch("/api/portal/profile").then((r2) => r2.ok ? r2.json() : null).then((d) => {
        if (d?.name) {
          _cachedCustomerName = d.name;
          localStorage.setItem(LS_KEY, d.name);
          setCustomerName(d.name);
        }
      });
    });
  }, [pathname]);

  if (pathname === "/portal/login" || pathname.startsWith("/portal/reset-password") || pathname.startsWith("/portal/register")) {
    return <>{children}</>;
  }

  if (redirecting) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-[#1e3a5f] text-white overflow-x-auto">
        <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-nowrap items-center h-16 gap-6 min-w-full">
            <div className="flex-shrink-0">
              <span className="text-lg font-bold tracking-widest text-white whitespace-nowrap">OrderLink</span>
            </div>
            <div className="flex flex-nowrap items-center gap-3">
              {navItems.map((item) => {
                const active = pathname === item.href || (item.href !== "/portal/order" && pathname.startsWith(item.href));
                return (
                  <a key={item.href} href={item.href}
                    className={`whitespace-nowrap px-3 py-2 rounded text-sm font-medium transition-colors ${
                      active ? "bg-white/20 text-white" : "text-slate-300 hover:bg-white/10 hover:text-white"
                    }`}>
                    {item.label}
                  </a>
                );
              })}
            </div>
            <div className="flex-1" />
            <a href="/contact" target="_blank" rel="noopener noreferrer" className="whitespace-nowrap text-slate-300 hover:text-white text-sm px-3 py-2 rounded hover:bg-white/10 transition-colors">お問合せ</a>
            <a href="/portal/guide" className="whitespace-nowrap text-slate-300 hover:text-white text-sm px-3 py-2 rounded hover:bg-white/10 transition-colors">マニュアル</a>
            {customerName && (
              <a href="/portal/profile" className="whitespace-nowrap text-white text-base font-semibold px-3 py-2 rounded hover:bg-white/10 hover:text-slate-300 transition-colors">
                {customerName}
              </a>
            )}
        </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 py-6">{children}</main>
      <Footer />
    </div>
  );
}
