"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Profile = {
  name: string;
  company: string | null;
  phone: string | null;
  faxNumber: string | null;
  email: string | null;
  address: string | null;
  loginId: string | null;
};

const inputCls = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

export default function PortalProfilePage() {
  const [form, setForm] = useState<Profile>({ name: "", company: null, phone: null, faxNumber: null, email: null, address: null, loginId: null });
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [changingPw, setChangingPw] = useState(false);
  const [pwChanged, setPwChanged] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/customer/me").then((r) => { if (!r.ok) { router.push("/portal/login"); return null; } return r.json(); })
      .then((d) => d && fetch("/api/portal/profile").then((r) => r.json()).then((profile) => {
        setForm({
          name: profile.name ?? "",
          company: profile.company ?? "",
          phone: profile.phone ?? "",
          faxNumber: profile.faxNumber ?? "",
          email: profile.email ?? "",
          address: profile.address ?? "",
          loginId: profile.loginId ?? "",
        });
      }));
  }, [router]);

  const set = (key: keyof Profile) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const handlePasswordChange = async () => {
    if (!currentPassword) { alert("現在のパスワードを入力してください"); return; }
    if (password.length < 6) { alert("新しいパスワードは6文字以上で入力してください"); return; }
    if (password !== confirmPassword) { alert("新しいパスワードと確認用パスワードが一致しません"); return; }
    if (!confirm("パスワードを変更しますか？")) return;
    setChangingPw(true);
    const res = await fetch("/api/portal/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...Object.fromEntries(Object.entries(form).map(([k, v]) => [k, v === "" ? null : v])), password, currentPassword }),
    });
    if (res.ok) {
      setPwChanged(true); setCurrentPassword(""); setPassword(""); setConfirmPassword("");
      setTimeout(() => setPwChanged(false), 3000);
    } else {
      const data = await res.json();
      alert(data.error ?? "変更に失敗しました");
    }
    setChangingPw(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirm("会員情報を更新しますか？")) return;
    setSaving(true);
    const payload: Record<string, string | null> = Object.fromEntries(
      Object.entries(form).map(([k, v]) => [k, v === "" ? null : v])
    );
    const res = await fetch("/api/portal/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      setSaved(true); setCurrentPassword(""); setPassword(""); setConfirmPassword("");
      setTimeout(() => setSaved(false), 3000);
    } else {
      const data = await res.json();
      alert(data.error ?? "保存に失敗しました");
    }
    setSaving(false);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900">会員情報</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-6 space-y-4 max-w-2xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">会社名 <span className="text-red-500">*</span></label>
            <input required value={form.name} onChange={set("name")} className={inputCls} />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">住所 <span className="text-red-500">*</span></label>
          <input required value={form.address ?? ""} onChange={set("address")} className={inputCls} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">電話番号 <span className="text-red-500">*</span></label>
            <input required value={form.phone ?? ""} onChange={set("phone")} className={inputCls} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">FAX番号</label>
            <input value={form.faxNumber ?? ""} onChange={set("faxNumber")} className={inputCls} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">メールアドレス <span className="text-red-500">*</span></label>
            <input required type="email" value={form.email ?? ""} onChange={set("email")} className={inputCls} />
          </div>
        </div>

        <div className="border-t pt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ログインID</label>
            <input value={form.loginId ?? ""} readOnly className={`${inputCls} bg-gray-50 text-gray-500`} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">現在のパスワード</label>
            <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="パスワードを変更する場合のみ入力" className={inputCls} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">新しいパスワード <span className="text-xs text-gray-400">（6文字以上）</span></label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="8文字以上" className={inputCls} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">新しいパスワード（確認）</label>
            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="もう一度入力" className={inputCls} />
          </div>
          <div className="flex items-center gap-4">
            <button type="button" onClick={handlePasswordChange} disabled={changingPw || !currentPassword || !password || !confirmPassword}
              className="px-5 py-2 rounded-lg text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-40">
              {changingPw ? "変更中..." : "変更"}
            </button>
            {pwChanged && <p className="text-sm text-green-600">パスワードを変更しました</p>}
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
