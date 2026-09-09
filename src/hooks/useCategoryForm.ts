import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { categoryApi } from "@/services/CategoryService";

export function useCreateCategory() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
    });

    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async () => {
        if (!formData.name.trim()) {
            toast.error("El nombre es obligatorio");
            return;
        }

        setIsLoading(true);
        const loadingToast = toast.loading("Creando categoría...");

        try {
            await categoryApi.create({
                name: formData.name,
            });

            toast.success("Categoría creada con éxito", { id: loadingToast });
            navigate("/management/categories");
        } catch (error) {
            console.error(error);
            toast.error("Error al crear categoría", { id: loadingToast });
        } finally {
            setIsLoading(false);
        }
    };

    return {
        formData,
        isLoading,
        handleChange,
        handleSubmit,
    };
}
