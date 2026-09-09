// const BASE_URL = "http://localhost:3000/api";
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";


export const clientApi = {
  create: async (data: any) => {
    const response = await fetch(`${BASE_URL}/clients`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Error al crear el cliente");
    return response.json();
  },

  getAllClients: async () => {
    const response = await fetch(`${BASE_URL}/clients`);
    if (!response.ok) throw new Error("Error al traer los clientes");
    return response.json();
  },

  update: async (id: number | string, data: any) => {
    const response = await fetch(`${BASE_URL}/clients/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Error al actualizar el cliente");
    return response.json();
  }
};
