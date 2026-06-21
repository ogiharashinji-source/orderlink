"use client";

export default function BackButton({ label = "戻る" }: { label?: string }) {
  return (
    <button
      onClick={() => window.history.back()}
      className="hover:underline text-blue-500 cursor-pointer text-sm"
    >
      {label}
    </button>
  );
}
