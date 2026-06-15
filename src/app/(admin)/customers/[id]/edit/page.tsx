"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import CustomerForm from "@/components/CustomerForm";

export default function EditCustomerPage() {
  const { id } = useParams<{ id: string }>();
  const [customer, setCustomer] = useState<Record<string, unknown> | null>(null);
  const [deleting, setDeleting] = useState(false);
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

  if (!customer) return <div className="text-center py-20 text-gray-500">読み込み中...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/customers" className="hover:text-blue-600">顧客管理</Link>
        <span>›</span>
        <span>{String(customer.name)}</span>
      </div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">顧客編集</h1>
        <button onClick={handleDelete} disabled={deleting}
          className="text-sm text-red-500 border border-red-300 hover:bg-red-50 px-4 py-1.5 rounded-lg disabled:opacity-50">
          {deleting ? "削除中..." : "削除"}
        </button>
      </div>
      <CustomerForm
        customerId={Number(id)}
        initialData={{
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
