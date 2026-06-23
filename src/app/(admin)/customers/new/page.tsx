"use client";
import { useState, useRef } from "react";
import Link from "next/link";
import * as XLSX from "xlsx";

type ImportRow = {
  memberNumber: string;
  name: string;
  phone: string;
  faxNumber: string;
  email: string;
  loginId: string;
  password: string;
  status: "pending" | "loading" | "done" | "error";
  errorMsg?: string;
};

export default function InviteCustomerPage() {
  const [mode, setMode] = useState<"single" | "bulk">("single");

  // single
  const [email, setEmail] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [sending, setSending] = useState(false);
  const [sentEmail, setSentEmail] = useState("");
  const [singleError, setSingleError] = useState("");

  // bulk
  const [rows, setRows] = useState<ImportRow[]>([]);
  const [importing, setImporting] = useState(false);
  const [imported, setImported] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- single ---
  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { setSingleError("メールアドレスを入力してください"); return; }
    setSingleError("");
    setConfirming(true);
  };

  const handleSingleSubmit = async () => {
    setSending(true);
    const res = await fetch("/api/customers/invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setSending(false);
    if (res.ok) {
      setConfirming(false);
      setSentEmail(email);
    } else {
      const data = await res.json();
      setConfirming(false);
      setSingleError(data.error ?? "送信に失敗しました");
    }
  };

  // --- bulk ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const data = new Uint8Array(ev.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const json: (string | number | null)[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });

      const header = (json[0] ?? []).map((h) => String(h ?? "").toLowerCase());

      const findCol = (...keywords: string[]) =>
        header.findIndex((h) => keywords.some((k) => h.includes(k)));

      const memberNumberCol = findCol("会員コード", "会員no", "コード", "member");
      const nameCol = findCol("会社名", "name", "名前");
      const phoneCol = findCol("電話", "phone", "tel");
      const faxCol = findCol("fax", "ファックス", "ＦＡＸ");
      const emailCol = findCol("メール", "email", "mail");

      const parsed: ImportRow[] = json
        .slice(1)
        .map((row) => {
          const get = (col: number) => (col >= 0 ? String(row[col] ?? "").trim() : "");
          const phone = get(phoneCol);
          const loginId = phone.replace(/\D/g, "");
          return {
            memberNumber: get(memberNumberCol),
            name: get(nameCol >= 0 ? nameCol : 1),
            phone,
            faxNumber: get(faxCol),
            email: get(emailCol),
            loginId,
            password: "",
            status: "pending" as const,
          };
        })
        .filter((r) => r.name);

      setRows(parsed);
      setImported(false);
    };
    reader.readAsArrayBuffer(file);
  };

  const handleImport = async () => {
    if (!rows.length) return;
    setImporting(true);
    const res = await fetch("/api/customers/bulk-import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customers: rows.map((r) => ({
          memberNumber: r.memberNumber || null,
          name: r.name,
          phone: r.phone,
          faxNumber: r.faxNumber || null,
          email: r.email || null,
        })),
      }),
    });
    setImporting(false);
    if (res.ok) {
      const data = await res.json();
      setRows(
        data.results.map((r: ImportRow & { status: string }) => ({
          ...r,
          status: r.status as ImportRow["status"],
        }))
      );
      setImported(true);
    }
  };

  const handleCopyAll = () => {
    const lines = rows
      .filter((r) => r.status === "done")
      .map((r) => `${r.memberNumber || "—"}\t${r.name}\t${r.loginId}\t${r.password}`)
      .join("\n");
    navigator.clipboard.writeText("会員コード\t会社名\tログインID\tパスワード\n" + lines);
    alert("コピーしました");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/customers" className="hover:text-blue-600">顧客管理</Link>
        <span>›</span>
        <span>顧客招待</span>
      </div>
      <h1 className="text-2xl font-bold text-gray-900">顧客登録</h1>

      <div className="flex gap-2 border-b border-gray-200">
        {(["single", "bulk"] as const).map((m) => (
          <button key={m} onClick={() => setMode(m)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              mode === m ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"
            }`}>
            {m === "single" ? "招待メールを送信" : "Excelから一括登録"}
          </button>
        ))}
      </div>

      {/* single */}
      {mode === "single" && (
        <div className="bg-white rounded-lg shadow p-6 max-w-md">
          {sentEmail ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-green-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                <p className="font-semibold">招待メールを送信しました</p>
              </div>
              <p className="text-sm text-gray-600"><span className="font-medium">{sentEmail}</span> に登録用URLを送信しました。</p>
              <p className="text-xs text-gray-400">有効期限：24時間</p>
              <div className="flex gap-3 pt-2">
                <button onClick={() => { setSentEmail(""); setEmail(""); setConfirming(false); }}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
                  続けて招待する
                </button>
                <Link href="/customers"
                  className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50">
                  顧客管理に戻る
                </Link>
              </div>
            </div>
          ) : confirming ? (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">以下の内容で招待メールを送信します。</p>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                <div className="flex gap-2">
                  <span className="text-gray-500 w-32 shrink-0">送信先</span>
                  <span className="font-medium text-gray-900">{email}</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-gray-500 w-32 shrink-0">内容</span>
                  <span className="text-gray-700">ポータルへの登録招待リンク（有効期限24時間）</span>
                </div>
              </div>
              <div className="flex gap-3 pt-1">
                <button onClick={handleSingleSubmit} disabled={sending}
                  className="flex-1 py-2.5 rounded-lg text-sm font-bold text-white disabled:opacity-50"
                  style={{ background: "#1e3a8a" }}>
                  {sending ? "送信中..." : "送信する"}
                </button>
                <button onClick={() => setConfirming(false)} disabled={sending}
                  className="flex-1 py-2.5 rounded-lg text-sm font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50">
                  戻る
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleConfirm} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  メールアドレス <span className="text-red-500">*</span>
                </label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@company.com"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              {singleError && <p className="text-sm text-red-500">{singleError}</p>}
              <button type="submit"
                className="w-full py-2.5 rounded-lg text-sm font-bold text-white"
                style={{ background: "#1e3a8a" }}>
                確認する
              </button>
            </form>
          )}
        </div>
      )}

      {/* bulk */}
      {mode === "bulk" && (
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <div className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3 space-y-1">
            <p className="font-medium">Excelの列（1行目はヘッダー）</p>
            <p>A列: <strong>会員コード</strong>　B列: <strong>会社名</strong>　C列: <strong>電話番号</strong>　D列: <strong>FAX番号</strong>　E列: <strong>メールアドレス</strong>（任意）</p>
            <p className="text-gray-400">ログインID = 電話番号の数字のみ　／　パスワード = 000001 から連番</p>
          </div>

          {!imported && (
            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-400 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <svg className="w-10 h-10 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-sm text-gray-500">クリックしてExcelファイルを選択</p>
              <p className="text-xs text-gray-400 mt-1">.xlsx / .xls</p>
              <input ref={fileInputRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={handleFileChange} />
            </div>
          )}

          {rows.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-700">
                  {imported
                    ? `${rows.filter((r) => r.status === "done").length}件登録完了`
                    : `${rows.length}件読み込みました`}
                </p>
                {imported && (
                  <button onClick={handleCopyAll}
                    className="text-sm text-blue-600 border border-blue-600 px-3 py-1 rounded-lg hover:bg-blue-50">
                    全件コピー（会員コード・会社名・ID・パスワード）
                  </button>
                )}
              </div>

              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-gray-600">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium">会員コード</th>
                      <th className="px-3 py-2 text-left font-medium">会社名</th>
                      <th className="px-3 py-2 text-left font-medium">電話番号</th>
                      <th className="px-3 py-2 text-left font-medium">FAX番号</th>
                      <th className="px-3 py-2 text-left font-medium">ログインID</th>
                      {imported && <th className="px-3 py-2 text-left font-medium">パスワード</th>}
                      <th className="px-3 py-2 text-left font-medium">状態</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {rows.map((row, i) => (
                      <tr key={i}>
                        <td className="px-3 py-2 text-gray-700 font-mono">{row.memberNumber || "—"}</td>
                        <td className="px-3 py-2 text-gray-700">{row.name}</td>
                        <td className="px-3 py-2 text-gray-500">{row.phone || "—"}</td>
                        <td className="px-3 py-2 text-gray-500">{row.faxNumber || "—"}</td>
                        <td className="px-3 py-2 text-gray-700 font-mono">{row.loginId || "—"}</td>
                        {imported && (
                          <td className="px-3 py-2 text-gray-700 font-mono">{row.password || "—"}</td>
                        )}
                        <td className="px-3 py-2">
                          {row.status === "pending" && <span className="text-gray-400">—</span>}
                          {row.status === "loading" && <span className="text-blue-500">登録中...</span>}
                          {row.status === "done" && <span className="text-green-600 font-medium">完了</span>}
                          {row.status === "error" && (
                            <span className="text-red-500 text-xs">{row.errorMsg ?? "エラー"}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {!imported && (
                <button onClick={handleImport} disabled={importing}
                  className="w-full py-2.5 rounded-lg text-sm font-bold text-white disabled:opacity-50"
                  style={{ background: "#1e3a8a" }}>
                  {importing ? "登録中..." : `${rows.length}件を一括登録する`}
                </button>
              )}

              {imported && (
                <Link href="/customers"
                  className="block text-center border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50">
                  顧客管理に戻る
                </Link>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
