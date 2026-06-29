"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";

type Customer = {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  faxNumber: string | null;
  company: string | null;
  address: string | null;
  referralCode: string | null;
  loginId: string | null;
  inviteToken: string | null;
  memberNumber: string | null;
  customerNumber: number | null;
  approved: boolean;
  createdAt: string;
  joinedAt: string | null;
  approvedAt: string | null;
  _count: { orders: number };
};

function MemberNumberCell({ customer, onSaved }: { customer: Customer; onSaved: (id: number, value: string) => void }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(customer.memberNumber ?? "");
  const inputRef = useRef<HTMLInputElement>(null);

  const startEdit = () => {
    setValue(customer.memberNumber ?? "");
    setEditing(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const save = async () => {
    setEditing(false);
    const trimmed = value.trim();
    if (trimmed === (customer.memberNumber ?? "")) return;
    const res = await fetch(`/api/customers/${customer.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ memberNumber: trimmed || null }),
    });
    if (!res.ok) {
      const data = await res.json();
      alert(data.error ?? "保存に失敗しました");
      setValue(customer.memberNumber ?? "");
      return;
    }
    onSaved(customer.id, trimmed || "");
  };

  const cancel = () => {
    setEditing(false);
    setValue(customer.memberNumber ?? "");
  };

  if (editing) {
    return (
      <td className="px-2 py-2 text-center">
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={save}
          onKeyDown={(e) => { if (e.key === "Enter") save(); if (e.key === "Escape") cancel(); }}
          className="w-20 text-center text-xs border border-blue-400 rounded px-1 py-0.5 focus:outline-none focus:ring-2 focus:ring-blue-400 font-mono"
          placeholder="例: 0001"
        />
      </td>
    );
  }

  return (
    <td
      className="px-4 py-3 text-center text-xs font-mono cursor-pointer group"
      onClick={startEdit}
      title="クリックして編集"
    >
      {customer.memberNumber
        ? <span className="text-gray-700">{customer.memberNumber}</span>
        : <span className="text-gray-300 group-hover:text-blue-400">—</span>
      }
    </td>
  );
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const allCheckRef = useRef<HTMLInputElement>(null);

  const load = useCallback(() => {
    fetch(`/api/customers${query ? `?q=${encodeURIComponent(query)}` : ""}`)
      .then((r) => r.json())
      .then((data) => {
        setCustomers(data);
        setSelected(new Set());
      });
  }, [query]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!allCheckRef.current) return;
    allCheckRef.current.indeterminate = selected.size > 0 && selected.size < customers.length;
  }, [selected, customers]);

  const handleMemberNumberSaved = (id: number, value: string) => {
    setCustomers((prev) => prev.map((c) => c.id === id ? { ...c, memberNumber: value || null } : c));
  };

  const toggleAll = () => {
    if (selected.size === customers.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(customers.map((c) => c.id)));
    }
  };

  const toggleOne = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleApprove = async (id: number) => {
    if (!confirm("承認しますか？")) return;
    await fetch(`/api/customers/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ approved: true }),
    });
    window.location.reload();
  };

  const handleDelete = async (id: number) => {
    if (!confirm("削除しますか？")) return;
    await fetch(`/api/customers/${id}`, { method: "DELETE" });
    load();
  };

  const handleBulkDelete = async () => {
    if (selected.size === 0) return;
    if (!confirm(`選択した${selected.size}件の顧客を削除しますか？`)) return;
    setBulkDeleting(true);
    await Promise.all([...selected].map((id) => fetch(`/api/customers/${id}`, { method: "DELETE" })));
    setBulkDeleting(false);
    load();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 shrink-0">顧客管理</h1>
        <div className="flex items-center gap-2 flex-1">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && setQuery(search)}
            placeholder="顧客名・メール・会社名で検索..."
            style={{ width: "300px" }}
            className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={() => setQuery(search)}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700"
          >
            検索
          </button>
          {query && (
            <button
              onClick={() => { setSearch(""); setQuery(""); }}
              className="text-sm text-gray-500 hover:text-gray-700 px-2"
            >
              クリア
            </button>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleBulkDelete}
            disabled={selected.size === 0 || bulkDeleting}
            className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-red-500 hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {bulkDeleting ? "削除中..." : selected.size > 0 ? `${selected.size}件を削除` : "一斉削除"}
          </button>
          <Link href="/customers/new" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
            + 招待
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full text-sm whitespace-nowrap">
          <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
            <tr>
              <th className="px-3 py-3 text-center w-10">
                <input
                  ref={allCheckRef}
                  type="checkbox"
                  checked={customers.length > 0 && selected.size === customers.length}
                  onChange={toggleAll}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
              </th>
              <th className="px-4 py-3 text-center">登録日</th>
              <th className="px-4 py-3 text-center">会員コード</th>
              <th className="px-4 py-3 text-left">会社名</th>
              <th className="px-4 py-3 text-left">住所</th>
              <th className="px-4 py-3 text-left">電話番号</th>
              <th className="px-4 py-3 text-left">FAX番号</th>
              <th className="px-4 py-3 text-center">ステータス</th>
              <th className="px-4 py-3 text-right">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {customers.length === 0 ? (
              <tr><td colSpan={9} className="text-center py-8 text-gray-400">顧客データがありません</td></tr>
            ) : (
              customers.map((c, idx) => {
                const isChecked = selected.has(c.id);
                const rowBg = isChecked ? "bg-blue-50" : idx % 2 === 1 ? "bg-gray-50" : "bg-white";
                return (
                  <tr key={c.id} className={`${rowBg}`}>
                    <td className="px-3 py-3 text-center">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleOne(c.id)}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                    </td>
                    <td className="px-4 py-3 text-center text-gray-500 text-sm whitespace-nowrap">
                      {c.approved && c.approvedAt
                        ? new Date(c.approvedAt).toLocaleDateString("ja-JP")
                        : new Date(c.joinedAt ?? c.createdAt).toLocaleDateString("ja-JP")}
                    </td>
                    <MemberNumberCell customer={c} onSaved={handleMemberNumberSaved} />
                    <td className="px-4 py-3 text-gray-900">{c.name}</td>
                    <td className="px-4 py-3 text-gray-600">{c.address ?? "—"}</td>
                    <td className="px-4 py-3 text-gray-600">{c.phone ?? "—"}</td>
                    <td className="px-4 py-3 text-gray-600">{c.faxNumber ?? "—"}</td>
                    <td className="px-4 py-3 text-center">
                      {c.approved
                        ? <span className="text-xs text-gray-400">承認済</span>
                        : <button onClick={() => handleApprove(c.id)} className="text-xs font-bold px-3 py-1 rounded-full bg-red-500 text-white hover:bg-red-600">未承認</button>}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => handleDelete(c.id)} className="text-red-500 hover:underline text-xs">削除</button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
