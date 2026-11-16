import { useState } from "react";
import { toast } from "react-hot-toast";
import { Provider } from "@/types/provider.types";
import { providerApi } from "@/services/ProviderService";

export function useDeleteProvider(
    setProviders: React.Dispatch<React.SetStateAction<Provider[]>>,
) {
    const [loading, setLoading] = useState(false);

    const deleteProvider = async (id: number) => {
        setLoading(true);

        try {
            await providerApi.delete(id.toString());
            setProviders((prev) => prev.filter((p) => p.id !== id));
            toast.success("Proveedor eliminado");
        } catch (error) {
            console.error(error);
            toast.error("No se pudo eliminar el proveedor");
        } finally {
            setLoading(false);
        }
    };

    return { deleteProvider, loading };
}
