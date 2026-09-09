// const BASE_URL = "http://localhost:3000/api";
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";


export const brandApi = {
    // Traer todas las marcas
    getAll: async () => {
        const response = await fetch(`${BASE_URL}/brands`);
        if (!response.ok) throw new Error("Error al traer marcas");
        return response.json();
    },

    // Crear una marca
    create: async (data: { name: string; /* subCategoryId: number  */ }) => {
        const response = await fetch(`${BASE_URL}/brands`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error("Error al crear marca");
        return response.json();
    },

    // Actualizar una marca 
    update: async (
        id: string | number,
        data: { name: string; /* subCategoryId?: number; *//*  status?: boolean  */ },
    ) => {
        const response = await fetch(`${BASE_URL}/brands/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error("Error al actualizar marca");
        return response.json();
    },

    // Eliminar una marca
    delete: async (id: string | number) => {
        const response = await fetch(`${BASE_URL}/brands/${id}`, {
            method: "DELETE",
        });
        if (!response.ok) throw new Error("Error al eliminar marca");
        return response.json();
    },

    /* getSubCategories: async () => {
        const response = await fetch(`${BASE_URL}/subcategories`);
        if (!response.ok) throw new Error("Error al traer subcategorías");
        return response.json(); // [{id, name}, ...]
    }, */
};
