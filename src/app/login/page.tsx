"use client";
import Link from "next/link";

export default function TopPage() {
  return (
    <div className="min-h-screen bg-slate-800 flex items-center justify-center px-4">
      <div className="w-full max-w-sm text-center space-y-8">
        <h1 className="text-3xl font-bold text-white tracking-wide">OderLink</h1>

        <div className="space-y-4">
          <Link
            href="/admin/login"
            className="block w-full bg-white text-slate-800 py-3 rounded-xl text-sm font-bold hover:bg-slate-100 transition-colors shadow-lg"
          >
            酒蔵はこちら
          </Link>
        </div>
      </div>
    </div>
  );
}
