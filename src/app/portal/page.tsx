"use client";
import { useEffect } from "react";

export default function PortalIndexPage() {
  useEffect(() => {
    fetch("/api/customer/me").then((r) => {
      if (r.ok) {
        window.location.href = "/portal/order";
      } else {
        window.location.href = "/portal/login";
      }
    }).catch(() => {
      window.location.href = "/portal/login";
    });
  }, []);

  return (
    <div className="min-h-screen bg-slate-800 flex items-center justify-center">
      <p className="text-white text-sm">読み込み中...</p>
    </div>
  );
}
