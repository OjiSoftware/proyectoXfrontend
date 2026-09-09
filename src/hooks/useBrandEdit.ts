import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { brandApi } from "@/services/BrandService";
import toast from "react-hot-toast";

export function useBrandEdit() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [name, setName] = useState("");
    /* const [subCategoryId, setSubCategoryId] = useState<number | undefined>(
        undefined,
    ); */
    const [loading, setLoading] = useState(false);

    // Fetch inicial
    useEffect(() => {
        if (!id) return;

        const fetchBrand = async () => {
            try {
                const brands = await brandApi.getAll();
                const brand = brands.find((b: any) => b.id === parseInt(id));
                if (!brand) {
                    toast.error("Marca no encontrada");
                    navigate("/management/brands");
                } else {
                    setName(brand.name);
                    /* setSubCategoryId(brand.subCategoryId); */
                }
            } catch (error) {
                console.error("Error cargando marca:", error);
                toast.error("Error al cargar la marca");
            }
        };

        fetchBrand();
    }, [id, navigate]);

    const handleSubmit = async () => {
        if (!id /* || subCategoryId === undefined */) return;

        setLoading(true);
        const toastId = toast.loading("Guardando cambios...");
        try {
            await brandApi.update(id, { name });
            toast.success("Marca actualizada con éxito", { id: toastId });
            navigate("/management/brands");
        } catch (error) {
            console.error("Error al actualizar marca:", error);
            toast.error("Error al guardar cambios", { id: toastId });
        } finally {
            setLoading(false);
        }
    };

    return {
        id,
        name,
        setName,
        /* subCategoryId, */
        /* setSubCategoryId, */
        loading,
        handleSubmit,
    };
}
