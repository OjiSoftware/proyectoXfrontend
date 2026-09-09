import { Brand } from "./brand.types";
import { SubCategory } from "./subcategory.types";

export interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    imageUrl: string;
    subCategoryId: number;
    subCategory?: SubCategory & { category: { id: number; name: string } };
    brandId?: number;
    brand?: Brand;
    stock?: number;
    unit?: string;
    status?: boolean;
    createdAt?: string;
    showingInCatalog: boolean;
}

// Para el formulario de edición
export interface ProductEditFrontend {
    name: string;
    brandId: number;
    categoryId: number; // solo UI
    subCategoryId: number;
    stock: number;
    price: number;
    description: string;
    showingInCatalog: boolean;
    imageUrl: string;
    unit: string;
}

export type ProductEditBackend = Omit<ProductEditFrontend, "categoryId">;
