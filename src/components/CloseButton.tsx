"use client";
import { useEffect, useState } from "react";

export default function CloseButton() {
  const [canGoBack, setCanGoBack] = useState(false);

  useEffect(() => {
    setCanGoBack(window.history.length > 1);
  }, []);

  const handleClick = () => {
    if (canGoBack) {
      window.history.back();
    } else {
      window.close();
    }
  };

  return (
    <button
      onClick={handleClick}
      className="hover:underline text-blue-500 cursor-pointer text-sm"
    >
      {canGoBack ? "戻る" : "閉じる"}
    </button>
  );
}
