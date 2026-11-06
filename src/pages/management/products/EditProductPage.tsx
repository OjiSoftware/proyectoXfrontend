import React, { useState } from "react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { useNavigate } from "react-router-dom";
import { ConfirmModal } from "../../../components/ConfirmModal";
import { productApi } from "@/services/ProductService";
import toast from "react-hot-toast";
import { useProductEdit } from "@/hooks/useProductEdit";
import { SquarePen, Image as ImageIcon, ArrowLeft, Tag, Layers, Sliders, DollarSign, PackageCheck, Eye } from "lucide-react";
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
        isLoading,
    } = useProductEdit();

    const navigate = useNavigate();
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    // Mock states for non-functional fields
    const [barcode, setBarcode] = useState("");
    const [supplier, setSupplier] = useState(""); // Campo proveedor (sin uso activo en backend aún)
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

    if (!id)
        return (
            <DashboardLayout>
                <div className="flex flex-col items-center justify-center h-full text-white">
                    <h1 className="text-2xl font-bold">
                        Producto no encontrado
                    </h1>
                    <button
                        onClick={() => navigate("/management/products")}
                        className="mt-4 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition cursor-pointer"
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

        const isNumeric = ["categoryId", "stock"].includes(name);
        const finalValue = isNumeric ? parseInt(value) || 0 : value;

        setFormData((prev) => ({
            ...prev,
            [name]: finalValue,
        }));
    };

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

    const handleMarginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setMarginInput(val);

        if (val.trim() === "") return;

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
        !formData.categoryId ||
        formData.price <= 0 ||
        isLoading;

    return (
        <DashboardLayout>
            <div className="max-w-6xl mx-auto px-4 py-2">
                {/* Cabecera y botón volver */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                    <div>
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-300 hover:text-white transition-colors mb-2 cursor-pointer"
                        >
                            <ArrowLeft size={16} /> Volver a productos
                        </button>
                        <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
                            <span className="p-2 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400">
                                <SquarePen size={22} />
                            </span>
                            Editar producto
                        </h1>
                    </div>
                    <p className="text-sm text-slate-400">
                        Modifique los datos y configure la presencia del producto en la tienda.
                    </p>
                </div>

                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        if (!formData.name.trim()) return toast.error("El nombre es obligatorio");
                        if (!formData.categoryId) return toast.error("Seleccione una Categoría");
                        if (formData.price <= 0) return toast.error("El precio debe ser mayor a 0");

                        setShowConfirmModal(true);
                    }}
                    className="space-y-6"
                >
                    {/* SECCIÓN 1: INFORMACIÓN BÁSICA & PROVEEDOR */}
                    <div className="bg-[#0C0A15] border border-white/10 rounded-2xl p-6 shadow-xl space-y-5">
                        <div className="flex items-center gap-2.5 border-b border-white/5 pb-3">
                            <Tag className="w-5 h-5 text-indigo-400" />
                            <h2 className="text-base font-bold text-slate-100 uppercase tracking-wider text-xs">
                                1. Información Básica del Producto
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            {/* Nombre */}
                            <div className="md:col-span-2">
                                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                                    Nombre del producto <span className="text-indigo-400">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    autoComplete="off"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Ej: Teclado Mecánico RGB"
                                    className="w-full bg-[#151320] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 outline-none transition-all"
                                    required
                                />
                            </div>

                            {/* Código de barra */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                                    Código de barra <span className="text-indigo-400">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={barcode}
                                    onChange={(e) => setBarcode(e.target.value)}
                                    placeholder="Escanee o ingrese código"
                                    className="w-full bg-[#151320] border border-white/10 rounded-xl px-4 py-2.5 text-sm font-mono text-slate-100 placeholder:text-slate-500 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 outline-none transition-all"
                                />
                            </div>

                            {/* Categoría */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                                    Categoría <span className="text-indigo-400">*</span>
                                </label>
                                <select
                                    name="categoryId"
                                    value={formData.categoryId || ""}
                                    onChange={handleChange}
                                    className="w-full bg-[#151320] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 outline-none transition-all cursor-pointer"
                                    required
                                >
                                    <option value="" disabled className="text-slate-500">
                                        Seleccionar categoría...
                                    </option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.id} className="bg-[#151320] text-slate-100">
                                            {cat.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Proveedor (campo opcional reservado) */}
                            <div className="md:col-span-2">
                                <div className="flex items-center justify-between mb-2">
                                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                                        Proveedor
                                    </label>
                                    <span className="text-[11px] font-medium text-slate-400 bg-white/5 px-2 py-0.5 rounded-md">
                                        Opcional / Próximamente
                                    </span>
                                </div>
                                <input
                                    type="text"
                                    value={supplier}
                                    onChange={(e) => setSupplier(e.target.value)}
                                    placeholder="Nombre o razón social del proveedor"
                                    className="w-full bg-[#151320] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 outline-none transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    {/* SECCIÓN 2: PRECIOS & STOCK */}
                    <div className="bg-[#0C0A15] border border-white/10 rounded-2xl p-6 shadow-xl space-y-5">
                        <div className="flex items-center gap-2.5 border-b border-white/5 pb-3">
                            <DollarSign className="w-5 h-5 text-emerald-400" />
                            <h2 className="text-base font-bold text-slate-100 uppercase tracking-wider text-xs">
                                2. Precios y Existencias
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                            {/* Costo */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                                    Costo ($)
                                </label>
                                <input
                                    type="number"
                                    step="any"
                                    min="0"
                                    value={costPriceInput}
                                    onChange={handleCostPriceChange}
                                    placeholder="0.00"
                                    className="w-full bg-[#151320] border border-white/10 rounded-xl px-4 py-2.5 text-sm font-mono text-slate-100 placeholder:text-slate-500 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 outline-none transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                />
                            </div>

                            {/* Margen */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                                    Margen (%)
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        step="any"
                                        value={marginInput}
                                        onChange={handleMarginChange}
                                        placeholder="30"
                                        className="w-full bg-[#151320] border border-white/10 rounded-xl pl-4 pr-8 py-2.5 text-sm font-semibold text-indigo-300 placeholder:text-slate-500 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 outline-none transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                                        %
                                    </span>
                                </div>
                            </div>

                            {/* Precio de venta */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                                    Venta ($) <span className="text-emerald-400">*</span>
                                </label>
                                <input
                                    type="number"
                                    step="any"
                                    min="0"
                                    name="price"
                                    autoComplete="off"
                                    value={priceInput}
                                    onChange={handlePriceChange}
                                    placeholder="0.00"
                                    className="w-full bg-[#151320] border border-emerald-500/30 rounded-xl px-4 py-2.5 text-sm font-mono font-bold text-emerald-400 placeholder:text-slate-500 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 outline-none transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                    required
                                />
                            </div>

                            {/* Stock actual */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                                    Stock actual <span className="text-indigo-400">*</span>
                                </label>
                                <input
                                    type="number"
                                    name="stock"
                                    step="1"
                                    value={formData.stock}
                                    onChange={handleChange}
                                    placeholder="0"
                                    className="w-full bg-[#151320] border border-white/10 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-100 placeholder:text-slate-500 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 outline-none transition-all"
                                    required
                                />
                            </div>

                            {/* Stock mínimo */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                                    Stock mínimo
                                </label>
                                <input
                                    type="number"
                                    value={minStock}
                                    onChange={(e) => setMinStock(e.target.value)}
                                    placeholder="0"
                                    className="w-full bg-[#151320] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 outline-none transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    {/* SECCIÓN 3: DESCRIPCIÓN & MULTIMEDIA */}
                    <div className="bg-[#0C0A15] border border-white/10 rounded-2xl p-6 shadow-xl space-y-5">
                        <div className="flex items-center gap-2.5 border-b border-white/5 pb-3">
                            <Layers className="w-5 h-5 text-indigo-400" />
                            <h2 className="text-base font-bold text-slate-100 uppercase tracking-wider text-xs">
                                3. Descripción y Multimedia
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Descripción completa */}
                            <div className="lg:col-span-2">
                                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                                    Descripción detallada del producto
                                </label>
                                <textarea
                                    name="description"
                                    maxLength={500}
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder="Ingrese especificaciones técnicas, modo de uso o detalles clave..."
                                    rows={5}
                                    className="w-full bg-[#151320] border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 outline-none transition-all resize-y"
                                />
                                <div className="text-right text-xs text-slate-400 mt-1">
                                    {(formData.description || "").length} / 500 caracteres
                                </div>
                            </div>

                            {/* URL de imagen con preview integrado */}
                            <div className="space-y-3">
                                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                                    Imagen del producto
                                </label>
                                <input
                                    type="url"
                                    name="imageUrl"
                                    autoComplete="off"
                                    value={formData.imageUrl}
                                    onChange={handleChange}
                                    placeholder="https://..."
                                    className="w-full bg-[#151320] border border-white/10 rounded-xl px-4 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 outline-none transition-all"
                                />

                                {/* Preview container */}
                                <div className="w-full h-36 rounded-xl border border-dashed border-white/15 bg-[#151320]/60 flex flex-col items-center justify-center overflow-hidden p-2">
                                    {formData.imageUrl ? (
                                        <img
                                            src={getDriveDirectLink(formData.imageUrl)}
                                            alt={formData.name || "Preview"}
                                            className="w-full h-full object-contain"
                                            onError={(e) => {
                                                (e.target as HTMLElement).style.display = 'none';
                                            }}
                                        />
                                    ) : (
                                        <div className="flex flex-col items-center justify-center text-slate-500 gap-1.5">
                                            <ImageIcon size={28} />
                                            <span className="text-xs">Sin imagen cargada</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SECCIÓN 4: ESTADOS & VISIBILIDAD (CHECKS) */}
                    <div className="bg-[#0C0A15] border border-white/10 rounded-2xl p-6 shadow-xl space-y-4">
                        <div className="flex items-center gap-2.5 border-b border-white/5 pb-3">
                            <Sliders className="w-5 h-5 text-indigo-400" />
                            <h2 className="text-base font-bold text-slate-100 uppercase tracking-wider text-xs">
                                4. Opciones de Publicación
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Checkbox Mostrar en catálogo */}
                            <label className="flex items-start gap-3 p-4 rounded-xl border border-white/10 bg-[#151320] hover:border-indigo-500/40 cursor-pointer transition-all">
                                <input
                                    type="checkbox"
                                    id="showInCatalog"
                                    name="showingInCatalog"
                                    checked={formData.showingInCatalog || false}
                                    onChange={handleChange}
                                    className="w-5 h-5 mt-0.5 rounded border border-white/20 text-indigo-500 focus:ring-indigo-500 bg-[#0C0A15] cursor-pointer"
                                />
                                <div>
                                    <span className="block text-sm font-semibold text-slate-100 flex items-center gap-1.5">
                                        <Eye size={16} className="text-indigo-400" /> Mostrar en catálogo público
                                    </span>
                                    <span className="text-xs text-slate-400">
                                        El producto será visible para los clientes en la tienda.
                                    </span>
                                </div>
                            </label>

                            {/* Checkbox En oferta */}
                            <label className="flex items-start gap-3 p-4 rounded-xl border border-white/10 bg-[#151320] hover:border-amber-500/40 cursor-pointer transition-all">
                                <input
                                    type="checkbox"
                                    id="isOffer"
                                    name="isOffer"
                                    checked={formData.isOffer ?? false}
                                    onChange={handleChange}
                                    className="w-5 h-5 mt-0.5 rounded border border-white/20 text-amber-500 focus:ring-amber-500 bg-[#0C0A15] cursor-pointer"
                                />
                                <div>
                                    <span className="block text-sm font-semibold text-slate-100 flex items-center gap-1.5">
                                        <PackageCheck size={16} className="text-amber-400" /> Destacar como Oferta
                                    </span>
                                    <span className="text-xs text-slate-400">
                                        Muestra un badge especial de oferta en el escaparate.
                                    </span>
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* BARRA INFERIOR DE ACCIONES */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-white/10">
                        <div>
                            {isFormInvalid && !isLoading && (
                                <p className="text-xs text-rose-400 font-medium">
                                    * Complete todos los campos obligatorios marcados con asterisco para continuar.
                                </p>
                            )}
                        </div>

                        <div className="flex items-center gap-3 w-full sm:w-auto">
                            <button
                                type="button"
                                onClick={() => navigate("/management/products")}
                                className="flex-1 sm:flex-none px-6 py-2.5 text-sm font-semibold rounded-xl border border-white/10 text-slate-300 bg-transparent hover:bg-white/5 hover:text-white transition-all cursor-pointer"
                            >
                                Cancelar
                            </button>

                            <button
                                type="submit"
                                disabled={isFormInvalid}
                                className={`flex-1 sm:flex-none px-6 py-2.5 text-sm font-semibold rounded-xl border transition-all ${
                                    isFormInvalid
                                        ? "bg-slate-800 text-slate-500 border-white/5 cursor-not-allowed opacity-50"
                                        : "bg-emerald-600/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30 hover:border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.2)] cursor-pointer"
                                }`}
                            >
                                Guardar cambios
                            </button>
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
