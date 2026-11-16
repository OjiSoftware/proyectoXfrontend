import { Brand } from "./brand.types";
import { Provider } from "./provider.types";
/* import { SubCategory } from "./subcategory.types"; */

export interface Product {
    id: number;
    name: string;
    barcode?: string | null;
    description: string;
    price: number;
    costPrice?: number | null;
    imageUrl: string;
    /* subCategoryId: number;
    subCategory?: SubCategory & { category: { id: number; name: string } }; */
    category: { id: number; name: string };
    categoryId?: number;
    brandId?: number | null;
    brand?: Brand | null;
    providerId?: number | null;
    provider?: Provider | null;
    stock?: number;
    unit?: string | null;
    status?: boolean;
    isOffer?: boolean;
    createdAt?: string;
    showingInCatalog: boolean;
}

// Para el formulario de edición
export interface ProductEditFrontend {
    name: string;
    barcode?: string | null;
    brandId?: number | null;
    categoryId: number;
    providerId?: number | null;
    /* subCategoryId: number; */
    stock: number;
    price: number;
    costPrice?: number | null;
    description: string;
    showingInCatalog: boolean;
    isOffer?: boolean;
    imageUrl: string;
    unit?: string | null;
}

export type ProductEditBackend = ProductEditFrontend;
