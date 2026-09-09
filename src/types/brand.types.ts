

export interface Brand {
    id: number;
    name: string;
    /*     subCategoryId: number;
        subCategory?: SubCategory; */
    status?: boolean;
    createdAt?: string;
}

export interface CreateBrandDto {
    name: string;
    /*     subCategoryId: number; */
}

export interface UpdateBrandDto {
    name?: string;
    /*     subCategoryId?: number; */
    status?: boolean;
}
