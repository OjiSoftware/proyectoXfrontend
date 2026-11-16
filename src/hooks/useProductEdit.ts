// src/hooks/useProductEdit.ts
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { productApi } from "@/services/ProductService";
import toast from "react-hot-toast";
import { ProductEditFrontend } from "@/types/product.types";
import { Category } from "@/types/category.types";
import { Provider } from "@/types/provider.types";
/* import { SubCategory } from "@/types/subcategory.types"; */
import { Brand } from "@/types/brand.types";

export function useProductEdit() {
    const { id } = useParams();

    const [formData, setFormData] = useState<ProductEditFrontend>({
        name: "",
        brandId: null,
        categoryId: 0,
        providerId: null,
        price: 0,
        costPrice: null,
        description: "",
        showingInCatalog: false,
        isOffer: false,
        stock: 0,
        imageUrl: "",
        unit: "",
    });

    const [priceInput, setPriceInput] = useState<string>("0,00");
    const [categories, setCategories] = useState<Category[]>([]);
    const [providers, setProviders] = useState<Provider[]>([]);
    const [brands, setBrands] = useState<Brand[]>([]);
    /*     const [subCategories, setSubCategories] = useState<SubCategory[]>([]); */
    const [isLoading, setLoading] = useState(false);

    // Función para formatear números a ARS
    const formatARS = (value: number) =>
        value.toLocaleString("es-AR", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });

    useEffect(() => {
        if (!id) return;

        const loadData = async () => {
            setLoading(true);
            try {
                const [
                    productData,
                    categoriesData,
                    providersData,
                    brandsData,
                    /*                     subcategoriesData, */
                ] = await Promise.all([
                    productApi.getById(id),
                    productApi.getAllCategories(),
                    productApi.getAllProviders().catch(() => []),
                    productApi.getAllBrands(),
                    /*                     productApi.getAllSubcategories(), */
                ]);

                setCategories(categoriesData);
                setProviders(providersData);
                setBrands(brandsData);
                /*                 setSubCategories(subcategoriesData); */

                // Buscar la categoría correspondiente a la subcategoría
                /*                 const subCat: SubCategory | undefined = subcategoriesData.find(
                                    (sub: SubCategory) => sub.id === productData.subCategoryId,
                                ); */

                const newFormData: ProductEditFrontend = {
                    name: productData.name || "",
                    barcode: productData.barcode || "",
                    brandId: productData.brandId ?? null,
                    categoryId: productData.categoryId || productData.category?.id || 0,
                    providerId: productData.providerId ?? productData.provider?.id ?? null,
                    price: productData.price || 0,
                    costPrice: productData.costPrice != null ? Number(productData.costPrice) : null,
                    description: productData.description || "",
                    showingInCatalog: productData.showingInCatalog ?? false,
                    stock: productData.stock || 0,
                    imageUrl: productData.imageUrl || "",
                    unit: productData.unit ?? "",
                    isOffer: productData.isOffer ?? false,
                };

                setFormData(newFormData);
                setPriceInput(formatARS(Number(productData.price)));
            } catch (error) {
                console.error("Error al cargar datos:", error);
                toast.error("Error al cargar los datos del producto.");
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [id]);

    return {
        id,
        formData,
        setFormData,
        priceInput,
        setPriceInput,
        categories,
        providers,
        brands,
        /*  subCategories, */
        isLoading,
        formatARS,
    };
}
