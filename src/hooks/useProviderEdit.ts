import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { providerApi } from "@/services/ProviderService";
import { ROUTES } from "@/constants/routes";
import toast from "react-hot-toast";

export function useProviderEdit() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        contact: "",
        phone: "",
        email: "",
        address: "",
    });
    const [loading, setLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);

    useEffect(() => {
        if (!id) return;

        const fetchProvider = async () => {
            try {
                const provider = await providerApi.getById(id);
                if (!provider) {
                    toast.error("Proveedor no encontrado");
                    navigate(ROUTES.providers.list);
                } else {
                    setFormData({
                        name: provider.name || "",
                        contact: provider.contact || "",
                        phone: provider.phone || "",
                        email: provider.email || "",
                        address: provider.address || "",
                    });
                }
            } catch (error) {
                // Si falla getById por ruta, intenta traer todos
                try {
                    const providers = await providerApi.getAll();
                    const provider = providers.find((p) => p.id === parseInt(id));
                    if (!provider) {
                        toast.error("Proveedor no encontrado");
                        navigate(ROUTES.providers.list);
                    } else {
                        setFormData({
                            name: provider.name || "",
                            contact: provider.contact || "",
                            phone: provider.phone || "",
                            email: provider.email || "",
                            address: provider.address || "",
                        });
                    }
                } catch (err) {
                    console.error("Error al cargar proveedor:", err);
                    toast.error("Error al cargar el proveedor");
                }
            } finally {
                setIsFetching(false);
            }
        };

        fetchProvider();
    }, [id, navigate]);

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
        if (!id) return;
        if (!formData.name.trim()) {
            toast.error("El nombre del proveedor es obligatorio");
            return;
        }

        setLoading(true);
        const toastId = toast.loading("Guardando cambios...");
        try {
            await providerApi.update(id, {
                name: formData.name.trim(),
                contact: formData.contact.trim() || undefined,
                phone: formData.phone.trim() || undefined,
                email: formData.email.trim() || undefined,
                address: formData.address.trim() || undefined,
            });
            toast.success("Proveedor actualizado con éxito", { id: toastId });
            navigate(ROUTES.providers.list);
        } catch (error) {
            console.error("Error al actualizar proveedor:", error);
            toast.error("Error al guardar cambios", { id: toastId });
        } finally {
            setLoading(false);
        }
    };

    return {
        id,
        formData,
        loading,
        isFetching,
        handleChange,
        handleSubmit,
    };
}
