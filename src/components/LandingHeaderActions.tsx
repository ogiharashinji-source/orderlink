"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function LandingHeaderActions() {
  const [state, setState] = useState<
    | { type: "loading" }
    | { type: "admin"; name: string }
    | { type: "portal"; name: string }
    | { type: "guest" }
  >({ type: "loading" });

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("/api/admin/nav", { redirect: "manual" });
        if (r.ok) {
          const d = await r.json();
          setState({ type: "admin", name: d.companyName ?? "" });
          return;
        }
      } catch {}

      try {
        const r2 = await fetch("/api/portal/profile", { redirect: "manual" });
        if (r2.ok) {
          const d2 = await r2.json();
          setState({ type: "portal", name: d2.name ?? "" });
          return;
        }
      } catch {}

      setState({ type: "guest" });
    })();
  }, []);

  if (state.type === "loading") return <div className="w-24 sm:w-40" />;

  if (state.type === "admin") {
    return (
      <a href="/requests" className="text-white font-bold text-sm px-4 sm:px-5 py-2 rounded-full hover:bg-white/10 transition truncate max-w-[160px] sm:max-w-none">
        {state.name || "管理画面へ"}
      </a>
    );
  }

  if (state.type === "portal") {
    return (
      <a href="/portal/order" className="text-white font-bold text-sm px-4 sm:px-5 py-2 rounded-full hover:bg-white/10 transition truncate max-w-[160px] sm:max-w-none">
        {state.name || "発注ページへ"}
      </a>
    );
  }

  return (
    <div className="flex gap-2 sm:gap-3 flex-shrink-0">
      <Link href="/admin/login"
        className="border border-white text-white font-bold text-sm px-4 sm:px-5 py-2 rounded-full hover:bg-white hover:text-[#1e3a5f] transition">
        ログイン
      </Link>
      <Link href="/register"
        className="bg-amber-400 text-[#1e3a5f] font-bold text-sm px-4 sm:px-5 py-2 rounded-full hover:bg-amber-300 transition">
        新規登録
      </Link>
    </div>
  );
}
