export function useSubCategoryEdit() {
    return {
        id: null,
        name: "",
        setName: () => {},
        categoryId: 0,
        setCategoryId: () => {},
        categories: [],
        loading: false,
        handleSubmit: async () => {},
    };
}
