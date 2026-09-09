const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export const categoryApi = {
    getAll: async () => {
        const response = await fetch(`${BASE_URL}/categories`);
        if (!response.ok) throw new Error("Error al traer categorías");
        return response.json();
    },

    create: async (data: { name: string }) => {
        const response = await fetch(`${BASE_URL}/categories`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error("Error al crear categoría");
        return response.json();
    },

    update: async (id: string | number, data: { name: string }) => {
        const response = await fetch(`${BASE_URL}/categories/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error("Error al actualizar categoría");
        return response.json();
    },

    delete: async (id: string | number) => {
        const response = await fetch(`${BASE_URL}/categories/${id}`, {
            method: "DELETE",
        });
        if (!response.ok) throw new Error("Error al eliminar categoría");
        return response.json();
    },
};
