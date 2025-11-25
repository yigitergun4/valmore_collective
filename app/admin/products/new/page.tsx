"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ProductForm from "@/components/admin/ProductForm";
import { addProduct } from "@/lib/firestore/products";
import { Product } from "@/types";

export default function NewProductPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSubmit: (data: Omit<Product, "id">) => Promise<void> = async (data: Omit<Product, "id">) => {
    setIsSubmitting(true);
    try {
      await addProduct(data);
      router.push("/admin/products");
    } catch (error) {
      console.error("Failed to create product:", error);
      alert("Ürün oluşturulamadı");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Yeni Ürün Ekle</h1>
        <p className="text-gray-500">Mağazanız için yeni bir ürün oluşturun.</p>
      </div>

      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <ProductForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
      </div>
    </div>
  );
}
