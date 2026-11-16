import { Provider, CreateProviderDto, UpdateProviderDto } from "@/types/provider.types";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export const providerApi = {
    getAll: async (): Promise<Provider[]> => {
        const response = await fetch(`${BASE_URL}/providers`);
        if (!response.ok) throw new Error("Error al traer proveedores");
        return response.json();
    },

    getById: async (id: string | number): Promise<Provider> => {
        const response = await fetch(`${BASE_URL}/providers/${id}`);
        if (!response.ok) throw new Error("Error al traer proveedor");
        return response.json();
    },

    create: async (data: CreateProviderDto): Promise<Provider> => {
        const response = await fetch(`${BASE_URL}/providers`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error("Error al crear proveedor");
        return response.json();
    },

    update: async (id: string | number, data: UpdateProviderDto): Promise<Provider> => {
        const response = await fetch(`${BASE_URL}/providers/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error("Error al actualizar proveedor");
        return response.json();
    },

    delete: async (id: string | number): Promise<{ success: boolean }> => {
        const response = await fetch(`${BASE_URL}/providers/${id}`, {
            method: "DELETE",
        });
        if (!response.ok) throw new Error("Error al eliminar proveedor");
        return response.json();
    },
};
