export interface SubCategory {
    id: number;
    name: string;
    categoryId: number;
    status?: boolean;
    createdAt?: string;
}

export interface CreateSubCategoryDto {
    name: string;
    categoryId: number;
}

export interface UpdateSubCategoryDto {
    name?: string;
    categoryId?: number;
    status?: boolean;
}
