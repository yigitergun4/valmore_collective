import { getAllProducts } from "@/lib/products";
import ProductDetailClient from "./ProductDetailClient";

export async function generateStaticParams() {
  const products = getAllProducts();
  return products.map((product) => ({
    id: product.id,
  }));
}

export default function ProductDetailPage() {
  return <ProductDetailClient />;
}
