import { useState } from "react";
import { toast } from "react-hot-toast";
import { SubCategory } from "@/types/subcategory.types";
import { subCategoryApi } from "@/services/SubCategoryService";

export function useDeleteSubCategory(
    setSubCategories: React.Dispatch<React.SetStateAction<SubCategory[]>>,
) {
    const [loading, setLoading] = useState(false);

    const deleteSubCategory = async (id: number) => {
        setLoading(true);

        try {
            await subCategoryApi.delete(id.toString());

            // Actualizamos la lista local eliminando el elemento
            setSubCategories((prev) => prev.filter((b) => b.id !== id));

            toast.success("Subcategoría eliminada");
        } catch (error) {
            console.error(error);
            toast.error("No se pudo eliminar la subcategoría");
        } finally {
            setLoading(false);
        }
    };

    return { deleteSubCategory, loading };
}
