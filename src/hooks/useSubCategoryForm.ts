export function useCreateSubCategory() {
    return {
        formData: { name: "", categoryId: 0 },
        categories: [],
        isLoading: false,
        handleChange: () => {},
        handleSubmit: async () => {},
    };
}
