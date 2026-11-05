import { useState, useEffect } from "react";
import { Category } from "@/types/category.types";
import { productApi } from "@/services/ProductService";
import { getDriveDirectLink } from "@/helpers/url.helper";

export const useProductForm = () => {
    const [formData, setFormData] = useState<{
        name: string;
        price: number;
        stock: number;
        categoryId: number;
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
        description: "",
        imageUrl: "",
        unit: null,
        brandId: null,
        showingInCatalog: false,
        isOffer: false,
    });

    const [categories, setCategories] = useState<Category[]>([]);

    useEffect(() => {
        const loadData = async () => {
            try {
                const cat = await productApi.getAllCategories();
                setCategories(cat);
            } catch (error) {
                console.error("Error cargando categorías: ", error);
            }
        };
        loadData();
    }, []);

    const updateField = (name: string, value: string | number | boolean) => {
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const { name, value, type } = e.target as HTMLInputElement;
        const numericFields = ["price", "stock", "categoryId"];

        let finalValue: string | number | boolean = value;

        if (type === "checkbox") {
            finalValue = (e.target as HTMLInputElement).checked;
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
                imageUrl: "",
                unit: null,
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
        handleChange,
        handleSubmit,
    };
};
