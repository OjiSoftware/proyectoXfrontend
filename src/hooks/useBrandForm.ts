export function useCreateBrand() {
    return {
        formData: { name: "", categoryId: 0, subCategoryId: 0 },
        categories: [],
        filteredSubCategories: [],
        isLoading: false,
        handleChange: () => {},
        handleSubmit: async () => {},
    };
}
