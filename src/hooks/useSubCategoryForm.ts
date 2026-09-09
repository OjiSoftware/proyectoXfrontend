import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { subCategoryApi } from "@/services/SubCategoryService";
import { categoryApi } from "@/services/CategoryService";
import { Category } from "@/types/category.types";

export function useCreateSubCategory() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        categoryId: 0,
    });

    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const loadCategories = async () => {
            try {
                const data = await categoryApi.getAll();
                setCategories(data);
            } catch (error) {
                console.error("Error cargando categorías:", error);
                toast.error("Error al cargar categorías");
            }
        };
        loadCategories();
    }, []);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    ) => {
        const { name, value } = e.target;
        const finalValue = name.includes("Id") ? Number(value) : value;
        setFormData((prev) => ({
            ...prev,
            [name]: finalValue,
        }));
    };

    const handleSubmit = async () => {
        if (!formData.name.trim() || formData.categoryId === 0) {
            toast.error("Complete todos los campos obligatorios");
            return;
        }

        setIsLoading(true);
        const loadingToast = toast.loading("Creando subcategoría...");

        try {
            await subCategoryApi.create({
                name: formData.name,
                categoryId: formData.categoryId,
            });

            toast.success("Subcategoría creada con éxito", { id: loadingToast });
            navigate("/management/subcategories");
        } catch (error) {
            console.error(error);
            toast.error("Error al crear subcategoría", { id: loadingToast });
        } finally {
            setIsLoading(false);
        }
    };

    return {
        formData,
        categories,
        isLoading,
        handleChange,
        handleSubmit,
    };
}
