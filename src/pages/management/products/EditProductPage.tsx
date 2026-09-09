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
        brands,
        subCategories,
        isLoading,
    } = useProductEdit();

    const navigate = useNavigate();
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    // Mock states for non-functional fields
    const [barcode, setBarcode] = useState("");
    const [costPriceInput, setCostPriceInput] = useState("");
    const [costPrice, setCostPrice] = useState(0);
    const [minStock, setMinStock] = useState("");

    // Profit Margin Calculation
    const profitMargin = costPrice > 0 && formData.price > 0 
        ? (((formData.price - costPrice) / costPrice) * 100).toFixed(1)
        : null;

    const filteredSubCategories = subCategories.filter(
        (sub) => sub.categoryId === formData.categoryId,
    );

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
            "brandId",
            "categoryId",
            "subCategoryId",
            "stock",
        ].includes(name);
        
        let finalValue: string | number | boolean = isNumeric ? parseInt(value) || 0 : value;

        if (name === "imageUrl") {
            finalValue = getDriveDirectLink(value as string);
        }

        setFormData((prev) => {
            const newState = { ...prev, [name]: finalValue };
            if (name === "categoryId" && prev.categoryId !== finalValue) {
                newState.subCategoryId = 0;
            }
            return newState;
        });
    };

    const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value;
        setPriceInput(raw);

        let parseableRaw = raw;
        if (raw.includes(",") && raw.includes(".")) {
            if (raw.lastIndexOf(",") > raw.lastIndexOf(".")) {
                parseableRaw = raw.replace(/\./g, "").replace(",", ".");
            } else {
                parseableRaw = raw.replace(/,/g, ""); 
            }
        } else {
            parseableRaw = raw.replace(/,/g, ".");
        }

        const numericValue = parseFloat(parseableRaw);
        setFormData((prev) => ({
            ...prev,
            price: isNaN(numericValue) ? 0 : Math.max(0, numericValue),
        }));
    };

    const handlePriceFocus = () => {
        if (formData.price > 0) {
            setPriceInput(formData.price.toString());
        } else {
            setPriceInput("");
        }
    };

    const handlePriceBlur = () => {
        setPriceInput(
            formData.price.toLocaleString("es-AR", {
                minimumFractionDigits: 2,
            }),
        );
    };

    const handleCostPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value;
        setCostPriceInput(raw);

        let parseableRaw = raw;
        if (raw.includes(",") && raw.includes(".")) {
            if (raw.lastIndexOf(",") > raw.lastIndexOf(".")) {
                parseableRaw = raw.replace(/\./g, "").replace(",", ".");
            } else {
                parseableRaw = raw.replace(/,/g, ""); 
            }
        } else {
            parseableRaw = raw.replace(/,/g, ".");
        }

        const numericValue = parseFloat(parseableRaw);
        setCostPrice(isNaN(numericValue) ? 0 : Math.max(0, numericValue));
    };

    const handleSubmit = async () => {
        setShowConfirmModal(false);
        const loadingToast = toast.loading("Guardando cambios...");

        try {
            // Implementación de blindaje igual al Create
            const payload: ProductEditBackend = {
                brandId: formData.brandId,
                subCategoryId: formData.subCategoryId,
                name: formData.name.trim(),
                stock: Math.max(0, Math.floor(Number(formData.stock) || 0)),
                price: Math.max(0, formData.price),
                description: formData.description.trim(),
                showingInCatalog: formData.showingInCatalog,
                imageUrl: formData.imageUrl?.trim() || "",
                unit: formData.unit.trim(),
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
        !formData.unit.trim() ||
        !formData.description.trim() ||
        !formData.categoryId ||
        !formData.subCategoryId ||
        !formData.brandId ||
        formData.price <= 0 ||
        isLoading;

    return (
        <DashboardLayout>
            <div className="max-w-5xl mx-auto px-4 h-full flex flex-col justify-center">
                {/* Volver y Encabezado */}
                <div className="flex justify-between items-end mb-4">
                    <div>
                        <div className="mb-2">
                            <button
                                onClick={() => navigate(-1)}
                                className="text-xs px-2 py-1 -ml-2 text-brand-400 hover:text-brand-300 mb-3 flex items-center gap-1 cursor-pointer"
                            >
                                ? Volver
                            </button>
                        </div>
                        <h1 className="text-xl md:text-2xl font-black text-slate-100 flex items-center gap-2">
                            <SquarePen className="text-indigo-400" size={22} />
                            Editar producto
                        </h1>
                    </div>
                    <p className="text-slate-400 text-xs hidden md:block">
                        Modifique la información necesaria del producto.
                    </p>
                </div>

                {/* Card de preview */}
                <div className="flex items-center gap-3 mb-4 bg-white/[0.02] p-3 rounded-2xl border border-white/5 shadow-inner">
                    <div className="w-12 h-12 rounded-xl bg-linear-to-r from-indigo-500 to-purple-500 p-[1px] shadow-[0_0_15px_rgba(99,102,241,0.2)]">
                        <div className="w-full h-full rounded-[11px] overflow-hidden bg-[#151320] flex items-center justify-center">
                            {formData.imageUrl ? (
                                <img
                                    src={getDriveDirectLink(formData.imageUrl)}
                                    alt={formData.name}
                                    className="w-full h-full object-contain"
                                />
                            ) : (
                                <ImageIcon
                                    className="text-slate-600"
                                    size={24}
                                />
                            )}
                        </div>
                    </div>
                    <div>
                        <h2 className="text-base font-bold text-slate-100 leading-tight">
                            {formData.name || "Sin nombre"}
                        </h2>
                        <p className="text-indigo-400 text-[9px] font-semibold tracking-widest uppercase mt-0.5">
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
                            subCategoryId,
                            brandId,
                            name,
                            unit,
                            price,
                        } = formData;

                        // Validaciones reforzadas (Igual que el Create)
                        if (!name.trim())
                            return toast.error("El nombre es obligatorio");
                        if (!unit.trim())
                            return toast.error(
                                "La unidad por bulto es obligatoria",
                            );
                        if (!categoryId)
                            return toast.error("Selecciona una Categoría");
                        if (!subCategoryId)
                            return toast.error("Selecciona una Subcategoría");
                        if (!brandId)
                            return toast.error("Selecciona una Marca");
                        if (price <= 0)
                            return toast.error("El precio debe ser mayor a 0");

                        setShowConfirmModal(true);
                    }}
                    className="bg-[#0C0A15]/95 border border-white/10 p-5 md:p-6 rounded-[24px] shadow-[0_0_50px_rgba(0,0,0,0.5)] backdrop-blur-3xl ring-1 ring-white/5 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-3"
                >
                    {/* Columna izquierda */}
                    <div className="space-y-3.5">
                        <h3 className="text-indigo-400 text-[9px] font-bold tracking-widest border-b border-white/5 pb-1 uppercase">
                            Información básica
                        </h3>

                        <div>
                            <label className="block text-[9px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
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
                                className="w-full bg-[#151320] border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-400/50 outline-none transition-all placeholder:text-slate-600 shadow-inner"
                                required
                            />
                        </div>

                        <div>
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
                        </div>

                        <div>
                            <label className="block text-[9px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                                Código de barra
                            </label>
                            <input
                                type="text"
                                value={barcode}
                                onChange={(e) => setBarcode(e.target.value)}
                                placeholder="Escanee o ingrese código"
                                className="w-full bg-[#151320] border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-400/50 outline-none transition-all placeholder:text-slate-600 shadow-inner"
                            />
                        </div>

                        <div>
                            <label className="block text-[9px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                                Descripción <span className="font-bold text-indigo-400">*</span>
                            </label>
                            <textarea
                                name="description"
                                maxLength={500}
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Características..."
                                className="w-full bg-[#151320] border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-400/50 outline-none transition-all placeholder:text-slate-600 shadow-inner resize-none h-20"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-[9px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                                URL de Imagen
                            </label>
                            <input
                                type="url"
                                name="imageUrl"
                                autoComplete="off"
                                value={formData.imageUrl}
                                onChange={handleChange}
                                placeholder="Pegar URL"
                                className="w-full bg-[#151320] border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-400/50 outline-none transition-all placeholder:text-slate-600 shadow-inner"
                            />
                        </div>
                    </div>

                    {/* Columna derecha */}
                    <div className="flex flex-col mt-2 md:mt-0">
                        <h3 className="text-indigo-400 text-[9px] font-bold tracking-widest border-b border-white/5 pb-1 mb-4 uppercase">
                            Categorización y precio
                        </h3>

                        <div className="space-y-3.5 grow">
                            <div>
                                <label className="block text-[9px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                                    Categoría{" "}
                                    <span className="font-bold text-indigo-400">*</span>
                                </label>
                                <select
                                    name="categoryId"
                                    value={formData.categoryId || ""}
                                    onChange={handleChange}
                                    className="w-full bg-[#151320] border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-400/50 outline-none transition-all cursor-pointer shadow-inner"
                                    required
                                >
                                    <option value="" disabled>
                                        Seleccionar...
                                    </option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
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
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="col-span-1">
                                    <label className="block text-[9px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                                        Costo ($)
                                    </label>
                                    <input
                                        type="text"
                                        value={costPriceInput}
                                        onChange={handleCostPriceChange}
                                        placeholder="0,00"
                                        className="w-full bg-[#151320] border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-400/50 outline-none transition-all placeholder:text-slate-600 shadow-inner"
                                    />
                                </div>
                                <div className="col-span-1">
                                    <label className="block text-[9px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                                        Venta ($){" "}
                                        <span className="font-bold text-indigo-400">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="price"
                                        autoComplete="off"
                                        value={priceInput}
                                        onChange={handlePriceChange}
                                        onFocus={handlePriceFocus}
                                        onBlur={handlePriceBlur}
                                        placeholder="0,00"
                                        className="w-full bg-[#151320] border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-400/50 outline-none transition-all placeholder:text-slate-600 shadow-inner"
                                        required
                                    />
                                </div>
                            </div>

                            {profitMargin && (
                                <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-lg p-2 flex justify-between items-center -mt-1">
                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Margen de ganancia</span>
                                    <span className="text-[10px] font-black text-emerald-400">+{profitMargin}%</span>
                                </div>
                            )}

                             <div className="grid grid-cols-2 gap-3 mt-1">
                                <div className="col-span-1">
                                    <label className="block text-[9px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                                        Stock{" "}
                                        <span className="font-bold text-indigo-400">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        name="stock"
                                        value={formData.stock}
                                        onChange={handleChange}
                                        className="w-full bg-[#151320] border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-400/50 outline-none transition-all placeholder:text-slate-600 shadow-inner"
                                        required
                                    />
                                </div>
                                <div className="col-span-1">
                                    <label className="block text-[9px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                                        Stock mínimo
                                    </label>
                                    <input
                                        type="number"
                                        value={minStock}
                                        onChange={(e) => setMinStock(e.target.value)}
                                        placeholder="0"
                                        className="w-full bg-[#151320] border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-400/50 outline-none transition-all placeholder:text-slate-600 shadow-inner"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-2 mt-4">
                                <input
                                    type="checkbox"
                                    id="showInCatalog"
                                    name="showingInCatalog"
                                    checked={formData.showingInCatalog || false}
                                    onChange={handleChange}
                                    className="w-4 h-4 rounded border border-white/10 text-indigo-500 focus:ring-indigo-500/50 bg-[#151320] cursor-pointer shadow-inner"
                                />
                                <label
                                    htmlFor="showInCatalog"
                                    className="text-[9px] font-bold uppercase tracking-wider text-slate-300 cursor-pointer"
                                >
                                    Mostrar en catálogo
                                </label>
                            </div>
                        </div>

                        {/* Botones de acción */}
                        <div className="flex flex-col items-end w-full">
                            <div className="flex flex-row items-stretch gap-2.5 mt-6 w-full border-t border-white/5 pt-5">
                                <button
                                    type="button"
                                    onClick={() =>
                                        navigate("/management/products")
                                    }
                                    className="flex-1 md:flex-none md:min-w-32 px-5 py-2.5 text-[11px] font-bold rounded-xl border border-white/10 text-slate-300 bg-transparent transition-all duration-300 cursor-pointer hover:bg-white/5 hover:text-white active:scale-95"
                                >
                                    Cancelar
                                </button>

                                <button
                                    type="submit"
                                    disabled={isFormInvalid}
                                    className={`flex-1 md:flex-none md:min-w-32 px-5 py-2.5 text-[11px] font-bold border rounded-xl transition-all duration-300 active:scale-95 active:translate-y-0 ${
                                          isFormInvalid
                                              ? "bg-slate-800 text-slate-500 cursor-not-allowed opacity-40 border-white/5 pointer-events-none"
                                              : "bg-emerald-600/20 text-emerald-400 border-emerald-500/30 cursor-pointer hover:bg-emerald-500/30 hover:border-emerald-400/50 hover:-translate-y-0.5 shadow-[0_0_20px_rgba(16,185,129,0.15)]"
                                      }`}
                                >
                                    Guardar cambios
                                </button>
                            </div>

                            <div className="relative h-6 w-full">
                                {" "}
                                {isFormInvalid && !isLoading && (
                                    <p className="absolute top-4 right-0 text-slate-500 text-[10px] text-right uppercase tracking-wide font-medium">
                                        * Complete todos los campos requeridos
                                        para guardar
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

