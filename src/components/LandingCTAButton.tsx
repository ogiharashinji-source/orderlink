"use client";
import { useEffect, useState } from "react";

const LS_KEY = "landing_auth";

export default function LandingCTAButton({
  label = "今すぐ無料で始める →",
  className = "inline-block bg-amber-400 text-[#1e3a5f] font-black text-base sm:text-lg px-8 sm:px-10 py-3 sm:py-4 rounded-full shadow-lg hover:bg-amber-300 transition",
}: {
  label?: string;
  className?: string;
}) {
  const [href, setHref] = useState("/register");

  useEffect(() => {
    // キャッシュから即座に反映
    try {
      const stored = localStorage.getItem(LS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.type === "admin") { setHref("/requests"); return; }
        if (parsed.type === "portal") { setHref("/portal/order"); return; }
      }
    } catch {}

    // バックグラウンドでフェッチ（LandingHeaderActionsと共有キャッシュ）
    (async () => {
      try {
        const r = await fetch("/api/admin/nav", { redirect: "manual" });
        if (r.ok) { setHref("/requests"); return; }
      } catch {}
      try {
        const r2 = await fetch("/api/portal/profile", { redirect: "manual" });
        if (r2.ok) { setHref("/portal/order"); return; }
      } catch {}
    })();
  }, []);

  return <a href={href} className={className}>{label}</a>;
}
