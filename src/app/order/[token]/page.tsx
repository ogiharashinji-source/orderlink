"use client";
import { useEffect } from "react";

// このページは現在未使用。アクセスされたらポータルへリダイレクト。
export default function OrderPage() {
  useEffect(() => {
    window.location.href = "/portal/login";
  }, []);
  return null;
}
