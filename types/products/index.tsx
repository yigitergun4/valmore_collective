import { Product } from "@/types";

export interface PageProps {
  params: Promise<{ id: string }>;
}

export interface ProductAccordionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export interface ProductInfoProps {
  product: Product;
}

export interface ExpandableTextProps {
  text: string;
  maxLines?: number;
}

