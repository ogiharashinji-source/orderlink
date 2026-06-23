"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

type CustomerData = {
  memberNumber: string;
  name: string;
  email: string;
  phone: string;
  faxNumber: string;
  company: string;
  address: string;
  notes: string;
};

type Props = {
  initialData?: Partial<CustomerData>;
  customerId?: number;
  onSuccess?: (id: number) => void;
};

const empty: CustomerData = { memberNumber: "", name: "", email: "", phone: "", faxNumber: "", company: "", address: "", notes: "" };

export default function CustomerForm({ initialData, customerId, onSuccess }: Props) {
  const [form, setForm] = useState<CustomerData>({ ...empty, ...initialData });
  const [saving, setSaving] = useState(false);
  const [emailError, setEmailError] = useState("");
  const router = useRouter();

  const set = (key: keyof CustomerData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    if (key === "email") setEmailError("");
  };

  const checkEmail = async () => {
    const email = form.email.trim();
    if (!email) return;
    const res = await fetch(`/api/customers?q=${encodeURIComponent(email)}`);
    if (!res.ok) return;
    const list: { id: number; email: string | null }[] = await res.json();
    const dup = list.find((c) => c.email === email && c.id !== customerId);
    if (dup) setEmailError("このメールアドレスはすでに登録されています");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (emailError) return;
    setSaving(true);
    const payload = Object.fromEntries(
      Object.entries(form).map(([k, v]) => [k, v === "" ? null : v])
    );
    const url = customerId ? `/api/customers/${customerId}` : "/api/customers";
    const method = customerId ? "PUT" : "POST";
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    if (onSuccess) {
      const data = await res.json();
      onSuccess(data.id);
    } else {
      router.push("/customers");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-4 max-w-2xl">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="会員NO"><input value={form.memberNumber} onChange={set("memberNumber")} placeholder="例: 0001" className={inputCls} /></Field>
        <Field label="会社名 *" required><input required value={form.name} onChange={set("name")} className={inputCls} /></Field>
        <div className="sm:col-span-2">
          <Field label="住所 *" required><input required value={form.address} onChange={set("address")} className={inputCls} /></Field>
        </div>
        <Field label="電話番号 *" required><input required value={form.phone} onChange={set("phone")} className={inputCls} /></Field>
        <Field label="FAX番号"><input value={form.faxNumber} onChange={set("faxNumber")} placeholder="03-XXXX-XXXX" className={inputCls} /></Field>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">メールアドレス <span className="text-red-500">*</span></label>
          <input
            type="email"
            required
            value={form.email}
            onChange={set("email")}
            onBlur={checkEmail}
            className={`${inputCls} ${emailError ? "border-yellow-400 bg-yellow-50 focus:ring-yellow-400" : ""}`}
          />
          {emailError && <p className="mt-1 text-xs text-yellow-700 font-medium">{emailError}</p>}
        </div>
      </div>
      <Field label="備考">
        <textarea value={form.notes} onChange={set("notes")} rows={3} className={inputCls} />
      </Field>
      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={saving || !!emailError} className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
          {saving ? "保存中..." : "保存"}
        </button>
        <button type="button" onClick={() => router.push("/customers")} className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg text-sm font-medium hover:bg-gray-50">
          キャンセル
        </button>
      </div>
    </form>
  );
}

const inputCls = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors";

function Field({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}{required && <span className="text-red-500 ml-1">*</span>}</label>
      {children}
    </div>
  );
}
