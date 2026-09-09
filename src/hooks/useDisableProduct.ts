import { useState } from "react";
import { toast } from "react-hot-toast";
import { Product } from "@/types/product.types";
import { productApi } from "@/services/ProductService";

export function useDisableProduct(
    setProducts: React.Dispatch<React.SetStateAction<Product[]>>,
) {
    const [loading, setLoading] = useState(false);

    const disableProduct = async (id: number) => {
        setLoading(true);

        try {
            // Llamada al API
            await productApi.update(id.toString(), {
                status: false, // solo enviamos status
            });

            // Actualiza la lista local
            setProducts((prev) =>
                prev.map((p) => (p.id === id ? { ...p, status: false } : p)),
            );

            toast.success("Producto deshabilitado");
        } catch (error) {
            console.error(error);
            toast.error("No se pudo deshabilitar el producto");
        } finally {
            setLoading(false);
        }
    };

    return { disableProduct, loading };
}
