import { Product, ProductGender } from "../";

export interface ProductCardProps {
    product: Product;
    filterGender?: ProductGender | "ALL";
}