"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import ProductForm from "@/components/ProductForm";

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [product, setProduct] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    fetch(`/api/products/${id}`).then((r) => r.json()).then(setProduct);
  }, [id]);

  const handleDelete = async () => {
    if (!confirm("この商品を削除しますか？")) return;
    await fetch(`/api/products/${id}`, { method: "DELETE" });
    router.push("/products");
  };

  if (!product) return <div className="text-center py-20 text-gray-500">読み込み中...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/products" className="hover:text-blue-600">商品管理</Link>
        <span>›</span>
        <span>{String(product.name)}</span>
      </div>
      <h1 className="text-2xl font-bold text-gray-900">商品編集</h1>
      <ProductForm
        productId={Number(id)}
        onBack={() => router.push("/products")}
        onDelete={handleDelete}
        initialData={{
          name: String(product.name ?? ""),
          category: String(product.category ?? ""),
          sakaMai: String(product.sakaMai ?? ""),
          seimaiWari: String(product.seimaiWari ?? ""),
          alcohol: String(product.alcohol ?? ""),
          description: String(product.description ?? ""),
          price1800: product.price1800 != null ? String(product.price1800) : "",
          wholesalePrice1800: product.wholesalePrice1800 != null ? String(product.wholesalePrice1800) : "",
          unit1800: product.unit1800 != null ? String(product.unit1800) : "6",
          stock1800: String(product.stock1800 ?? "0"),
          price720: product.price720 != null ? String(product.price720) : "",
          wholesalePrice720: product.wholesalePrice720 != null ? String(product.wholesalePrice720) : "",
          unit720: product.unit720 != null ? String(product.unit720) : "12",
          stock720: String(product.stock720 ?? "0"),
          volumeOther: product.volumeOther != null ? String(product.volumeOther) : "",
          priceOther: product.priceOther != null ? String(product.priceOther) : "",
          wholesalePriceOther: product.wholesalePriceOther != null ? String(product.wholesalePriceOther) : "",
          unitOther: product.unitOther != null ? String(product.unitOther) : "",
          stockOther: String(product.stockOther ?? "0"),
        }}
      />
    </div>
  );
}
