"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import ProductForm from "@/components/admin/ProductForm";
import { getProduct, updateProduct } from "@/lib/firestore";
import { useAlert } from "@/contexts/AlertContext";
import { Product } from "@/types";

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { showError, showSuccess } = useAlert();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    const fetchProduct: () => Promise<void> = async () => {
      try {
        const data = await getProduct(id);
        if (!data) {
          showError("Ürün bulunamadı");
          router.push("/admin/products");
          return;
        }
        setProduct(data);
      } catch (error) {
        console.error("Error fetching product:", error);
        showError("Ürün getirilirken hata oluştu");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, router]);

  const handleSubmit: (data: Omit<Product, "id">) => Promise<void> = async (data: Omit<Product, "id">) => {
    setIsSubmitting(true);
    try {
      await updateProduct(id, data);
      showSuccess("Ürün başarıyla güncellendi");
      router.push("/admin/products");
    } catch (error) {
      console.error("Failed to update product:", error);
      showError("Ürün güncellenemedi");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Ürünü Düzenle</h1>
        <p className="text-gray-500">Ürün bilgilerini güncelleyin.</p>
      </div>

      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <ProductForm
          initialData={product}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
}
