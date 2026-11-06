import React, { useState } from "react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { useNavigate } from "react-router-dom";
import { ConfirmModal } from "../../../components/ConfirmModal";
import { productApi } from "@/services/ProductService";
import toast from "react-hot-toast";
import { useProductEdit } from "@/hooks/useProductEdit";
import { SquarePen, Image as ImageIcon } from "lucide-react";
import type { ProductEditBackend } from "@/types/product.types";
import { getDriveDirectLink } from "@/helpers/url.helper";

export default function EditProductPage() {
    const {
        id,
        formData,
        setFormData,
        priceInput,
        setPriceInput,
        categories,
        /*         brands,
                subCategories, */
        isLoading,
    } = useProductEdit();

    const navigate = useNavigate();
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    // Mock states for non-functional fields
    const [barcode, setBarcode] = useState("");
    const [costPriceInput, setCostPriceInput] = useState("");
    const [costPrice, setCostPrice] = useState(0);
    const [marginInput, setMarginInput] = useState("");
    const [minStock, setMinStock] = useState("");

    const isDataLoadedRef = React.useRef(false);

    // Sincronizar el barcode, costPrice y margen inicial SOLO cuando los datos llegan del backend
    React.useEffect(() => {
        if (!isDataLoadedRef.current && (formData.price > 0 || formData.barcode || formData.costPrice)) {
            isDataLoadedRef.current = true;
            if (formData.barcode) {
                setBarcode(formData.barcode);
            }
            if (formData.costPrice !== undefined && formData.costPrice !== null) {
                const numCost = Number(formData.costPrice);
                setCostPrice(numCost);
                setCostPriceInput(numCost > 0 ? numCost.toString() : "");
                if (numCost > 0 && formData.price > 0) {
                    setMarginInput((((formData.price - numCost) / numCost) * 100).toFixed(2));
                }
            }
            if (formData.price > 0) {
                setPriceInput(formData.price.toString());
            }
        }
    }, [formData.barcode, formData.costPrice, formData.price, setPriceInput]);

    /*     const filteredSubCategories = subCategories.filter(
            (sub) => sub.categoryId === formData.categoryId,
        ); */

    if (!id)
        return (
            <DashboardLayout>
                <div className="flex flex-col items-center justify-center h-full text-white">
                    <h1 className="text-2xl font-bold">
                        Producto no encontrado
                    </h1>
                    <button
                        onClick={() => navigate("/management/products")}
                        className="mt-4 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition"
                    >
                        Volver
                    </button>
                </div>
            </DashboardLayout>
        );

    // ---------------- Handlers ----------------
    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
        >,
    ) => {
        const { name, value, type } = e.target;

        if (type === "checkbox") {
            const { checked } = e.target as HTMLInputElement;
            setFormData((prev) => ({ ...prev, [name]: checked }));
            return;
        }

        const isNumeric = [
            /*             "brandId", */
            "categoryId",
            /* "subCategoryId", */
            "stock",
        ].includes(name);

        let finalValue: string | number | boolean = isNumeric ? parseInt(value) || 0 : value;

        if (name === "imageUrl") {
            finalValue = getDriveDirectLink(value as string);
        }

        /*         setFormData((prev) => {
                    const newState = { ...prev, [name]: finalValue };
                    if (name === "categoryId" && prev.categoryId !== finalValue) {
                        newState.subCategoryId = 0;
                    }
                    return newState;
                }); */

        setFormData((prev) => ({ ...prev, [name]: finalValue }));
    };

    // ---------------- Handlers de Precios y Margen ----------------
    // 1. VENTA: se edita de forma independiente. Si hay costo > 0, actualiza el margen.
    const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setPriceInput(val);

        const newPrice = parseFloat(val);
        const validPrice = !isNaN(newPrice) && newPrice >= 0 ? newPrice : 0;
        setFormData((prev) => ({
            ...prev,
            price: validPrice,
        }));

        if (costPrice > 0 && validPrice > 0) {
            const calculatedMargin = (((validPrice - costPrice) / costPrice) * 100).toFixed(2);
            setMarginInput(calculatedMargin);
        } else {
            setMarginInput("");
        }
    };

    // 2. COSTO: se edita de forma independiente. Si hay venta > 0, actualiza el margen. NUNCA toca la venta.
    const handleCostPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setCostPriceInput(val);

        const newCost = parseFloat(val);
        const validCost = !isNaN(newCost) && newCost >= 0 ? newCost : 0;
        setCostPrice(validCost);

        if (validCost > 0 && formData.price > 0) {
            const calculatedMargin = (((formData.price - validCost) / validCost) * 100).toFixed(2);
            setMarginInput(calculatedMargin);
        } else {
            setMarginInput("");
        }
    };

    // 3. MARGEN: solo cuando el usuario tipea explícitamente en el margen, si hay costo > 0, calcula la venta.
    const handleMarginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setMarginInput(val);

        if (val.trim() === "") {
            return;
        }

        const numericMargin = parseFloat(val);
        if (!isNaN(numericMargin) && costPrice > 0) {
            const calculatedPrice = Number((costPrice * (1 + numericMargin / 100)).toFixed(2));
            setFormData((prev) => ({
                ...prev,
                price: calculatedPrice,
            }));
            setPriceInput(calculatedPrice.toString());
        }
    };

    const handleSubmit = async () => {
        setShowConfirmModal(false);
        const loadingToast = toast.loading("Guardando cambios...");

        try {
            // Implementación de blindaje igual al Create
            const payload: ProductEditBackend = {
                categoryId: formData.categoryId,
                barcode: barcode.trim(),
                name: formData.name.trim(),
                stock: Math.max(0, Math.floor(Number(formData.stock) || 0)),
                price: Math.max(0, formData.price),
                costPrice: costPrice > 0 ? costPrice : null,
                description: formData.description.trim(),
                showingInCatalog: formData.showingInCatalog,
                imageUrl: formData.imageUrl?.trim() || "",
                isOffer: formData.isOffer ?? false,
                unit: null,
                brandId: null,
            };

            await productApi.update(id!, payload);

            toast.success("¡Producto actualizado con éxito!", {
                id: loadingToast,
            });
            navigate("/management/products");
        } catch (error) {
            console.error("Error al actualizar:", error);
            toast.error("Hubo un error al guardar los cambios.", {
                id: loadingToast,
            });
        }
    };

    const isFormInvalid =
        !formData.name.trim() ||
        /*         !formData.unit.trim() || */
        !formData.categoryId ||
        /*         !formData.subCategoryId ||
                !formData.brandId || */
        formData.price <= 0 ||
        isLoading;

    return (
        <DashboardLayout>
            <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 h-full flex flex-col justify-center">
                {/* Volver y Encabezado */}
                <div className="flex justify-between items-end mb-4">
                    <div>
                        <div className="mb-2">
                            <button
                                onClick={() => navigate(-1)}
                                className="text-xs px-2 py-1 -ml-2 text-indigo-400 hover:text-indigo-300 mb-2 flex items-center gap-1 cursor-pointer font-medium"
                            >
                                ← Volver
                            </button>
                        </div>
                        <h1 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
                            <SquarePen className="text-indigo-400" size={24} />
                            Editar producto
                        </h1>
                    </div>
                    <p className="text-slate-300 text-sm hidden md:block">
                        Modifique la información necesaria del producto.
                    </p>
                </div>

                {/* Card de preview */}
                <div className="flex items-center gap-3 mb-4 bg-white/[0.02] p-3 rounded-2xl border border-white/5 shadow-inner">
                    <div className="w-12 h-12 rounded-xl bg-linear-to-r from-indigo-500 to-purple-500 p-[1px] shadow-[0_0_15px_rgba(99,102,241,0.2)] shrink-0">
                        <div className="w-full h-full rounded-[11px] overflow-hidden bg-[#151320] flex items-center justify-center">
                            {formData.imageUrl ? (
                                <img
                                    src={getDriveDirectLink(formData.imageUrl)}
                                    alt={formData.name}
                                    className="w-full h-full object-contain"
                                />
                            ) : (
                                <ImageIcon
                                    className="text-slate-500"
                                    size={24}
                                />
                            )}
                        </div>
                    </div>
                    <div>
                        <h2 className="text-base font-bold text-white leading-tight">
                            {formData.name || "Sin nombre"}
                        </h2>
                        <p className="text-indigo-400 text-xs font-semibold tracking-wider uppercase mt-0.5">
                            ID: #{id}
                        </p>
                    </div>
                </div>

                {/* Formulario */}
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        const {
                            categoryId,
                            /*                             subCategoryId,
                                                        brandId, */
                            name,
                            unit,
                            price,
                        } = formData;

                        // Validaciones reforzadas (Igual que el Create)
                        if (!name.trim())
                            return toast.error("El nombre es obligatorio");
                        if (!barcode)
                            return toast.error("El codigo de barras es obligatorio")
                        /*                         if (!unit.trim())
                                                    return toast.error(
                                                        "La unidad por bulto es obligatoria",
                                                    ); */
                        if (!categoryId)
                            return toast.error("Selecciona una Categoría");
                        /*                         if (!subCategoryId)
                                                    return toast.error("Selecciona una Subcategoría");
                                                if (!brandId)
                                                    return toast.error("Selecciona una Marca"); */
                        if (price <= 0)
                            return toast.error("El precio debe ser mayor a 0");

                        setShowConfirmModal(true);
                    }}
                    className="bg-[#0C0A15]/95 border border-white/10 p-5 md:p-6 rounded-[24px] shadow-[0_0_50px_rgba(0,0,0,0.5)] backdrop-blur-3xl ring-1 ring-white/5 grid grid-cols-1 md:grid-cols-2 gap-x-6 lg:gap-x-8 gap-y-4"
                >
                    {/* Columna izquierda */}
                    <div className="space-y-4">
                        <h3 className="text-indigo-400 text-xs font-semibold tracking-wider border-b border-white/5 pb-1 uppercase">
                            Información básica
                        </h3>

                        <div>
                            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                                Nombre del producto{" "}
                                <span className="font-bold text-indigo-400">*</span>
                            </label>
                            <input
                                type="text"
                                name="name"
                                autoComplete="off"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Ej: Teclado Mecánico RGB"
                                className="w-full bg-[#151320] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-400/50 outline-none transition-all placeholder:text-slate-500 shadow-inner"
                                required
                            />
                        </div>

                        {/*                         <div>
                            <label className="block text-[9px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                                Unidad por bulto{" "}
                                <span className="font-bold text-indigo-400">*</span>
                            </label>
                            <input
                                type="text"
                                name="unit"
                                autoComplete="off"
                                value={formData.unit}
                                onChange={handleChange}
                                placeholder="Ej: 24 unidades"
                                className="w-full bg-[#151320] border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-400/50 outline-none transition-all placeholder:text-slate-600 shadow-inner"
                                required
                            />
                        </div> */}

                        <div>
                            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                                Código de barra{" "}
                                <span className="font-bold text-indigo-400">*</span>
                            </label>
                            <input
                                type="text"
                                value={barcode}
                                onChange={(e) => setBarcode(e.target.value)}
                                placeholder="Escanee o ingrese código"
                                className="w-full bg-[#151320] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm font-mono text-slate-100 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-400/50 outline-none transition-all placeholder:text-slate-500 shadow-inner"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                                Descripción
                            </label>
                            <textarea
                                name="description"
                                maxLength={500}
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Características..."
                                className="w-full bg-[#151320] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-400/50 outline-none transition-all placeholder:text-slate-500 shadow-inner resize-none h-24"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                                URL de Imagen
                            </label>
                            <input
                                type="url"
                                name="imageUrl"
                                autoComplete="off"
                                value={formData.imageUrl}
                                onChange={handleChange}
                                placeholder="Pegar URL"
                                className="w-full bg-[#151320] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-400/50 outline-none transition-all placeholder:text-slate-500 shadow-inner"
                            />
                        </div>
                    </div>

                    {/* Columna derecha */}
                    <div className="flex flex-col mt-2 md:mt-0">
                        <h3 className="text-indigo-400 text-xs font-semibold tracking-wider border-b border-white/5 pb-1 mb-4 uppercase">
                            Categorización y precio
                        </h3>

                        <div className="space-y-4 grow">
                            <div>
                                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                                    Categoría{" "}
                                    <span className="font-bold text-indigo-400">*</span>
                                </label>
                                <select
                                    name="categoryId"
                                    value={formData.categoryId || ""}
                                    onChange={handleChange}
                                    className="w-full bg-[#151320] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-400/50 outline-none transition-all cursor-pointer shadow-inner"
                                    required
                                >
                                    <option value="" disabled className="text-slate-500">
                                        Seleccionar...
                                    </option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.id} className="bg-[#151320] text-slate-100">
                                            {cat.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/*                             <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[9px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                                        Subcategoría{" "}
                                        <span className="font-bold text-indigo-400">*</span>
                                    </label>
                                    <select
                                        name="subCategoryId"
                                        value={formData.subCategoryId || ""}
                                        onChange={handleChange}
                                        className="w-full bg-[#151320] border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-400/50 outline-none transition-all cursor-pointer shadow-inner"
                                        required
                                    >
                                        <option value="" disabled>
                                            Seleccionar...
                                        </option>
                                        {filteredSubCategories.map((sub) => (
                                            <option key={sub.id} value={sub.id}>
                                                {sub.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[9px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                                        Marca{" "}
                                        <span className="font-bold text-indigo-400">*</span>
                                    </label>
                                    <select
                                        name="brandId"
                                        value={formData.brandId || ""}
                                        onChange={handleChange}
                                        className="w-full bg-[#151320] border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-400/50 outline-none transition-all cursor-pointer shadow-inner"
                                        required
                                    >
                                        <option value="" disabled>
                                            Seleccionar...
                                        </option>
                                        {brands.map((brand) => (
                                            <option
                                                key={brand.id}
                                                value={brand.id}
                                            >
                                                {brand.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div> */}

                            <div className="grid grid-cols-2 gap-3">
                                <div className="col-span-1">
                                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                                        Costo ($)
                                    </label>
                                    <input
                                        type="number"
                                        step="any"
                                        min="0"
                                        value={costPriceInput}
                                        onChange={handleCostPriceChange}
                                        placeholder="0"
                                        className="w-full bg-[#151320] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm font-mono text-slate-100 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-400/50 outline-none transition-all placeholder:text-slate-500 shadow-inner [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                    />
                                </div>
                                <div className="col-span-1">
                                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                                        Margen (%)
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            step="any"
                                            value={marginInput}
                                            onChange={handleMarginChange}
                                            placeholder="30"
                                            className="w-full bg-[#151320] border border-white/10 rounded-xl pl-3.5 pr-8 py-2.5 text-sm font-semibold text-indigo-300 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-400/50 outline-none transition-all placeholder:text-slate-500 shadow-inner [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                                            %
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                                    Venta ($){" "}
                                    <span className="font-bold text-indigo-400">*</span>
                                </label>
                                <input
                                    type="number"
                                    step="any"
                                    min="0"
                                    name="price"
                                    autoComplete="off"
                                    value={priceInput}
                                    onChange={handlePriceChange}
                                    placeholder="0"
                                    className="w-full bg-[#151320] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm font-mono text-emerald-400 font-bold focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-400/50 outline-none transition-all placeholder:text-slate-500 shadow-inner [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3 mt-1">
                                <div className="col-span-1">
                                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                                        Stock{" "}
                                        <span className="font-bold text-indigo-400">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        name="stock"
                                        value={formData.stock}
                                        onChange={handleChange}
                                        className="w-full bg-[#151320] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm font-mono text-slate-100 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-400/50 outline-none transition-all placeholder:text-slate-500 shadow-inner"
                                        required
                                    />
                                </div>
                                <div className="col-span-1">
                                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                                        Stock mínimo
                                    </label>
                                    <input
                                        type="number"
                                        value={minStock}
                                        onChange={(e) => setMinStock(e.target.value)}
                                        placeholder="0"
                                        className="w-full bg-[#151320] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm font-mono text-slate-100 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-400/50 outline-none transition-all placeholder:text-slate-500 shadow-inner"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-4 mt-4">
                                <label className="flex items-center gap-2 cursor-pointer select-none">
                                    <input
                                        type="checkbox"
                                        id="showInCatalog"
                                        name="showingInCatalog"
                                        checked={formData.showingInCatalog || false}
                                        onChange={handleChange}
                                        className="w-4 h-4 rounded border border-white/10 text-indigo-500 focus:ring-indigo-500/50 bg-[#151320] cursor-pointer shadow-inner"
                                    />
                                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-200">
                                        Mostrar en catálogo
                                    </span>
                                </label>

                                <label className="flex items-center gap-2 cursor-pointer select-none">
                                    <input
                                        type="checkbox"
                                        id="isOffer"
                                        name="isOffer"
                                        checked={formData.isOffer ?? false}
                                        onChange={handleChange}
                                        className="w-4 h-4 rounded border border-white/10 text-indigo-500 focus:ring-indigo-500/50 bg-[#151320] cursor-pointer shadow-inner"
                                    />
                                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-200">
                                        Oferta
                                    </span>
                                </label>
                            </div>
                        </div>

                        {/* Botones de acción */}
                        <div className="flex flex-col items-end w-full">
                            <div className="flex flex-row items-stretch gap-3 mt-6 w-full border-t border-white/5 pt-5">
                                <button
                                    type="button"
                                    onClick={() =>
                                        navigate("/management/products")
                                    }
                                    className="flex-1 md:flex-none md:min-w-32 px-5 py-2.5 text-xs font-semibold rounded-xl border border-white/10 text-slate-300 bg-transparent transition-all duration-300 cursor-pointer hover:bg-white/5 hover:text-white active:scale-95"
                                >
                                    Cancelar
                                </button>

                                <button
                                    type="submit"
                                    disabled={isFormInvalid}
                                    className={`flex-1 md:flex-none md:min-w-32 px-5 py-2.5 text-xs font-semibold border rounded-xl transition-all duration-300 active:scale-95 active:translate-y-0 ${isFormInvalid
                                        ? "bg-slate-800 text-slate-500 cursor-not-allowed opacity-40 border-white/5 pointer-events-none"
                                        : "bg-emerald-600/20 text-emerald-400 border-emerald-500/30 cursor-pointer hover:bg-emerald-500/30 hover:border-emerald-400/50 hover:-translate-y-0.5 shadow-[0_0_20px_rgba(16,185,129,0.15)]"
                                        }`}
                                >
                                    Guardar cambios
                                </button>
                            </div>

                            <div className="relative h-6 w-full">
                                {isFormInvalid && !isLoading && (
                                    <p className="absolute top-3 right-0 text-amber-400/80 text-xs text-right font-medium">
                                        * Complete todos los campos requeridos para guardar
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </form>

                <ConfirmModal
                    isOpen={showConfirmModal}
                    title="Guardar cambios"
                    variant="success"
                    message={
                        <>
                            ¿Seguro que querés guardar los cambios de{" "}
                            <b>{formData.name}</b>?
                        </>
                    }
                    isLoading={isLoading}
                    onCancel={() => setShowConfirmModal(false)}
                    onConfirm={handleSubmit}
                    confirmText="Guardar"
                    cancelText="Cancelar"
                />
            </div>
        </DashboardLayout>
    );
}

