"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

type AuthState =
  | { type: "loading" }
  | { type: "admin"; name: string }
  | { type: "portal"; name: string }
  | { type: "guest" };

const LS_KEY = "landing_auth";
let _cached: AuthState | null = null;

export default function LandingHeaderActions() {
  const [state, setState] = useState<AuthState>({ type: "loading" });

  useEffect(() => {
    // キャッシュ/localStorageから即座に表示
    if (_cached && _cached.type !== "loading") {
      setState(_cached);
    } else {
      try {
        const stored = localStorage.getItem(LS_KEY);
        if (stored) {
          const parsed: AuthState = JSON.parse(stored);
          _cached = parsed;
          setState(parsed);
        }
      } catch {}
    }

    // バックグラウンドでフェッチして更新
    (async () => {
      try {
        const r = await fetch("/api/admin/nav", { redirect: "manual" });
        if (r.ok) {
          const d = await r.json();
          const next: AuthState = { type: "admin", name: d.companyName ?? "" };
          _cached = next;
          localStorage.setItem(LS_KEY, JSON.stringify(next));
          setState(next);
          return;
        }
      } catch {}

      try {
        const r2 = await fetch("/api/portal/profile", { redirect: "manual" });
        if (r2.ok) {
          const d2 = await r2.json();
          const next: AuthState = { type: "portal", name: d2.name ?? "" };
          _cached = next;
          localStorage.setItem(LS_KEY, JSON.stringify(next));
          setState(next);
          return;
        }
      } catch {}

      const next: AuthState = { type: "guest" };
      _cached = next;
      localStorage.setItem(LS_KEY, JSON.stringify(next));
      setState(next);
    })();
  }, []);

  if (state.type === "loading") return <div className="w-24 sm:w-40" />;

  if (state.type === "admin") {
    return (
      <a href="/requests" className="whitespace-nowrap text-white text-base font-semibold px-3 py-2 rounded hover:bg-white/10 transition truncate max-w-[200px] sm:max-w-none">
        {state.name || "管理画面へ"}
      </a>
    );
  }

  if (state.type === "portal") {
    return (
      <a href="/portal/order" className="whitespace-nowrap text-white text-base font-semibold px-3 py-2 rounded hover:bg-white/10 transition truncate max-w-[200px] sm:max-w-none">
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
