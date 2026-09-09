const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export const subCategoryApi = {
    getAll: async () => {
        const response = await fetch(`${BASE_URL}/subcategories`);
        if (!response.ok) throw new Error("Error al traer subcategorías");
        return response.json();
    },

    create: async (data: { name: string; categoryId: number }) => {
        const response = await fetch(`${BASE_URL}/subcategories`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error("Error al crear subcategoría");
        return response.json();
    },

    update: async (
        id: string | number,
        data: { name: string; categoryId: number },
    ) => {
        const response = await fetch(`${BASE_URL}/subcategories/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error("Error al actualizar subcategoría");
        return response.json();
    },

    delete: async (id: string | number) => {
        const response = await fetch(`${BASE_URL}/subcategories/${id}`, {
            method: "DELETE",
        });
        if (!response.ok) throw new Error("Error al eliminar subcategoría");
        return response.json();
    },
};
