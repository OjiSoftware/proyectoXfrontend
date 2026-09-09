// src/hooks/useCreateBrand.ts
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { productApi } from "@/services/ProductService";
import { brandApi } from "@/services/BrandService";

import { Category } from "@/types/category.types";
import { SubCategory } from "@/types/subcategory.types";

export function useCreateBrand() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        categoryId: 0,
        subCategoryId: 0,
    });

    const [categories, setCategories] = useState<Category[]>([]);
    const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
    const [filteredSubCategories, setFilteredSubCategories] = useState<
        SubCategory[]
    >([]);
    const [isLoading, setIsLoading] = useState(false);

    /* -------------------------------------------------------------------------- */
    /*                     Cargar categorías y subcategorías                      */
    /* -------------------------------------------------------------------------- */
    /*     useEffect(() => {
            const loadData = async () => {
                try {
                    const [catData, subData] = await Promise.all([
                        productApi.getAllCategories(),
                        productApi.getAllSubcategories(),
                    ]);

                    setCategories(catData);
                    setSubCategories(subData);
                } catch (error) {
                    console.error(error);
                    toast.error("Error cargando datos");
                }
            };

            loadData();
        }, []); */

    /* -------------------------------------------------------------------------- */
    /*                         Filtrar subcategorías                              */
    /* -------------------------------------------------------------------------- */
    /*     useEffect(() => {
            const filtered = subCategories.filter(
                (sub) => Number(sub.categoryId) === Number(formData.categoryId),
            );

            setFilteredSubCategories(filtered);

            // reset subcategoría cuando cambia categoría
            setFormData((prev) => ({
                ...prev,
                subCategoryId: 0,
            }));
        }, [formData.categoryId, subCategories]); */

    /* -------------------------------------------------------------------------- */
    /*                              Handle inputs                                 */
    /* -------------------------------------------------------------------------- */
    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    ) => {
        const { name, value } = e.target;

        const finalValue = name.includes("Id") ? Number(value) : value;

        setFormData((prev) => ({
            ...prev,
            [name]: finalValue,
        }));
    };

    /* -------------------------------------------------------------------------- */
    /*                              Crear brand                                   */
    /* -------------------------------------------------------------------------- */
    const handleSubmit = async () => {
        if (!formData.name /* || formData.subCategoryId === 0 */) {
            toast.error("Completa todos los campos");
            return;
        }

        setIsLoading(true);
        const loadingToast = toast.loading("Creando marca...");

        try {
            await brandApi.create({
                name: formData.name,
                /* subCategoryId: formData.subCategoryId, */
            });

            toast.success("Marca creada con éxito", { id: loadingToast });
            navigate("/management/brands");
        } catch (error) {
            console.error(error);
            toast.error("Error al crear marca", { id: loadingToast });
        } finally {
            setIsLoading(false);
        }
    };

    return {
        formData,
        /* categories, */
        /* filteredSubCategories, */
        isLoading,
        handleChange,
        handleSubmit,
    };
}
