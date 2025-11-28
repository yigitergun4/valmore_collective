import { getAllProducts, getProductById, getRelatedProducts } from "@/lib/productService";
import ProductDetailClient from "./ProductDetailClient";
import { Suspense } from "react";
import { Product } from "@/types";

export async function generateStaticParams(): Promise<{ id: string }[]> {
  const products: Product[] = await getAllProducts();
  return products.map((product) => ({
    id: product.id,
  }));
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductDetailPage({ params }: PageProps): Promise<React.JSX.Element> {
  const resolvedParams: { id: string } = await params;
  const product: Product | null = await getProductById(resolvedParams.id);
  
  if (!product) {
    return <div>Product not found</div>;
  }

  const allProducts: Product[] = await getAllProducts();
  const relatedProducts: Product[] = await getRelatedProducts(resolvedParams.id, product.category, 4);

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
