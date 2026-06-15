"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import StatusBadge from "@/components/StatusBadge";

type DashboardData = {
  totalCustomers: number;
  totalOrders: number;
  totalProducts: number;
  recentOrders: Array<{
    id: number;
    orderNumber: string;
    status: string;
    totalAmount: number;
    orderDate: string;
    customer: { name: string };
  }>;
  statusCounts: Record<string, number>;
};

const STATUS_ORDER = ["PENDING", "CONFIRMED", "IN_PROGRESS", "SHIPPED", "DELIVERED", "CANCELLED"];

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/customers").then((r) => r.json()),
      fetch("/api/orders").then((r) => r.json()),
      fetch("/api/products").then((r) => r.json()),
    ]).then(([customers, orders, products]) => {
      const statusCounts: Record<string, number> = {};
      for (const o of orders) {
        statusCounts[o.status] = (statusCounts[o.status] ?? 0) + 1;
      }
      setData({
        totalCustomers: customers.length,
        totalOrders: orders.length,
        totalProducts: products.length,
        recentOrders: orders.slice(0, 5),
        statusCounts,
      });
    });
  }, []);

  if (!data) return <div className="text-center py-20 text-gray-500">読み込み中...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">ダッシュボード</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <SummaryCard label="顧客数" value={data.totalCustomers} href="/customers" color="blue" />
        <SummaryCard label="発注数" value={data.totalOrders} href="/orders" color="purple" />
        <SummaryCard label="商品数" value={data.totalProducts} href="/products" color="green" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-5">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">ステータス別発注数</h2>
          <div className="space-y-2">
            {STATUS_ORDER.map((s) => (
              <div key={s} className="flex items-center justify-between">
                <StatusBadge status={s} />
                <span className="font-semibold text-gray-700">{data.statusCounts[s] ?? 0} 件</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">最近の発注</h2>
            <Link href="/orders" className="text-sm text-blue-600 hover:underline">すべて見る</Link>
          </div>
          {data.recentOrders.length === 0 ? (
            <p className="text-gray-500 text-sm">発注データがありません</p>
          ) : (
            <div className="divide-y">
              {data.recentOrders.map((o) => (
                <div key={o.id} className="py-2 flex items-center justify-between gap-2">
                  <div>
                    <Link href={`/orders/${o.id}`} className="text-sm font-medium text-blue-700 hover:underline">{o.orderNumber}</Link>
                    <p className="text-xs text-gray-500">{o.customer.name}</p>
                  </div>
                  <div className="text-right">
                    <StatusBadge status={o.status} />
                    <p className="text-xs text-gray-500 mt-1">¥{o.totalAmount.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ label, value, href, color }: { label: string; value: number; href: string; color: string }) {
  const colors: Record<string, string> = {
    blue: "bg-blue-600",
    purple: "bg-purple-600",
    green: "bg-green-600",
  };
  return (
    <Link href={href} className="bg-white rounded-lg shadow p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
      <div className={`w-12 h-12 rounded-full ${colors[color]} flex items-center justify-center text-white text-xl font-bold`}>
        {value}
      </div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
      </div>
    </Link>
  );
}
