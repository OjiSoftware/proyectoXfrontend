import { useState, useEffect } from "react";
import { Brand } from "@/types/brand.types";
import { SubCategory } from "@/types/subcategory.types";
import { Category } from "@/types/category.types";
import { productApi } from "@/services/ProductService";
import { getDriveDirectLink } from "@/helpers/url.helper";

export const useProductForm = () => {
    const [formData, setFormData] = useState({
        name: "",
        price: 0,
        stock: 0,
        categoryId: 0,
        subCategoryId: 0,
        brandId: 0,
        description: "",
        imageUrl: "",
        unit: "",
        showingInCatalog: false,
    });

    const [categories, setCategories] = useState<Category[]>([]);
    const [brands, setBrands] = useState<Brand[]>([]);
    const [allSubCategories, setAllSubCategories] = useState<SubCategory[]>([]);
    const [filteredSubCategories, setFilteredSubCategories] = useState<
        SubCategory[]
    >([]);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [cat, subCat, brands] = await Promise.all([
                    productApi.getAllCategories(),
                    productApi.getAllSubcategories(),
                    productApi.getAllBrands(),
                ]);

                setCategories(cat);
                setAllSubCategories(subCat);
                setBrands(brands);
            } catch (error) {
                console.error("Error cargando los datos de campos: ", error);
            }
        };
        loadData();
    }, []);

    useEffect(() => {
        const subs = allSubCategories.filter(
            (sub) => sub.categoryId === formData.categoryId,
        );
        setFilteredSubCategories(subs);

        // Reiniciar subCategoryId si cambió la categoría
        if (formData.subCategoryId !== 0) {
            setFormData((prev) => ({ ...prev, subCategoryId: 0 }));
        }
    }, [formData.categoryId, allSubCategories]);

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
        const numericFields = ["price", "stock", "categoryId", "subCategoryId", "brandId"];

        let finalValue: string | number | boolean = value;

        if (type === "checkbox") {
            finalValue = (e.target as HTMLInputElement).checked
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
        overrideData?: typeof formData,
    ) => {
        e?.preventDefault();
        const dataToSubmit = overrideData || formData;

        try {
            const { categoryId, ...productData } = dataToSubmit;

            if (productData.subCategoryId === 0 || productData.brandId === 0) {
                return;
            }

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
                subCategoryId: 0,
                brandId: 0,
                imageUrl: "",
                unit: "",
                showingInCatalog: false,
            });
        } catch (error) {
            console.error("Error al crear el producto:", error);
        }
    };

    return {
        formData,
        setFormData,
        categories,
        brands,
        filteredSubCategories,
        handleChange,
        handleSubmit,
    };
};
