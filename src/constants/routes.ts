export const ROUTES = {
    products: {
        list: "/management/products",
        create: "/management/products/create",
        edit: (id: number) => `/management/products/edit/${id}`,
    },
    brands: {
        list: "/management/brands",
        create: "/management/brands/create",
        edit: (id: number) => `/management/brands/edit/${id}`,
    },
    categories: {
        list: "/management/categories",
        create: "/management/categories/create",
        edit: (id: number) => `/management/categories/edit/${id}`,
    },
    subcategories: {
        list: "/management/subcategories",
        create: "/management/subcategories/create",
        edit: (id: number) => `/management/subcategories/edit/${id}`,
    },
    sales: {
        list: "/management/sales",
        create: "/management/sales/create",
        edit: (id: number) => `/management/sales/edit/${id}`,
    },
};
