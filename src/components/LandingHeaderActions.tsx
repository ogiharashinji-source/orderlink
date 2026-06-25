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
    fetch("/api/admin/nav")
      .then((r) => r.ok ? r.json() : null)
      .then((d) => {
        if (d?.companyName) {
          setState({ type: "admin", name: d.companyName });
          return;
        }
        return fetch("/api/portal/profile")
          .then((r) => r.ok ? r.json() : null)
          .then((d2) => {
            if (d2?.name) setState({ type: "portal", name: d2.name });
            else setState({ type: "guest" });
          });
      })
      .catch(() => setState({ type: "guest" }));
  }, []);

  if (state.type === "loading") return <div className="w-40" />;

  if (state.type === "admin") {
    return (
      <div className="flex items-center gap-3">
        <a href="/requests" className="text-white font-bold text-sm px-5 py-2 rounded-full hover:bg-white/10 transition">
          {state.name}
        </a>
      </div>
    );
  }

  if (state.type === "portal") {
    return (
      <div className="flex items-center gap-3">
        <a href="/portal/order" className="text-white font-bold text-sm px-5 py-2 rounded-full hover:bg-white/10 transition">
          {state.name}
        </a>
      </div>
    );
  }

  return (
    <div className="flex gap-3">
      <Link href="/admin/login"
        className="border border-white text-white font-bold text-sm px-5 py-2 rounded-full hover:bg-white hover:text-[#1e3a5f] transition">
        ログイン
      </Link>
      <Link href="/register"
        className="bg-amber-400 text-[#1e3a5f] font-bold text-sm px-5 py-2 rounded-full hover:bg-amber-300 transition">
        新規登録
      </Link>
    </div>
  );
}
