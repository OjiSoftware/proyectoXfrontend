// const BASE_URL = "http://localhost:3000/api";
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";



export const catalogApi = {

    getCatalog: async () => {
        const response = await fetch(`${BASE_URL}/products/catalog`);
        if (!response.ok) throw new Error("Error al obtener el catálogo");
        return response.json();
    },


    getCategoryTree: async () => {

        const response = await fetch(`${BASE_URL}/categories/catalog`)
        if (!response.ok) throw new Error("Error al obtener el arbol de categorias");
        return response.json();
    },

    getActivesBrands: async () => {
        const response = await fetch(`${BASE_URL}/brands`);
        if (!response.ok) throw new Error("Error al obtener todas las marcas activas");
        return response.json();
    }

}
