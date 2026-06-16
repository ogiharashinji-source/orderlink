"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const CATEGORIES = [
  "純米大吟醸", "大吟醸", "純米吟醸", "吟醸酒",
  "純米酒", "本醸造", "普通酒", "リキュール", "その他",
];

type ProductData = {
  name: string;
  category: string;
  sakaMai: string;
  seimaiWari: string;
  alcohol: string;
  description: string;
  price1800: string;
  unit1800: string;
  stock1800: string;
  price720: string;
  unit720: string;
  stock720: string;
};

type Props = {
  initialData?: Partial<ProductData>;
  productId?: number;
};

const empty: ProductData = {
  name: "", category: "", sakaMai: "", seimaiWari: "", alcohol: "",
  description: "",
  price1800: "", unit1800: "6", stock1800: "0",
  price720: "",  unit720: "12", stock720: "0",
};

export default function ProductForm({ initialData, productId }: Props) {
  const [form, setForm] = useState<ProductData>({ ...empty, ...initialData });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const router = useRouter();

  const toHalf = (str: string) =>
    str.replace(/[！-～]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xFEE0)).replace(/　/g, " ");

  const set = (key: keyof ProductData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  const blur = (key: keyof ProductData) =>
    (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [key]: toHalf(e.target.value) }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: string[] = [];
    if (form.price1800 && (parseInt(form.stock1800) || 0) === 0) errs.push("1800ml の数量を入力してください");
    if (form.price720  && (parseInt(form.stock720)  || 0) === 0) errs.push("720ml の数量を入力してください");
    if (!form.price1800 && !form.price720) errs.push("1800ml または 720ml の単価を入力してください");
    if (errs.length > 0) { setErrors(errs); return; }
    setErrors([]);
    setSaving(true);
    const payload = {
      name: form.name,
      category: form.category || null,
      sakaMai: form.sakaMai || null,
      seimaiWari: form.seimaiWari || null,
      alcohol: form.alcohol || null,
      description: form.description || null,
      price1800: form.price1800 ? parseFloat(form.price1800) : null,
      unit1800: form.unit1800 || "本",
      stock1800: parseInt(form.stock1800) || 0,
      price720: form.price720 ? parseFloat(form.price720) : null,
      unit720: form.unit720 || "本",
      stock720: parseInt(form.stock720) || 0,
      price: parseFloat(form.price1800 || form.price720 || "0") || 0,
      unit: form.unit1800 || "本",
      stock: (parseInt(form.stock1800) || 0) + (parseInt(form.stock720) || 0),
    };
    const url = productId ? `/api/products/${productId}` : "/api/products";
    const method = productId ? "PUT" : "POST";
    await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    router.push("/products");
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-5 max-w-2xl">
      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-300 rounded-lg px-4 py-3 space-y-1">
          {errors.map((err) => (
            <p key={err} className="text-sm text-red-600 font-medium">⚠ {err}</p>
          ))}
        </div>
      )}
      {/* 商品名 */}
      <Field label="商品名" required>
        <input required value={form.name} onChange={set("name")} onBlur={blur("name")} className={inputCls} />
      </Field>

      {/* 種別・酒米・精米歩合・アルコール */}
      <div className="grid grid-cols-2 gap-4">
        <Field label="種別">
          <select value={form.category} onChange={set("category")} className={inputCls}>
            <option value="">選択してください</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </Field>
        <Field label="酒米">
          <input value={form.sakaMai} onChange={set("sakaMai")} onBlur={blur("sakaMai")} placeholder="例：山田錦" className={inputCls} />
        </Field>
        <Field label="精米歩合">
          <input value={form.seimaiWari} onChange={set("seimaiWari")} onBlur={blur("seimaiWari")} placeholder="例：50%" className={inputCls} />
        </Field>
        <Field label="アルコール">
          <input value={form.alcohol} onChange={set("alcohol")} onBlur={blur("alcohol")} placeholder="例：15度" className={inputCls} />
        </Field>
      </div>

      {/* 説明 */}
      <Field label="説明">
        <textarea value={form.description} onChange={set("description")} onBlur={blur("description")} rows={6} className={inputCls} />
      </Field>

      {/* 1800ml */}
      <div>
        <p className="text-sm font-semibold text-gray-700 mb-2">1800ml</p>
        <div className="grid grid-cols-3 gap-4">
          <Field label="単価 (円)" required>
            <input type="number" min="0" step="1" value={form.price1800} onChange={set("price1800")} placeholder="0" className={noSpinCls} />
          </Field>
          <Field label="単位">
            <input value={form.unit1800} onChange={set("unit1800")} className={inputCls} />
          </Field>
          <Field label="数量">
            <input type="number" min="0" value={form.stock1800} onChange={set("stock1800")} className={inputCls} />
          </Field>
        </div>
      </div>

      {/* 720ml */}
      <div>
        <p className="text-sm font-semibold text-gray-700 mb-2">720ml</p>
        <div className="grid grid-cols-3 gap-4">
          <Field label="単価 (円)" required>
            <input type="number" min="0" step="1" value={form.price720} onChange={set("price720")} placeholder="0" className={noSpinCls} />
          </Field>
          <Field label="単位">
            <input value={form.unit720} onChange={set("unit720")} className={inputCls} />
          </Field>
          <Field label="数量">
            <input type="number" min="0" value={form.stock720} onChange={set("stock720")} className={inputCls} />
          </Field>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={saving} className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
          {saving ? "保存中..." : "保存"}
        </button>
        <button type="button" onClick={() => router.push("/products")} className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg text-sm font-medium hover:bg-gray-50">
          キャンセル
        </button>
      </div>
    </form>
  );
}

const inputCls = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";
const noSpinCls = `${inputCls} [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`;

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
    </div>
  );
}
