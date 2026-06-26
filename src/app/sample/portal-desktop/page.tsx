"use client";
import { useState } from "react";

const navItems = [
  { href: "#", label: "発注依頼" },
  { href: "#", label: "発注管理" },
];

export default function PortalDesktopPreview() {
  const [active, setActive] = useState("発注依頼");

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-[#1e3a5f] text-white overflow-x-auto">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-nowrap items-center h-16 gap-6 min-w-full">
            <div className="flex-shrink-0">
              <span className="text-lg font-bold tracking-widest text-white whitespace-nowrap">OrderLink</span>
            </div>
            <div className="flex flex-nowrap items-center gap-3">
              {navItems.map((item) => (
                <button key={item.label} onClick={() => setActive(item.label)}
                  className={`whitespace-nowrap px-3 py-2 rounded text-sm font-medium transition-colors ${
                    active === item.label ? "bg-white/20 text-white" : "text-slate-300 hover:bg-white/10 hover:text-white"
                  }`}>
                  {item.label}
                </button>
              ))}
            </div>
            <div className="flex-1" />
            <a href="#" className="whitespace-nowrap text-slate-300 hover:text-white text-sm px-3 py-2 rounded hover:bg-white/10 transition-colors">お問合せ</a>
            <a href="#" className="whitespace-nowrap text-slate-300 hover:text-white text-sm px-3 py-2 rounded hover:bg-white/10 transition-colors">マニュアル</a>
            <span className="whitespace-nowrap text-white text-base font-semibold px-3 py-2">サンプル酒店</span>
            <button className="whitespace-nowrap text-slate-300 hover:text-white text-sm font-medium px-3 py-2 rounded hover:bg-white/10 transition-colors">ログアウト</button>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 py-6">
        <p className="text-sm text-gray-400 mb-6">※ これはデスクトップ表示のプレビューです（width=1280固定）</p>
        <div className="space-y-4">
          {[
            { name: "yamasan", size: "720ml", type: "純米大吟醸", price: 600, lot: 12 },
            { name: "さざ", size: "1800ml", type: "純米吟醸", price: 1000, lot: 6 },
            { name: "さざ", size: "720ml", type: "純米吟醸", price: 1000, lot: 12 },
          ].map((p, i) => (
            <div key={i} className="bg-white rounded-xl shadow p-5">
              <div className="flex items-center gap-3 mb-2">
                <span className="font-bold text-gray-900">{p.name}</span>
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{p.size}</span>
              </div>
              <p className="text-sm text-gray-500 mb-3">{p.type}</p>
              <p className="text-sm text-gray-600">卸売値 ¥{p.price.toLocaleString()} ロット {p.lot}</p>
              <div className="flex items-center gap-4 mt-3">
                <span className="text-sm text-gray-600">ケース数</span>
                <div className="flex items-center gap-3">
                  <button className="w-8 h-8 rounded-full border border-gray-300 text-gray-600 hover:bg-gray-50">−</button>
                  <span className="w-8 text-center font-medium">0</span>
                  <button className="w-8 h-8 rounded-full bg-[#1e3a5f] text-white hover:bg-[#2d5a8e]">+</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
