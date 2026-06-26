"use client";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import LandingHeaderActions from "@/components/LandingHeaderActions";

export default function ManualHeader() {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/api/admin/nav", { redirect: "manual" })
      .then((r) => setIsAdmin(r.ok))
      .catch(() => setIsAdmin(false));
  }, []);

  if (isAdmin === null) {
    return (
      <header className="bg-[#1e3a5f] text-white px-4 sm:px-6 py-4 flex items-center justify-between gap-2" style={{ height: 64 }} />
    );
  }

  if (isAdmin) {
    return <Navbar />;
  }

  return (
    <header className="bg-[#1e3a5f] text-white px-4 sm:px-6 py-4 flex items-center justify-between gap-2">
      <a href="/" className="flex-shrink-0 leading-tight">
        <div className="flex items-baseline gap-2">
          <span className="text-lg sm:text-xl font-bold tracking-widest">OrderLink</span>
          <span className="hidden sm:inline text-xs opacity-70">オーダーリンク</span>
        </div>
        <p className="sm:hidden text-[10px] opacity-70 tracking-widest">オーダーリンク</p>
      </a>
      <LandingHeaderActions />
    </header>
  );
}
