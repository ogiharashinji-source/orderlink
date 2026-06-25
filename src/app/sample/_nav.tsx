export function SampleNav({ active }: { active: string }) {
  const items = ["リクエスト", "受注", "商品", "顧客", "メール送信"];
  return (
    <nav className="bg-[#1e3a5f] text-white px-6 py-3 flex items-center gap-6 text-sm">
      <span className="font-bold text-base tracking-widest mr-4">OrderLink</span>
      {items.map((n) => (
        <span key={n} className={`cursor-pointer ${n === active ? "border-b-2 border-amber-400 pb-1 font-bold" : "opacity-70"}`}>{n}</span>
      ))}
      <span className="ml-auto opacity-70 text-xs">〇〇酒造株式会社</span>
      <span className="opacity-70 text-xs">ログアウト</span>
    </nav>
  );
}
