import ProductForm from "@/components/ProductForm";
import Link from "next/link";

export default function NewProductPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/products" className="hover:text-blue-600">商品管理</Link>
        <span>›</span>
        <span>新規商品</span>
      </div>
      <h1 className="text-2xl font-bold text-gray-900">新規商品登録</h1>
      <ProductForm />
    </div>
  );
}
