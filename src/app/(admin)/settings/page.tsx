"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const inputCls = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

export default function SettingsPage() {
  const [form, setForm] = useState({ companyName: "", address: "", phone: "", faxNumber: "", email: "" });
  const [creds, setCreds] = useState({ currentLoginId: "", currentPassword: "", newLoginId: "", newPassword: "" });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [changingCreds, setChangingCreds] = useState(false);
  const [credsChanged, setCredsChanged] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/admin/settings").then((r) => {
      if (!r.ok) { router.push("/admin/login"); return null; }
      return r.json();
    }).then((d) => {
      if (!d) return;
      setForm({
        companyName: d.companyName ?? "",
        address: d.address ?? "",
        phone: d.phone ?? "",
        faxNumber: d.faxNumber ?? "",
        email: d.email ?? "",
      });
    });
  }, [router]);

  const setF = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const setC = (key: keyof typeof creds) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setCreds((c) => ({ ...c, [key]: e.target.value }));

  const handleSaveInfo = async () => {
    if (!form.companyName) { alert("会社名を入力してください"); return; }
    if (!confirm("会社情報を登録しますか？")) return;
    setSaving(true);
    const res = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        companyName: form.companyName,
        address: form.address || null,
        phone: form.phone || null,
        faxNumber: form.faxNumber || null,
        email: form.email || null,
      }),
    });
    setSaving(false);
    if (res.status === 401) { router.push("/admin/login"); return; }
    if (res.ok) { setSaved(true); setTimeout(() => setSaved(false), 3000); }
    else { const d = await res.json(); alert(d.error ?? "保存に失敗しました"); }
  };

  const handleChangeCreds = async () => {
    if (creds.newPassword.length < 6) { alert("新しいパスワードは6文字以上で入力してください"); return; }
    if (!confirm("ID・パスワードを変更しますか？")) return;
    setChangingCreds(true);
    const res = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        currentLoginId: creds.currentLoginId,
        currentPassword: creds.currentPassword,
        newLoginId: creds.newLoginId,
        newPassword: creds.newPassword,
      }),
    });
    setChangingCreds(false);
    if (res.ok) {
      setCredsChanged(true);
      setCreds({ currentLoginId: "", currentPassword: "", newLoginId: "", newPassword: "" });
      setTimeout(() => setCredsChanged(false), 3000);
    } else {
      const d = await res.json();
      alert(d.error ?? "変更に失敗しました");
    }
  };

  const credsReady = creds.currentLoginId && creds.currentPassword && creds.newLoginId && creds.newPassword;

  const handleLogout = async () => {
    if (!confirm("ログアウトしますか？")) return;
    await fetch("/api/auth/logout", { method: "POST" });
    localStorage.removeItem("landing_auth");
    localStorage.removeItem("nav_company");
    window.location.href = "/admin/login";
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">マイページ</h1>
        <button onClick={handleLogout} className="text-sm text-red-500 hover:text-red-700 font-medium">ログアウト</button>
      </div>

      <div className="bg-white rounded-xl shadow p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">会社名 <span className="text-red-500">*</span></label>
          <input value={form.companyName} onChange={setF("companyName")} className={inputCls} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">住所</label>
          <input value={form.address} onChange={setF("address")} className={inputCls} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">電話番号</label>
            <input value={form.phone} onChange={setF("phone")} className={inputCls} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">FAX番号</label>
            <input value={form.faxNumber} onChange={setF("faxNumber")} className={inputCls} />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">メールアドレス</label>
          <input type="email" value={form.email} onChange={setF("email")} className={inputCls} />
        </div>
        <div className="flex items-center gap-4 pt-1">
          <button type="button" onClick={handleSaveInfo} disabled={saving}
            className="px-6 py-2 rounded-lg text-sm font-bold text-white disabled:opacity-50" style={{ background: "#1e3a8a" }}>
            {saving ? "保存中..." : "登録する"}
          </button>
          {saved && <p className="text-sm text-green-600">保存しました</p>}
        </div>

        <div className="border-t pt-4 space-y-4">
          <p className="text-sm font-medium text-gray-700">ID・パスワードの変更</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">現在のID</label>
              <input value={creds.currentLoginId} onChange={setC("currentLoginId")} className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">現在のパスワード</label>
              <input type="password" value={creds.currentPassword} onChange={setC("currentPassword")} className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">新しいID</label>
              <input value={creds.newLoginId} onChange={setC("newLoginId")} className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">新しいパスワード <span className="text-xs text-gray-400">（6文字以上）</span></label>
              <input type="password" value={creds.newPassword} onChange={setC("newPassword")} className={inputCls} />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button type="button" onClick={handleChangeCreds} disabled={changingCreds || !credsReady}
              className="px-5 py-2 rounded-lg text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-40">
              {changingCreds ? "変更中..." : "変更する"}
            </button>
            {credsChanged && <p className="text-sm text-green-600">ID・パスワードを変更しました</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
