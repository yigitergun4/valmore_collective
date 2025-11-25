import { getAllProducts } from "@/lib/products";
import ProductDetailClient from "./ProductDetailClient";

export async function generateStaticParams(): Promise<{ id: string }[]> {
  const products = getAllProducts();
  return products.map((product) => ({
    id: product.id,
  }));
}

import { Suspense } from "react";

export default function ProductDetailPage(): React.JSX.Element {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProductDetailClient />
    </Suspense>
  );
}
