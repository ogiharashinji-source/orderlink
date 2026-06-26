"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

type AuthState =
  | { type: "loading" }
  | { type: "admin"; name: string }
  | { type: "portal"; name: string }
  | { type: "guest" };

// モジュールキャッシュ：同一JSセッション内のみ有効（ページリロードでリセット）
let _cached: AuthState | null = null;

async function fetchAuthState(): Promise<AuthState> {
  try {
    const r = await fetch("/api/admin/nav", { redirect: "manual" });
    if (r.ok) {
      const d = await r.json();
      return { type: "admin", name: d.companyName ?? "" };
    }
  } catch {}
  try {
    const r2 = await fetch("/api/portal/profile", { redirect: "manual" });
    if (r2.ok) {
      const d2 = await r2.json();
      return { type: "portal", name: d2.name ?? "" };
    }
  } catch {}
  return { type: "guest" };
}

export default function LandingHeaderActions() {
  const [state, setState] = useState<AuthState>({ type: "loading" });

  useEffect(() => {
    // モジュールキャッシュがあれば即表示（同セッション内のClient-side navigationで有効）
    if (_cached && _cached.type !== "loading") {
      setState(_cached);
      return;
    }

    // キャッシュなし → フェッチして確定
    fetchAuthState().then((next) => {
      _cached = next;
      setState(next);
    });
  }, []);

  // bfcache（ブラウザ戻るボタン）対応：ページ復元時に再検証
  useEffect(() => {
    const onPageShow = (e: PageTransitionEvent) => {
      if (e.persisted) {
        _cached = null;
        fetchAuthState().then((next) => {
          _cached = next;
          setState(next);
        });
      }
    };
    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
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
