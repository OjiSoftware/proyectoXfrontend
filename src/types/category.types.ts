

export interface Category {
    id: number;
    name: string;
    /*     subCategoryId: number;
        subCategory?: SubCategory; */
    status?: boolean;
    createdAt?: string;
}

export interface CreateCategoryDto {
    name: string;
    /*     subCategoryId: number; */
}

export interface UpdateCategoryDto {
    name?: string;
    /*     subCategoryId?: number; */
    status?: boolean;
}
