import { getAllProducts, getProductById, getRelatedProducts } from "@/lib/productService";
import ProductDetailClient from "./ProductDetailClient";
import { Suspense } from "react";
import { Product } from "@/types";

export async function generateStaticParams(): Promise<{ id: string }[]> {
  const products = await getAllProducts();
  return products.map((product) => ({
    id: product.id,
  }));
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductDetailPage({ params }: PageProps): Promise<React.JSX.Element> {
  const resolvedParams = await params;
  const product = await getProductById(resolvedParams.id);
  
  if (!product) {
    return <div>Product not found</div>;
  }

  const allProducts = await getAllProducts();
  const relatedProducts = await getRelatedProducts(resolvedParams.id, product.category, 4);

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProductDetailClient 
        product={product} 
        allProducts={allProducts} 
        relatedProducts={relatedProducts} 
      />
    </Suspense>
  );
}
