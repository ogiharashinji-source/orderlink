"use client";
import { useEffect, useState } from "react";

export default function PortalTopNav() {
  const [customerName, setCustomerName] = useState("");

  useEffect(() => {
    fetch("/api/portal/profile")
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { if (d?.name) setCustomerName(d.name); })
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    await fetch("/api/customer/logout", { method: "POST" });
    window.location.href = "/portal/login";
  };

  return (
    <nav className="bg-slate-800 text-white overflow-x-auto">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-nowrap items-center h-16 gap-6 min-w-full">
          <a href="/portal/order" className="text-base font-bold text-white whitespace-nowrap hover:text-slate-300">OrderLink</a>
          <div className="flex flex-nowrap items-center gap-3">
            <a href="/portal/order" className="whitespace-nowrap px-3 py-2 rounded text-sm font-medium text-slate-300 hover:bg-slate-700 hover:text-white transition-colors">発注依頼</a>
            <a href="/portal/orders" className="whitespace-nowrap px-3 py-2 rounded text-sm font-medium text-slate-300 hover:bg-slate-700 hover:text-white transition-colors">発注管理</a>
          </div>
          <div className="flex-1" />
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
      </div>
    </nav>
  );
}
