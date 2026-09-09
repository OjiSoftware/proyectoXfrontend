import { useState } from "react";
import { toast } from "react-hot-toast";
import { Category } from "@/types/category.types";
import { categoryApi } from "@/services/CategoryService";

export function useDeleteCategory(
    setCategories: React.Dispatch<React.SetStateAction<Category[]>>,
) {
    const [loading, setLoading] = useState(false);

    const deleteCategory = async (id: number) => {
        setLoading(true);

        try {
            await categoryApi.delete(id.toString());

            // Actualizamos la lista local eliminando el elemento
            setCategories((prev) => prev.filter((b) => b.id !== id));

            toast.success("Categoría eliminada");
        } catch (error) {
            console.error(error);
            toast.error("No se pudo eliminar la categoría");
        } finally {
            setLoading(false);
        }
    };

    return { deleteCategory, loading };
}
