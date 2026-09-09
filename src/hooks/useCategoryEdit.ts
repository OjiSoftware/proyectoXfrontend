import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { categoryApi } from "@/services/CategoryService";
import toast from "react-hot-toast";

export function useCategoryEdit() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);

    // Fetch inicial
    useEffect(() => {
        if (!id) return;

        const fetchCategory = async () => {
            try {
                const categories = await categoryApi.getAll();
                const category = categories.find((c: any) => c.id === parseInt(id));
                if (!category) {
                    toast.error("Categoría no encontrada");
                    navigate("/management/categories");
                } else {
                    setName(category.name);
                }
            } catch (error) {
                console.error("Error cargando categoría:", error);
                toast.error("Error al cargar la categoría");
            }
        };

        fetchCategory();
    }, [id, navigate]);

    const handleSubmit = async () => {
        if (!id) return;

        setLoading(true);
        const toastId = toast.loading("Guardando cambios...");
        try {
            await categoryApi.update(id, { name });
            toast.success("Categoría actualizada con éxito", { id: toastId });
            navigate("/management/categories");
        } catch (error) {
            console.error("Error al actualizar categoría:", error);
            toast.error("Error al guardar cambios", { id: toastId });
        } finally {
            setLoading(false);
        }
    };

    return {
        id,
        name,
        setName,
        loading,
        handleSubmit,
    };
}
