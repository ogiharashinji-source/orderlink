"use client";
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from "@/lib/constants";

export default function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${ORDER_STATUS_COLORS[status] ?? "bg-gray-100 text-gray-800"}`}>
      {ORDER_STATUS_LABELS[status] ?? status}
    </span>
  );
}
