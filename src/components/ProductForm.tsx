"use client";
import { useRef, useState } from "react";
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
  imageUrl: string;
  price1800: string;
  wholesalePrice1800: string;
  unit1800: string;
  jan1800: string;
  stock1800: string;
  price720: string;
  wholesalePrice720: string;
  unit720: string;
  jan720: string;
  stock720: string;
  volumeOther: string;
  priceOther: string;
  wholesalePriceOther: string;
  unitOther: string;
  janOther: string;
  stockOther: string;
};

type Errors = Partial<Record<keyof ProductData | "size", string>>;

type Props = {
  initialData?: Partial<ProductData>;
  productId?: number;
  onBack?: () => void;
  onDelete?: () => void;
};

const empty: ProductData = {
  name: "", category: "", sakaMai: "", seimaiWari: "", alcohol: "",
  description: "", imageUrl: "",
  price1800: "", wholesalePrice1800: "", unit1800: "6", jan1800: "", stock1800: "",
  price720: "",  wholesalePrice720: "", unit720: "12", jan720: "", stock720: "",
  volumeOther: "", priceOther: "", wholesalePriceOther: "", unitOther: "", janOther: "", stockOther: "",
};

export default function ProductForm({ initialData, productId, onBack, onDelete }: Props) {
  const [form, setForm] = useState<ProductData>({ ...empty, ...initialData });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const noPriceData = !initialData?.price1800 && !initialData?.price720 && !initialData?.priceOther;
  const [has1800, setHas1800] = useState(productId ? (!noPriceData ? !!(initialData?.price1800) : true) : true);
  const [has720, setHas720] = useState(productId ? (!noPriceData ? !!(initialData?.price720) : true) : true);
  const [hasOther, setHasOther] = useState(!!(initialData?.priceOther));
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const uploadImage = async (file: File) => {
    if (!file.type.startsWith("image/")) { alert("画像ファイルを選択してください"); return; }
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    if (res.ok) {
      const data = await res.json();
      setForm((f) => ({ ...f, imageUrl: data.url }));
    } else {
      alert("画像のアップロードに失敗しました");
    }
    setUploading(false);
  };

  const toHalf = (str: string) =>
    str.replace(/[！-～]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xFEE0)).replace(/　/g, " ");

  const set = (key: keyof ProductData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setForm((f) => ({ ...f, [key]: e.target.value }));
      setErrors((err) => ({ ...err, [key]: undefined }));
    };

  const blur = (key: keyof ProductData) =>
    (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [key]: toHalf(e.target.value) }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Errors = {};

    if (!has1800 && !has720 && !hasOther) {
      newErrors.size = "サイズを1つ以上選択してください";
    }
    if (has1800) {
      if (!form.price1800) newErrors.price1800 = "必須項目です";
      if (!form.wholesalePrice1800) newErrors.wholesalePrice1800 = "必須項目です";
      if (!form.unit1800) newErrors.unit1800 = "必須項目です";
    }
    if (has720) {
      if (!form.price720) newErrors.price720 = "必須項目です";
      if (!form.wholesalePrice720) newErrors.wholesalePrice720 = "必須項目です";
      if (!form.unit720) newErrors.unit720 = "必須項目です";
    }
    if (hasOther) {
      if (!form.volumeOther) newErrors.volumeOther = "必須項目です";
      if (!form.priceOther) newErrors.priceOther = "必須項目です";
      if (!form.wholesalePriceOther) newErrors.wholesalePriceOther = "必須項目です";
      if (!form.unitOther) newErrors.unitOther = "必須項目です";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSaving(true);
    const base = {
      name: form.name,
      category: form.category || null,
      sakaMai: form.sakaMai || null,
      seimaiWari: form.seimaiWari || null,
      alcohol: form.alcohol || null,
      description: form.description || null,
      imageUrl: form.imageUrl || null,
    };
    const empty1800 = { price1800: null, wholesalePrice1800: null, unit1800: null, jan1800: null, stock1800: 0 };
    const empty720 = { price720: null, wholesalePrice720: null, unit720: null, jan720: null, stock720: 0 };
    const emptyOther = { volumeOther: null, priceOther: null, wholesalePriceOther: null, unitOther: null, janOther: null, stockOther: 0 };
    const fields1800 = has1800 ? {
      price1800: form.price1800 ? parseFloat(form.price1800) : null,
      wholesalePrice1800: form.wholesalePrice1800 ? parseFloat(form.wholesalePrice1800) : null,
      unit1800: form.unit1800 || "本",
      jan1800: form.jan1800 || null,
      stock1800: parseInt(form.stock1800) || 0,
    } : empty1800;
    const fields720 = has720 ? {
      price720: form.price720 ? parseFloat(form.price720) : null,
      wholesalePrice720: form.wholesalePrice720 ? parseFloat(form.wholesalePrice720) : null,
      unit720: form.unit720 || "本",
      jan720: form.jan720 || null,
      stock720: parseInt(form.stock720) || 0,
    } : empty720;
    const fieldsOther = hasOther ? {
      volumeOther: form.volumeOther ? (form.volumeOther.endsWith("ml") ? form.volumeOther : `${form.volumeOther}ml`) : null,
      priceOther: form.priceOther ? parseFloat(form.priceOther) : null,
      wholesalePriceOther: form.wholesalePriceOther ? parseFloat(form.wholesalePriceOther) : null,
      unitOther: form.unitOther || null,
      janOther: form.janOther || null,
      stockOther: parseInt(form.stockOther) || 0,
    } : emptyOther;

    if (productId) {
      // 編集は既存どおり、1商品に複数サイズをまとめたまま更新する
      const payload = {
        ...base,
        ...fields1800, ...fields720, ...fieldsOther,
        price: parseFloat((has1800 ? form.price1800 : "") || (has720 ? form.price720 : "") || (hasOther ? form.priceOther : "") || "0") || 0,
        unit: (has1800 ? form.unit1800 : "") || "本",
        stock: (has1800 ? parseInt(form.stock1800) || 0 : 0) + (has720 ? parseInt(form.stock720) || 0 : 0),
      };
      await fetch(`/api/products/${productId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      router.push("/products");
      return;
    }

    // 新規登録: サイズごとに別商品として1件ずつ登録する(まとめない)
    const submissions: Array<{ price: number; unit: string; stock: number; extra: object }> = [];
    if (has1800) submissions.push({ price: fields1800.price1800 ?? 0, unit: fields1800.unit1800 || "本", stock: fields1800.stock1800, extra: { ...fields1800, ...empty720, ...emptyOther } });
    if (has720) submissions.push({ price: fields720.price720 ?? 0, unit: fields720.unit720 || "本", stock: fields720.stock720, extra: { ...empty1800, ...fields720, ...emptyOther } });
    if (hasOther) submissions.push({ price: fieldsOther.priceOther ?? 0, unit: fieldsOther.unitOther || "本", stock: fieldsOther.stockOther, extra: { ...empty1800, ...empty720, ...fieldsOther } });

    await Promise.all(submissions.map((s) =>
      fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...base, ...s.extra, price: s.price, unit: s.unit, stock: s.stock }),
      })
    ));
    router.push("/products");
  };

  const ic = (err?: string) => err ? inputErrCls : inputCls;
  const nc = (err?: string) => err ? noSpinErrCls : noSpinCls;

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-5 max-w-2xl">
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-sm font-medium text-gray-700">
            商品名<span className="text-red-500 ml-1">*</span>
          </label>
          {(onBack || onDelete) && (
            <div className="flex items-center gap-3">
              {onBack && <button type="button" onClick={onBack} className="text-sm text-blue-600 hover:text-blue-800">戻る</button>}
              {onDelete && <button type="button" onClick={onDelete} className="text-sm text-red-500 hover:text-red-700">削除</button>}
            </div>
          )}
        </div>
        <input required value={form.name} onChange={set("name")} onBlur={blur("name")} className={inputCls} />
      </div>

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

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">商品画像</label>
        {form.imageUrl ? (
          <div className="flex items-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={form.imageUrl} alt={form.name || "商品画像"} className="w-32 h-32 object-cover rounded-lg border border-gray-200" />
            <div className="flex flex-col gap-2">
              <button type="button" onClick={() => fileInputRef.current?.click()} className="text-sm text-blue-600 hover:text-blue-800 text-left">
                画像を変更
              </button>
              <button type="button" onClick={() => setForm((f) => ({ ...f, imageUrl: "" }))} className="text-sm text-red-500 hover:text-red-700 text-left">
                削除
              </button>
            </div>
          </div>
        ) : (
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              const file = e.dataTransfer.files?.[0];
              if (file) uploadImage(file);
            }}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-lg px-4 py-6 flex flex-col items-center gap-2 cursor-pointer transition-colors ${
              dragOver ? "border-blue-400 bg-blue-50" : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
            }`}
          >
            {uploading ? (
              <span className="text-sm text-gray-500">アップロード中...</span>
            ) : (
              <>
                <span className="text-sm text-gray-500">ここに画像をドラッグ、または</span>
                <span className="text-sm text-blue-600 font-medium underline">ファイルを選択</span>
              </>
            )}
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => { const file = e.target.files?.[0]; if (file) uploadImage(file); if (fileInputRef.current) fileInputRef.current.value = ""; }}
        />
      </div>

      <div>
        <div className="flex gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={has1800} onChange={(e) => {
              setHas1800(e.target.checked);
              setErrors((err) => ({ ...err, size: undefined, price1800: undefined, wholesalePrice1800: undefined, unit1800: undefined }));
              if (!e.target.checked) setForm((f) => ({ ...f, price1800: "", wholesalePrice1800: "", unit1800: "6", jan1800: "", stock1800: "" }));
            }} className="w-4 h-4 accent-blue-600" />
            <span className="text-sm font-medium text-gray-700">1800ml</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={has720} onChange={(e) => {
              setHas720(e.target.checked);
              setErrors((err) => ({ ...err, size: undefined, price720: undefined, wholesalePrice720: undefined, unit720: undefined }));
              if (!e.target.checked) setForm((f) => ({ ...f, price720: "", wholesalePrice720: "", unit720: "12", jan720: "", stock720: "" }));
            }} className="w-4 h-4 accent-blue-600" />
            <span className="text-sm font-medium text-gray-700">720ml</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={hasOther} onChange={(e) => {
              setHasOther(e.target.checked);
              setErrors((err) => ({ ...err, size: undefined, volumeOther: undefined, priceOther: undefined, wholesalePriceOther: undefined, unitOther: undefined }));
              if (!e.target.checked) setForm((f) => ({ ...f, volumeOther: "", priceOther: "", wholesalePriceOther: "", unitOther: "", janOther: "", stockOther: "" }));
            }} className="w-4 h-4 accent-blue-600" />
            <span className="text-sm font-medium text-gray-700">その他</span>
          </label>
        </div>
        {errors.size && <p className="text-xs text-red-500 mt-1">{errors.size}</p>}
      </div>

      {/* 1800ml */}
      {has1800 && (
        <div className="border border-gray-100 rounded-lg p-4">
          <p className="text-sm font-semibold text-gray-700 mb-3">1800ml</p>
          <div className="grid grid-cols-2 gap-4">
            <Field label="小売値 (円)" required error={errors.price1800}>
              <input type="text" inputMode="numeric" value={form.price1800} onChange={set("price1800")} onBlur={blur("price1800")} className={nc(errors.price1800)} />
            </Field>
            <Field label="卸売値 (円)" required error={errors.wholesalePrice1800}>
              <input type="text" inputMode="numeric" value={form.wholesalePrice1800} onChange={set("wholesalePrice1800")} onBlur={blur("wholesalePrice1800")} className={nc(errors.wholesalePrice1800)} />
            </Field>
            <Field label="単位（ロット）" required error={errors.unit1800}>
              <input value={form.unit1800} onChange={set("unit1800")} onBlur={blur("unit1800")} placeholder="例: 6" className={ic(errors.unit1800)} />
            </Field>
            <Field label="限定">
              <input type="text" inputMode="numeric" value={form.stock1800} onChange={set("stock1800")} onBlur={blur("stock1800")} className={inputCls} />
            </Field>
            <Field label="JANコード">
              <input value={form.jan1800} onChange={set("jan1800")} onBlur={blur("jan1800")} placeholder="例: 4901234567890" className={inputCls} />
            </Field>
          </div>
        </div>
      )}

      {/* 720ml */}
      {has720 && (
        <div className="border border-gray-100 rounded-lg p-4">
          <p className="text-sm font-semibold text-gray-700 mb-3">720ml</p>
          <div className="grid grid-cols-2 gap-4">
            <Field label="小売値 (円)" required error={errors.price720}>
              <input type="text" inputMode="numeric" value={form.price720} onChange={set("price720")} onBlur={blur("price720")} className={nc(errors.price720)} />
            </Field>
            <Field label="卸売値 (円)" required error={errors.wholesalePrice720}>
              <input type="text" inputMode="numeric" value={form.wholesalePrice720} onChange={set("wholesalePrice720")} onBlur={blur("wholesalePrice720")} className={nc(errors.wholesalePrice720)} />
            </Field>
            <Field label="単位（ロット）" required error={errors.unit720}>
              <input value={form.unit720} onChange={set("unit720")} onBlur={blur("unit720")} placeholder="例: 12" className={ic(errors.unit720)} />
            </Field>
            <Field label="限定">
              <input type="text" inputMode="numeric" value={form.stock720} onChange={set("stock720")} onBlur={blur("stock720")} className={inputCls} />
            </Field>
            <Field label="JANコード">
              <input value={form.jan720} onChange={set("jan720")} onBlur={blur("jan720")} placeholder="例: 4901234567890" className={inputCls} />
            </Field>
          </div>
        </div>
      )}

      {/* その他 */}
      {hasOther && (
        <div className="border border-gray-100 rounded-lg p-4">
          <p className="text-sm font-semibold text-gray-700 mb-3">その他のサイズ</p>
          <div className="grid grid-cols-2 gap-4">
            <Field label="容量 (ml)" required error={errors.volumeOther}>
              <input value={form.volumeOther} onChange={set("volumeOther")} className={ic(errors.volumeOther)} />
            </Field>
            <Field label="限定">
              <input type="number" min="0" value={form.stockOther} onChange={set("stockOther")} className={inputCls} />
            </Field>
            <Field label="小売値 (円)" required error={errors.priceOther}>
              <input type="text" inputMode="numeric" value={form.priceOther} onChange={set("priceOther")} onBlur={blur("priceOther")} className={nc(errors.priceOther)} />
            </Field>
            <Field label="卸売値 (円)" required error={errors.wholesalePriceOther}>
              <input type="text" inputMode="numeric" value={form.wholesalePriceOther} onChange={set("wholesalePriceOther")} onBlur={blur("wholesalePriceOther")} className={nc(errors.wholesalePriceOther)} />
            </Field>
            <Field label="単位（ロット）" required error={errors.unitOther}>
              <input value={form.unitOther} onChange={set("unitOther")} onBlur={blur("unitOther")} placeholder="例: 12" className={ic(errors.unitOther)} />
            </Field>
            <Field label="JANコード">
              <input value={form.janOther} onChange={set("janOther")} onBlur={blur("janOther")} placeholder="例: 4901234567890" className={inputCls} />
            </Field>
          </div>
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={saving || uploading} className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
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
const inputErrCls = "w-full border border-red-500 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500";
const noSpinCls = `${inputCls} [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`;
const noSpinErrCls = `${inputErrCls} [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`;

function Field({ label, required, error, children }: { label: string; required?: boolean; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-500 mt-0.5">{error}</p>}
    </div>
  );
}
