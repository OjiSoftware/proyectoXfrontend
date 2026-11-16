import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { providerApi } from "@/services/ProviderService";
import { ROUTES } from "@/constants/routes";

export function useCreateProvider() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        contact: "",
        phone: "",
        email: "",
        address: "",
    });

    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async () => {
        if (!formData.name.trim()) {
            toast.error("El nombre del proveedor es obligatorio");
            return;
        }

        setIsLoading(true);
        const loadingToast = toast.loading("Creando proveedor...");

        try {
            await providerApi.create({
                name: formData.name.trim(),
                contact: formData.contact.trim() || undefined,
                phone: formData.phone.trim() || undefined,
                email: formData.email.trim() || undefined,
                address: formData.address.trim() || undefined,
            });

            toast.success("Proveedor creado con éxito", { id: loadingToast });
            navigate(ROUTES.providers.list);
        } catch (error) {
            console.error(error);
            toast.error("Error al crear proveedor", { id: loadingToast });
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
