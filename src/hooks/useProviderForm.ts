import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { providerApi } from "@/services/ProviderService";
import { ROUTES } from "@/constants/routes";

export function useCreateProvider() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        businessName: "",
        phoneNumber: "",
        email: "",
    });

    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async () => {
        if (!formData.name.trim() && !formData.businessName.trim()) {
            toast.error("El nombre o la razón social es obligatorio");
            return;
        }

        setIsLoading(true);
        const loadingToast = toast.loading("Creando proveedor...");

        try {
            await providerApi.create({
                name: formData.name.trim() || undefined,
                businessName: formData.businessName.trim() || undefined,
                phoneNumber: formData.phoneNumber.trim() || undefined,
                email: formData.email.trim() || undefined,
            });

            toast.success("Proveedor creado con éxito", { id: loadingToast });
            navigate(ROUTES.providers.list);
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Error al crear proveedor", { id: loadingToast });
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
