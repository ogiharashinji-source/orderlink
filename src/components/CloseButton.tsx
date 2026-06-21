"use client";

export default function CloseButton() {
  return (
    <button
      onClick={() => window.close()}
      className="hover:underline text-blue-500 cursor-pointer text-sm"
    >
      閉じる
    </button>
  );
}
