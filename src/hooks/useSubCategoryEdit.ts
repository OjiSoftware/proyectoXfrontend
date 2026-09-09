import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { subCategoryApi } from "@/services/SubCategoryService";
import { categoryApi } from "@/services/CategoryService";
import { Category } from "@/types/category.types";
import toast from "react-hot-toast";

export function useSubCategoryEdit() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    
    const [name, setName] = useState("");
    const [categoryId, setCategoryId] = useState<number>(0);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const loadCategories = async () => {
            try {
                const data = await categoryApi.getAll();
                setCategories(data);
            } catch (error) {
                console.error("Error cargando categorías:", error);
            }
        };
        loadCategories();
    }, []);

    // Fetch inicial de la subcategoría
    useEffect(() => {
        if (!id) return;

        const fetchSubCategory = async () => {
            try {
                const subCategories = await subCategoryApi.getAll();
                const subCategory = subCategories.find((s: any) => s.id === parseInt(id));
                if (!subCategory) {
                    toast.error("Subcategoría no encontrada");
                    navigate("/management/subcategories");
                } else {
                    setName(subCategory.name);
                    setCategoryId(subCategory.categoryId || 0);
                }
            } catch (error) {
                console.error("Error cargando subcategoría:", error);
                toast.error("Error al cargar la subcategoría");
            }
        };

        fetchSubCategory();
    }, [id, navigate]);

    const handleSubmit = async () => {
        if (!id || categoryId === 0) return;

        setLoading(true);
        const toastId = toast.loading("Guardando cambios...");
        try {
            await subCategoryApi.update(id, { name, categoryId });
            toast.success("Subcategoría actualizada con éxito", { id: toastId });
            navigate("/management/subcategories");
        } catch (error) {
            console.error("Error al actualizar subcategoría:", error);
            toast.error("Error al guardar cambios", { id: toastId });
        } finally {
            setLoading(false);
        }
    };

    return {
        id,
        name,
        setName,
        categoryId,
        setCategoryId,
        categories,
        loading,
        handleSubmit,
    };
}
