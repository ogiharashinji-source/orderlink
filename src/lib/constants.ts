export const ORDER_STATUS_LABELS: Record<string, string> = {
  PENDING: "受付中",
  CONFIRMED: "確認済",
  IN_PROGRESS: "処理中",
  SHIPPED: "出荷済",
  DELIVERED: "納品済",
  CANCELLED: "キャンセル",
};

export const ORDER_STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  IN_PROGRESS: "bg-purple-100 text-purple-800",
  SHIPPED: "bg-orange-100 text-orange-800",
  DELIVERED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
};
