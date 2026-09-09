import { useState } from "react";
import { toast } from "react-hot-toast";
import { Brand } from "@/types/brand.types";
import { brandApi } from "@/services/BrandService";

export function useDeleteBrand(
    setBrands: React.Dispatch<React.SetStateAction<Brand[]>>,
) {
    const [loading, setLoading] = useState(false);

    const deleteBrand = async (id: number) => {
        setLoading(true);

        try {
            await brandApi.delete(id.toString());

            // Actualizamos la lista local eliminando el elemento
            setBrands((prev) => prev.filter((b) => b.id !== id));

            toast.success("Marca eliminada");
        } catch (error) {
            console.error(error);
            toast.error("No se pudo eliminar la marca");
        } finally {
            setLoading(false);
        }
    };

    return { deleteBrand, loading };
}
