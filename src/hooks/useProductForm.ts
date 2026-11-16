import { useState, useEffect } from "react";
import { Category } from "@/types/category.types";
import { Provider } from "@/types/provider.types";
import { productApi } from "@/services/ProductService";
import { getDriveDirectLink } from "@/helpers/url.helper";

export const useProductForm = () => {
    const [formData, setFormData] = useState<{
        name: string;
        price: number;
        stock: number;
        categoryId: number;
        providerId: number | null;
        description: string;
        imageUrl: string;
        unit: string | null;
        brandId: number | null;
        showingInCatalog: boolean;
        isOffer: boolean;
    }>({
        name: "",
        price: 0,
        stock: 0,
        categoryId: 0,
        providerId: null,
        description: "",
        imageUrl: "",
        unit: null,
        brandId: null,
        showingInCatalog: false,
        isOffer: false,
    });

    const [categories, setCategories] = useState<Category[]>([]);
    const [providers, setProviders] = useState<Provider[]>([]);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [cat, prov] = await Promise.all([
                    productApi.getAllCategories(),
                    productApi.getAllProviders().catch(() => []),
                ]);
                setCategories(cat);
                setProviders(prov);
            } catch (error) {
                console.error("Error cargando datos para productos: ", error);
            }
        };
        loadData();
    }, []);

    const updateField = (name: string, value: string | number | boolean | null) => {
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const { name, value, type } = e.target as HTMLInputElement;
        const numericFields = ["price", "stock", "categoryId", "providerId"];

        let finalValue: string | number | boolean | null = value;

        if (type === "checkbox") {
            finalValue = (e.target as HTMLInputElement).checked;
        } else if (name === "providerId") {
            finalValue = value === "" ? null : Number(value);
        } else if (numericFields.includes(name)) {
            finalValue = value === "" ? "" : Number(value);
            if (typeof finalValue === "number" && (name === "stock" || name === "price")) {
                finalValue = Math.max(0, finalValue);
            }
        } else if (name === "imageUrl") {
            finalValue = getDriveDirectLink(value);
        }

        updateField(name, finalValue);
    };

    const handleSubmit = async (
        e?: React.SyntheticEvent<HTMLFormElement>,
        overrideData?: Partial<typeof formData> & Record<string, any>,
    ) => {
        e?.preventDefault();
        const dataToSubmit = overrideData || formData;

        try {
            const productData: any = { ...dataToSubmit };

            if (productData.price < 0) productData.price = 0;
            if (productData.stock < 0) productData.stock = 0;

            const res = await productApi.create(productData);
            console.log("Producto creado:", res);

            // Resetear formulario
            setFormData({
                name: "",
                description: "",
                price: 0,
                stock: 0,
                categoryId: 0,
                providerId: null,
                imageUrl: "",
                unit: "",
                brandId: null,
                showingInCatalog: false,
                isOffer: false,
            });
        } catch (error) {
            console.error("Error al crear el producto:", error);
            throw error;
        }
    };

    return {
        formData,
        setFormData,
        categories,
        providers,
        handleChange,
        handleSubmit,
    };
};
