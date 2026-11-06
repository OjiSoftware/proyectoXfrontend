import React, { useState } from "react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { PackagePlus, Image as ImageIcon } from "lucide-react";
import { ConfirmModal } from "@/components/ConfirmModal";
import toast from "react-hot-toast";
import { useProductForm } from "@/hooks/useProductForm";
import { useNavigate } from "react-router-dom";
import { getDriveDirectLink } from "@/helpers/url.helper";

export default function CreateProductPage() {
    const {
        formData,
        setFormData,
        categories,
        handleChange,
        handleSubmit: submitFormData,
    } = useProductForm();

    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [priceInput, setPriceInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    // Mock states for non-functional fields
    const [barcode, setBarcode] = useState("");
    const [costPriceInput, setCostPriceInput] = useState("");
    const [costPrice, setCostPrice] = useState(0);
    const [marginInput, setMarginInput] = useState("");
    const [minStock, setMinStock] = useState("");

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
        setIsLoading(true);
        const loadingToast = toast.loading("Creando producto...");

        try {
            await submitFormData(undefined, {
                ...formData,
                unit: null,
                brandId: null,
                barcode: barcode.trim(),
                name: formData.name.trim(), // Limpiamos espacios accidentales
                price: Math.max(0, formData.price),
                costPrice: costPrice > 0 ? costPrice : null,
                // Blindaje de stock: aseguramos que sea entero y no negativo
                stock: Math.max(0, Math.floor(Number(formData.stock) || 0)),
            });

            toast.success("¡Producto creado con éxito!", { id: loadingToast });
            setPriceInput("");
            navigate("/management/products");
        } catch (error) {
            console.error(error);
            toast.error("Hubo un error al crear el producto.", {
                id: loadingToast,
            });
        } finally {
            setIsLoading(false);
        }
    };

    const isFormInvalid =
        !formData.name.trim() ||
        /* !formData.unit.trim() || */
        !formData.categoryId ||
        !barcode.trim() ||
        formData.price <= 0 ||
        isLoading;

    return (
        <DashboardLayout>
            <div className="max-w-5xl mx-auto px-4 h-full flex flex-col justify-center">
                <div className="flex justify-between items-end mb-4">
                    <div>
                        <div className="mb-2">
                            <button
                                onClick={() => navigate("/management/products")}
                                className="text-xs px-2 py-1 -ml-2 text-brand-400 hover:text-brand-300 mb-3 flex items-center gap-1 cursor-pointer"
                            >
                                ? Volver
                            </button>
                        </div>
                        <h1 className="text-xl md:text-2xl font-black text-slate-100 flex items-center gap-2">
                            <PackagePlus
                                className="text-indigo-400"
                                size={22}
                            />
                            Nuevo producto
                        </h1>
                    </div>
                    <p className="text-slate-400 text-xs hidden md:block">
                        Complete la información para crear un nuevo producto.
                    </p>
                </div>

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
                            {formData.name || "Nuevo producto"}
                        </h2>
                        <p className="text-indigo-400 text-[9px] font-semibold tracking-widest uppercase mt-0.5">
                            ID: Nuevo
                        </p>
                    </div>
                </div>

                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        const {
                            categoryId,
                            price,
                            name,
                        } = formData;

                        // Validaciones reforzadas
                        if (!name.trim())
                            return toast.error("El nombre es obligatorio");
                        if (!barcode)
                            return toast.error("El codigo de barras es obligatorio")
                        if (!categoryId)
                            return toast.error("Selecciona una Categoría");
                        if (price <= 0)
                            return toast.error("El precio debe ser mayor a 0");

                        setShowConfirmModal(true);
                    }}
                    className="bg-[#0C0A15]/95 border border-white/10 p-5 md:p-6 rounded-[24px] shadow-[0_0_50px_rgba(0,0,0,0.5)] backdrop-blur-3xl ring-1 ring-white/5 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4"
                >
                    {/* COLUMNA IZQUIERDA */}
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
                                autoComplete="off" // Evita sugerencias de nombres de personas
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Ej: Teclado Mecánico"
                                className="w-full bg-[#151320] border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-400/50 outline-none transition-all placeholder:text-slate-600 shadow-inner"
                                required
                            />
                        </div>

                        {/*<div>
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
                                placeholder="Ej: x 24 unidades"
                                className="w-full bg-[#151320] border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-400/50 outline-none transition-all placeholder:text-slate-600 shadow-inner"
                                required
                            />
                        </div> */}

                        <div>
                            <label className="block text-[9px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                                Código de barra <span className="font-bold text-indigo-400">*</span>
                            </label>
                            <input
                                type="text"
                                value={barcode}
                                onChange={(e) => setBarcode(e.target.value)}
                                placeholder="Escanee o ingrese código"
                                className="w-full bg-[#151320] border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-400/50 outline-none transition-all placeholder:text-slate-600 shadow-inner"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-[9px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                                Descripción
                            </label>
                            <textarea
                                name="description"
                                maxLength={500}
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Características..."
                                className="w-full bg-[#151320] border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-400/50 outline-none transition-all placeholder:text-slate-600 shadow-inner resize-none h-20"
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

                    {/* COLUMNA DERECHA */}
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

                            {/* <div className="grid grid-cols-2 gap-3">
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
                                    <label className="block text-[9px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                                        Costo ($)
                                    </label>
                                    <input
                                        type="number"
                                        step="any"
                                        min="0"
                                        value={costPriceInput}
                                        onChange={handleCostPriceChange}
                                        placeholder="0"
                                        className="w-full bg-[#151320] border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-400/50 outline-none transition-all placeholder:text-slate-600 shadow-inner [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                    />
                                </div>
                                <div className="col-span-1">
                                    <label className="block text-[9px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                                        Margen (%)
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            step="any"
                                            value={marginInput}
                                            onChange={handleMarginChange}
                                            placeholder="30"
                                            className="w-full bg-[#151320] border border-white/10 rounded-xl pl-3 pr-7 py-2 text-xs text-indigo-300 font-semibold focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-400/50 outline-none transition-all placeholder:text-slate-600 shadow-inner [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-bold text-slate-500">
                                            %
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-[9px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
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
                                    className="w-full bg-[#151320] border border-white/10 rounded-xl px-3 py-2 text-xs text-emerald-400 font-bold focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-400/50 outline-none transition-all placeholder:text-slate-600 shadow-inner [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3 mt-1">
                                <div className="col-span-1">
                                    <label className="block text-[9px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                                        Stock{" "}
                                        <span className="font-bold text-indigo-400">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        name="stock"
                                        step="1"
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

                                <input
                                    type="checkbox"
                                    id="isOffer"
                                    name="isOffer"
                                    checked={formData.isOffer}
                                    onChange={handleChange}
                                />
                                <label htmlFor="isOffer" className="text-[9px] font-bold uppercase tracking-wider text-slate-300 cursor-pointer">
                                    Oferta
                                </label>
                            </div>
                        </div>

                        {/* Botones de acción */}
                        <div className="flex flex-col items-end w-full">
                            <div
                                className="flex flex-row items-stretch gap-2.5
                            mt-6 w-full border-t border-white/5 pt-5"
                            >
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
                                    className={`flex-1 md:flex-none md:min-w-32 px-5 py-2.5 text-[11px] font-bold border rounded-xl transition-all duration-300 active:scale-95 active:translate-y-0
                                      ${isFormInvalid
                                            ? "bg-slate-800 text-slate-500 cursor-not-allowed opacity-40 border-white/5 pointer-events-none"
                                            : "bg-emerald-600/20 text-emerald-400 border-emerald-500/30 cursor-pointer hover:bg-emerald-500/30 hover:border-emerald-400/50 hover:-translate-y-0.5 shadow-[0_0_20px_rgba(16,185,129,0.15)]"
                                        }`}
                                >
                                    Crear producto
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
                    title="Crear producto"
                    variant="success"
                    message={
                        <>
                            ¿Seguro que querés crear el producto{" "}
                            <b>{formData.name}</b>?
                        </>
                    }
                    isLoading={isLoading}
                    onCancel={() => setShowConfirmModal(false)}
                    onConfirm={handleSubmit}
                    confirmText="Crear"
                    cancelText="Cancelar"
                />
            </div>
        </DashboardLayout>
    );
}

