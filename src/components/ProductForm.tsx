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
  wholesalePrice1800: string;
  unit1800: string;
  stock1800: string;
  price720: string;
  wholesalePrice720: string;
  unit720: string;
  stock720: string;
  volumeOther: string;
  priceOther: string;
  wholesalePriceOther: string;
  unitOther: string;
  stockOther: string;
};

type Props = {
  initialData?: Partial<ProductData>;
  productId?: number;
};

const empty: ProductData = {
  name: "", category: "", sakaMai: "", seimaiWari: "", alcohol: "",
  description: "",
  price1800: "", wholesalePrice1800: "", unit1800: "6", stock1800: "",
  price720: "",  wholesalePrice720: "", unit720: "12", stock720: "",
  volumeOther: "", priceOther: "", wholesalePriceOther: "", unitOther: "", stockOther: "",
};

export default function ProductForm({ initialData, productId }: Props) {
  const [form, setForm] = useState<ProductData>({ ...empty, ...initialData });
  const [saving, setSaving] = useState(false);
  const noPriceData = !initialData?.price1800 && !initialData?.price720 && !initialData?.priceOther;
  const [has1800, setHas1800] = useState(productId ? (!noPriceData ? !!(initialData?.price1800) : true) : true);
  const [has720, setHas720] = useState(productId ? (!noPriceData ? !!(initialData?.price720) : true) : true);
  const [hasOther, setHasOther] = useState(!!(initialData?.priceOther));
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
    if (!has1800 && !has720 && !hasOther) {
      alert("サイズを1つ以上選択してください");
      return;
    }
    if (has1800 && (!form.price1800 || !form.wholesalePrice1800 || !form.unit1800)) {
      alert("1800mlの小売値・卸売値・単位（ロット）を入力してください");
      return;
    }
    if (has720 && (!form.price720 || !form.wholesalePrice720 || !form.unit720)) {
      alert("720mlの小売値・卸売値・単位（ロット）を入力してください");
      return;
    }
    if (hasOther && (!form.volumeOther || !form.priceOther || !form.wholesalePriceOther || !form.unitOther)) {
      alert("その他サイズの容量・小売値・卸売値・単位（ロット）を入力してください");
      return;
    }
    setSaving(true);
    const payload = {
      name: form.name,
      category: form.category || null,
      sakaMai: form.sakaMai || null,
      seimaiWari: form.seimaiWari || null,
      alcohol: form.alcohol || null,
      description: form.description || null,
      price1800: has1800 && form.price1800 ? parseFloat(form.price1800) : null,
      wholesalePrice1800: has1800 && form.wholesalePrice1800 ? parseFloat(form.wholesalePrice1800) : null,
      unit1800: has1800 ? (form.unit1800 || "本") : null,
      stock1800: has1800 ? (parseInt(form.stock1800) || 0) : 0,
      price720: has720 && form.price720 ? parseFloat(form.price720) : null,
      wholesalePrice720: has720 && form.wholesalePrice720 ? parseFloat(form.wholesalePrice720) : null,
      unit720: has720 ? (form.unit720 || "本") : null,
      stock720: has720 ? (parseInt(form.stock720) || 0) : 0,
      volumeOther: hasOther ? (form.volumeOther || null) : null,
      priceOther: hasOther && form.priceOther ? parseFloat(form.priceOther) : null,
      wholesalePriceOther: hasOther && form.wholesalePriceOther ? parseFloat(form.wholesalePriceOther) : null,
      unitOther: hasOther ? (form.unitOther || null) : null,
      stockOther: hasOther ? (parseInt(form.stockOther) || 0) : 0,
      price: parseFloat((has1800 ? form.price1800 : "") || (has720 ? form.price720 : "") || (hasOther ? form.priceOther : "") || "0") || 0,
      unit: (has1800 ? form.unit1800 : "") || "本",
      stock: (has1800 ? parseInt(form.stock1800) || 0 : 0) + (has720 ? parseInt(form.stock720) || 0 : 0),
    };
    const url = productId ? `/api/products/${productId}` : "/api/products";
    const method = productId ? "PUT" : "POST";
    await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    router.push("/products");
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-5 max-w-2xl">
      <Field label="商品名" required>
        <input required value={form.name} onChange={set("name")} onBlur={blur("name")} className={inputCls} />
      </Field>

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

      <Field label="説明">
        <textarea value={form.description} onChange={set("description")} onBlur={blur("description")} rows={6} className={inputCls} />
      </Field>

      <div className="flex gap-6">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={has1800} onChange={(e) => {
            setHas1800(e.target.checked);
            if (!e.target.checked) setForm((f) => ({ ...f, price1800: "", wholesalePrice1800: "", unit1800: "6", stock1800: "" }));
          }} className="w-4 h-4 accent-blue-600" />
          <span className="text-sm font-medium text-gray-700">1800ml</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={has720} onChange={(e) => {
            setHas720(e.target.checked);
            if (!e.target.checked) setForm((f) => ({ ...f, price720: "", wholesalePrice720: "", unit720: "12", stock720: "" }));
          }} className="w-4 h-4 accent-blue-600" />
          <span className="text-sm font-medium text-gray-700">720ml</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={hasOther} onChange={(e) => {
            setHasOther(e.target.checked);
            if (!e.target.checked) setForm((f) => ({ ...f, volumeOther: "", priceOther: "", wholesalePriceOther: "", unitOther: "", stockOther: "" }));
          }} className="w-4 h-4 accent-blue-600" />
          <span className="text-sm font-medium text-gray-700">その他</span>
        </label>
      </div>

      {/* 1800ml */}
      {has1800 && (
        <div className="border border-gray-100 rounded-lg p-4">
          <p className="text-sm font-semibold text-gray-700 mb-3">1800ml</p>
          <div className="grid grid-cols-2 gap-4">
            <Field label="小売値 (円)" required>
              <input type="number" min="0" step="1" value={form.price1800} onChange={set("price1800")} className={noSpinCls} />
            </Field>
            <Field label="卸売値 (円)" required>
              <input type="number" min="0" step="1" value={form.wholesalePrice1800} onChange={set("wholesalePrice1800")} className={noSpinCls} />
            </Field>
            <Field label="単位（ロット）" required>
              <input value={form.unit1800} onChange={set("unit1800")} placeholder="例: 6" className={inputCls} />
            </Field>
            <Field label="限定">
              <input type="number" min="0" value={form.stock1800} onChange={set("stock1800")} className={inputCls} />
            </Field>
          </div>
        </div>
      )}

      {/* 720ml */}
      {has720 && (
        <div className="border border-gray-100 rounded-lg p-4">
          <p className="text-sm font-semibold text-gray-700 mb-3">720ml</p>
          <div className="grid grid-cols-2 gap-4">
            <Field label="小売値 (円)" required>
              <input type="number" min="0" step="1" value={form.price720} onChange={set("price720")} className={noSpinCls} />
            </Field>
            <Field label="卸売値 (円)" required>
              <input type="number" min="0" step="1" value={form.wholesalePrice720} onChange={set("wholesalePrice720")} className={noSpinCls} />
            </Field>
            <Field label="単位（ロット）" required>
              <input value={form.unit720} onChange={set("unit720")} placeholder="例: 12" className={inputCls} />
            </Field>
            <Field label="限定">
              <input type="number" min="0" value={form.stock720} onChange={set("stock720")} className={inputCls} />
            </Field>
          </div>
        </div>
      )}

      {/* その他 */}
      {hasOther && (
        <div className="border border-gray-100 rounded-lg p-4">
          <p className="text-sm font-semibold text-gray-700 mb-3">その他のサイズ</p>
          <div className="grid grid-cols-2 gap-4">
            <Field label="容量" required>
              <input value={form.volumeOther} onChange={set("volumeOther")} className={inputCls} />
            </Field>
            <Field label="限定">
              <input type="number" min="0" value={form.stockOther} onChange={set("stockOther")} className={inputCls} />
            </Field>
            <Field label="小売値 (円)" required>
              <input type="number" min="0" step="1" value={form.priceOther} onChange={set("priceOther")} className={noSpinCls} />
            </Field>
            <Field label="卸売値 (円)" required>
              <input type="number" min="0" step="1" value={form.wholesalePriceOther} onChange={set("wholesalePriceOther")} className={noSpinCls} />
            </Field>
            <Field label="単位（ロット）" required>
              <input value={form.unitOther} onChange={set("unitOther")} placeholder="例: 12" className={inputCls} />
            </Field>
          </div>
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={saving} className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
          {saving ? "登録中..." : "登録"}
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
