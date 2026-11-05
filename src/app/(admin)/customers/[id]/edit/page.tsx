"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import CustomerForm from "@/components/CustomerForm";

export default function EditCustomerPage() {
  const { id } = useParams<{ id: string }>();
  const [customer, setCustomer] = useState<Record<string, unknown> | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [suspending, setSuspending] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch(`/api/customers/${id}`).then((r) => r.json()).then(setCustomer);
  }, [id]);

  const handleDelete = async () => {
    if (!confirm("この顧客を削除しますか？")) return;
    setDeleting(true);
    await fetch(`/api/customers/${id}`, { method: "DELETE" });
    router.push("/customers");
  };

  const handleToggleSuspend = async () => {
    const next = !customer?.suspended;
    if (!confirm(next ? "この顧客を停止しますか？ポータルにログインできなくなります。" : "この顧客の停止を解除しますか？")) return;
    setSuspending(true);
    const res = await fetch(`/api/customers/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ suspended: next }),
    });
    setSuspending(false);
    if (res.ok) setCustomer((prev) => (prev ? { ...prev, suspended: next } : prev));
  };

  if (!customer) return <div className="text-center py-20 text-gray-500">読み込み中...</div>;

  const isSuspended = Boolean(customer.suspended);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/customers" className="hover:text-blue-600">顧客管理</Link>
        <span>›</span>
        <span>{String(customer.name)}</span>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900">顧客編集</h1>
          {isSuspended && (
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-gray-200 text-gray-600">停止中</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleToggleSuspend} disabled={suspending}
            className={`text-sm border px-4 py-1.5 rounded-lg disabled:opacity-50 ${
              isSuspended
                ? "text-blue-600 border-blue-300 hover:bg-blue-50"
                : "text-gray-600 border-gray-300 hover:bg-gray-50"
            }`}>
            {suspending ? "処理中..." : isSuspended ? "停止を解除" : "停止"}
          </button>
          <button onClick={handleDelete} disabled={deleting}
            className="text-sm text-red-500 border border-red-300 hover:bg-red-50 px-4 py-1.5 rounded-lg disabled:opacity-50">
            {deleting ? "削除中..." : "削除"}
          </button>
        </div>
      </div>
      <CustomerForm
        customerId={Number(id)}
        initialData={{
          memberNumber: String(customer.memberNumber ?? ""),
          name: String(customer.name ?? ""),
          email: String(customer.email ?? ""),
          phone: String(customer.phone ?? ""),
          faxNumber: String(customer.faxNumber ?? ""),
          company: String(customer.company ?? ""),
          address: String(customer.address ?? ""),
          notes: String(customer.notes ?? ""),
        }}
      />
    </div>
  );
}
