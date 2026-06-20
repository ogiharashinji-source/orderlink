"use client";

export default function BackButton({ label = "トップへ戻る" }: { label?: string }) {
  return (
    <button
      onClick={() => window.history.back()}
      className="hover:underline text-gray-500 cursor-pointer text-sm"
    >
      {label}
    </button>
  );
}
