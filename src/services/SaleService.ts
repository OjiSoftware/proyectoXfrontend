// const BASE_URL = "http://localhost:3000/api";
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";


export const saleApi = {
  getById : async (id: string) => {
    const response = await fetch(`${BASE_URL}/sales/${id}`);
    if (!response.ok) throw new Error("Error al obtener la venta");
    return response.json();
  },

  update : async (id: string, data: any) => {
    const response = await fetch(`${BASE_URL}/sales/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  create : async (data: any) => {
    const response = await fetch(`${BASE_URL}/sales`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Error al crear la venta");
    return response.json();
  },

  getAllSales : async () => {
    const response = await fetch(`${BASE_URL}/sales`);
    if (!response.ok) throw new Error("Error al traer las ventas");
    return response.json();
  },

  getAllClients : async () => {
    const response = await fetch(`${BASE_URL}/clients`);
    if (!response.ok) throw new Error("Error al traer los clientes");
    return response.json();
  },

};
