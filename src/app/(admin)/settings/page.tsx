"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Setting = {
  companyName: string;
  address: string | null;
  phone: string | null;
  faxNumber: string | null;
  email: string | null;
  loginId: string;
  currentPassword: string;
  password: string;
  confirmPassword: string;
};

const inputCls = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

export default function SettingsPage() {
  const [form, setForm] = useState<Setting>({
    companyName: "", address: "", phone: "", faxNumber: "", email: "", loginId: "", currentPassword: "", password: "", confirmPassword: "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/admin/settings").then((r) => {
      if (!r.ok) { router.push("/admin/login"); return null; }
      return r.json();
    }).then((d) => {
      if (!d) return;
      setForm((f) => ({
        ...f,
        companyName: d.companyName ?? "",
        address: d.address ?? "",
        phone: d.phone ?? "",
        faxNumber: d.faxNumber ?? "",
        email: d.email ?? "",
        loginId: d.loginId ?? "",
      }));
    });
  }, []);

  const set = (key: keyof Setting) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password) {
      if (!form.currentPassword) { alert("現在のパスワードを入力してください"); return; }
      if (form.password.length < 6) { alert("新しいパスワードは6文字以上で入力してください"); return; }
      if (form.password !== form.confirmPassword) { alert("新しいパスワードと確認用パスワードが一致しません"); return; }
    }
    if (!confirm("設定を保存しますか？")) return;
    setSaving(true);
    const payload: Record<string, string | null> = {
      companyName: form.companyName,
      address: form.address || null,
      phone: form.phone || null,
      faxNumber: form.faxNumber || null,
      email: form.email || null,
    };
    if (form.loginId) payload.loginId = form.loginId;
    if (form.password) { payload.password = form.password; payload.currentPassword = form.currentPassword; }
    const res = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setSaving(false);
    if (res.status === 401 || res.redirected) { router.push("/admin/login"); return; }
    if (res.ok) {
      setSaved(true);
      setForm((f) => ({ ...f, currentPassword: "", password: "", confirmPassword: "" }));
      setTimeout(() => setSaved(false), 3000);
    } else {
      const data = await res.json();
      alert(data.error ?? "保存に失敗しました");
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900">マイページ</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">会社名 <span className="text-red-500">*</span></label>
          <input required value={form.companyName} onChange={set("companyName")} className={inputCls} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">住所 <span className="text-red-500">*</span></label>
          <input required value={form.address ?? ""} onChange={set("address")} className={inputCls} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">電話番号 <span className="text-red-500">*</span></label>
            <input required value={form.phone ?? ""} onChange={set("phone")} className={inputCls} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">FAX番号</label>
            <input value={form.faxNumber ?? ""} onChange={set("faxNumber")} className={inputCls} />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">メールアドレス <span className="text-red-500">*</span></label>
          <input required type="email" value={form.email ?? ""} onChange={set("email")} className={inputCls} />
        </div>
        <div className="border-t pt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ID</label>
            <input value={form.loginId} onChange={set("loginId")} className={inputCls} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">現在のパスワード</label>
            <input type="password" value={form.currentPassword} onChange={set("currentPassword")} placeholder="パスワードを変更する場合のみ入力" className={inputCls} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">新しいパスワード <span className="text-xs text-gray-400">（6文字以上）</span></label>
            <input type="password" value={form.password} onChange={set("password")} placeholder="8文字以上" className={inputCls} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">新しいパスワード（確認）</label>
            <input type="password" value={form.confirmPassword} onChange={set("confirmPassword")} placeholder="もう一度入力" className={inputCls} />
          </div>
        </div>

        <div className="flex items-center gap-4 pt-2">
          <button type="submit" disabled={saving}
            className="px-6 py-2 rounded-lg text-sm font-bold text-white disabled:opacity-50" style={{ background: "#1e3a8a" }}>
            {saving ? "保存中..." : "保存する"}
          </button>
          {saved && <p className="text-sm text-green-600">保存しました</p>}
        </div>
      </form>
    </div>
  );
}
