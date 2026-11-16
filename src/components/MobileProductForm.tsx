import React, { useState } from "react";
import {
    PackagePlus,
    SquarePen,
    Camera,
    Barcode,
    ScanLine,
    Image as ImageIcon,
    Check,
    X,
    DollarSign,
    Layers,
    Eye,
    Plus,
    Minus,
    Sparkles,
    Trash2,
    RefreshCw,
    ShoppingBag,
    CheckCircle2,
    AlertCircle,
    Info,
    Tag,
} from "lucide-react";
import toast from "react-hot-toast";
import { Category } from "@/types/category.types";
import { Provider } from "@/types/provider.types";
import { getDriveDirectLink } from "@/helpers/url.helper";

type ActiveTab = "basic" | "pricing" | "stock" | "preview";

interface MobileProductFormProps {
    mode: "create" | "edit";
    productId?: string | number;
    formData: {
        name: string;
        categoryId: number;
        providerId?: number | null;
        stock: number;
        price: number;
        description: string;
        showingInCatalog: boolean;
        isOffer?: boolean;
        imageUrl: string;
    };
    setFormData: React.Dispatch<React.SetStateAction<any>>;
    categories: Category[];
    providers: Provider[];
    handleChange: (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => void;
    barcode: string;
    setBarcode: React.Dispatch<React.SetStateAction<string>>;
    costPriceInput: string;
    costPrice: number;
    handleCostPriceChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    marginInput: string;
    handleMarginChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    priceInput: string;
    handlePriceChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    minStock: string;
    setMinStock: React.Dispatch<React.SetStateAction<string>>;
    isFormInvalid: boolean;
    isLoading: boolean;
    onCancel: () => void;
    onSubmitRequest: () => void;
}

export const MobileProductForm: React.FC<MobileProductFormProps> = ({
    mode,
    productId,
    formData,
    setFormData,
    categories,
    providers,
    handleChange,
    barcode,
    setBarcode,
    costPriceInput,
    costPrice,
    handleCostPriceChange,
    marginInput,
    handleMarginChange,
    priceInput,
    handlePriceChange,
    minStock,
    setMinStock,
    isFormInvalid,
    isLoading,
    onCancel,
    onSubmitRequest,
}) => {
    const [activeTab, setActiveTab] = useState<ActiveTab>("basic");
    const [isScannerOpen, setIsScannerOpen] = useState(false);
    const [isPhotoPickerOpen, setIsPhotoPickerOpen] = useState(false);

    function generateRandomBarcode() {
        return "779" + Math.floor(1000000000 + Math.random() * 9000000000).toString();
    }

    const handleMarginChipClick = (marginVal: number) => {
        if (costPrice <= 0) {
            toast("Ingresá un costo mayor a $0 para calcular con margen", { icon: "💡" });
        }
        const syntheticEvent = {
            target: { value: marginVal.toString() },
        } as React.ChangeEvent<HTMLInputElement>;
        handleMarginChange(syntheticEvent);
    };

    const adjustStock = (delta: number) => {
        setFormData((prev: any) => ({
            ...prev,
            stock: Math.max(0, Math.floor((Number(prev.stock) || 0) + delta)),
        }));
    };

    const handleActionClick = () => {
        if (!formData.name.trim()) {
            setActiveTab("basic");
            toast.error("El nombre es obligatorio");
            return;
        }
        if (!barcode.trim()) {
            setActiveTab("basic");
            toast.error("El código de barras es obligatorio");
            return;
        }
        if (!formData.categoryId) {
            setActiveTab("basic");
            toast.error("Selecciona una Categoría");
            return;
        }
        if (formData.price <= 0) {
            setActiveTab("pricing");
            toast.error("El precio debe ser mayor a 0");
            return;
        }
        onSubmitRequest();
    };

    const profit = Math.max(0, (Number(formData.price) || 0) - costPrice);
    const profitMargin =
        costPrice > 0 && formData.price > 0
            ? (((formData.price - costPrice) / costPrice) * 100).toFixed(1)
            : marginInput || "0";

    const selectedCategoryName =
        categories.find((c) => c.id === Number(formData.categoryId))?.name || "Sin categoría";

    const minStockNum = parseInt(minStock) || 0;
    const currentStockNum = Number(formData.stock) || 0;

    return (
        <div className="w-full flex flex-col bg-[#0C0A15]/95 border border-white/10 rounded-[24px] overflow-hidden shadow-[0_15px_40px_rgba(0,0,0,0.6)] relative">
            {/* CABECERA MÓVIL DEL FORMULARIO */}
            <div className="px-4 pt-3 pb-3 bg-[#110e1f] border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                    <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 font-bold text-xs ${
                            mode === "create"
                                ? "bg-indigo-600/30 text-indigo-400 border border-indigo-500/30"
                                : "bg-purple-600/30 text-purple-400 border border-purple-500/30"
                        }`}
                    >
                        {mode === "create" ? <PackagePlus size={18} /> : <SquarePen size={18} />}
                    </div>
                    <div className="min-w-0">
                        <h2 className="text-sm font-bold text-white leading-tight truncate">
                            {formData.name || (mode === "create" ? "Nuevo producto" : "Editar producto")}
                        </h2>
                        <p className="text-[10px] text-indigo-400 font-semibold uppercase tracking-wider mt-0.5">
                            {mode === "create" ? "ID: Nuevo" : `ID: #${productId}`}
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={onCancel}
                    className="px-2.5 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-semibold text-indigo-300 flex items-center gap-1 transition active:scale-95 shrink-0"
                >
                    ← Volver
                </button>
            </div>

            {/* TABS NAVEGACIÓN MÓVIL */}
            <div className="px-2 py-2 bg-[#0e0b1c] border-b border-white/5 flex items-center gap-1 overflow-x-auto no-scrollbar">
                <button
                    type="button"
                    onClick={() => setActiveTab("basic")}
                    className={`flex-1 py-2 px-2 rounded-xl text-[11px] font-bold transition flex items-center justify-center gap-1.5 whitespace-nowrap ${
                        activeTab === "basic"
                            ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                            : "text-slate-400 hover:text-white hover:bg-white/5"
                    }`}
                >
                    <Tag size={13} />
                    General
                </button>
                <button
                    type="button"
                    onClick={() => setActiveTab("pricing")}
                    className={`flex-1 py-2 px-2 rounded-xl text-[11px] font-bold transition flex items-center justify-center gap-1.5 whitespace-nowrap ${
                        activeTab === "pricing"
                            ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                            : "text-slate-400 hover:text-white hover:bg-white/5"
                    }`}
                >
                    <DollarSign size={13} />
                    Precios
                </button>
                <button
                    type="button"
                    onClick={() => setActiveTab("stock")}
                    className={`flex-1 py-2 px-2 rounded-xl text-[11px] font-bold transition flex items-center justify-center gap-1.5 whitespace-nowrap ${
                        activeTab === "stock"
                            ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                            : "text-slate-400 hover:text-white hover:bg-white/5"
                    }`}
                >
                    <Layers size={13} />
                    Stock
                </button>
                <button
                    type="button"
                    onClick={() => setActiveTab("preview")}
                    className={`flex-1 py-2 px-2 rounded-xl text-[11px] font-bold transition flex items-center justify-center gap-1.5 whitespace-nowrap ${
                        activeTab === "preview"
                            ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                            : "text-slate-400 hover:text-white hover:bg-white/5"
                    }`}
                >
                    <Eye size={13} />
                    Vista
                </button>
            </div>

            {/* CUERPO DEL FORMULARIO MÓVIL */}
            <div className="p-4 space-y-4">
                {/* 1. TAB: GENERAL */}
                {activeTab === "basic" && (
                    <div className="space-y-4 animate-in fade-in duration-150">
                        {/* CARD DE FOTO PRINCIPAL */}
                        <div className="bg-[#141124] border border-white/10 rounded-2xl p-3 flex items-center gap-3">
                            <div
                                onClick={() => setIsPhotoPickerOpen(true)}
                                className="relative w-16 h-16 rounded-xl bg-[#151320] overflow-hidden shrink-0 border border-white/10 flex items-center justify-center cursor-pointer"
                            >
                                {formData.imageUrl ? (
                                    <img
                                        src={getDriveDirectLink(formData.imageUrl)}
                                        alt={formData.name || "Producto"}
                                        className="w-full h-full object-contain"
                                    />
                                ) : (
                                    <ImageIcon size={24} className="text-slate-500" />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">
                                    Imagen del Producto
                                </span>
                                <p className="text-xs text-slate-300 mt-0.5 truncate">
                                    {formData.imageUrl ? "URL de imagen asignada" : "Sin imagen asignada"}
                                </p>
                                <div className="flex items-center gap-2 mt-2">
                                    <button
                                        type="button"
                                        onClick={() => setIsPhotoPickerOpen(true)}
                                        className="px-2.5 py-1.5 bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/30 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition active:scale-95"
                                    >
                                        <Camera size={13} />
                                        {formData.imageUrl ? "Cambiar URL" : "Cargar URL de Imagen"}
                                    </button>
                                    {formData.imageUrl && (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setFormData((prev: any) => ({ ...prev, imageUrl: "" }))
                                            }
                                            className="p-1.5 text-slate-400 hover:text-red-400 transition"
                                            title="Quitar imagen"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* NOMBRE DEL PRODUCTO */}
                        <div>
                            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                                Nombre del Producto <span className="text-indigo-400">*</span>
                            </label>
                            <input
                                type="text"
                                name="name"
                                autoComplete="off"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Ej: Teclado Mecánico"
                                className="w-full bg-[#151226] border border-white/10 rounded-xl px-3.5 py-3 text-sm text-white placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500 outline-none shadow-inner transition"
                            />
                        </div>

                        {/* CÓDIGO DE BARRAS CON ESCÁNER */}
                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
                                    Código de Barras <span className="text-indigo-400">*</span>
                                </label>
                                <button
                                    type="button"
                                    onClick={() => setBarcode(generateRandomBarcode())}
                                    className="text-[10px] text-indigo-400 hover:text-indigo-300 font-semibold"
                                >
                                    + Auto-generar
                                </button>
                            </div>
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <input
                                        type="text"
                                        value={barcode}
                                        onChange={(e) => setBarcode(e.target.value)}
                                        placeholder="Escanee o ingrese código"
                                        className="w-full bg-[#151226] border border-white/10 rounded-xl pl-3.5 pr-8 py-3 text-sm font-mono text-white placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500 outline-none shadow-inner"
                                    />
                                    <Barcode
                                        size={16}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setIsScannerOpen(true)}
                                    className="px-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold shadow-md shadow-indigo-600/30 transition active:scale-95 shrink-0"
                                >
                                    <ScanLine size={16} />
                                    <span>Escanear</span>
                                </button>
                            </div>
                        </div>

                        {/* CATEGORÍA - CHIPS TÁCTILES + SELECTOR */}
                        <div>
                            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-2">
                                Categoría <span className="text-indigo-400">*</span>
                            </label>
                            {categories.length > 0 && categories.length <= 8 ? (
                                <div className="flex flex-wrap gap-1.5">
                                    {categories.map((cat) => {
                                        const isSelected = Number(formData.categoryId) === cat.id;
                                        return (
                                            <button
                                                key={cat.id}
                                                type="button"
                                                onClick={() =>
                                                    setFormData((prev: any) => ({
                                                        ...prev,
                                                        categoryId: cat.id,
                                                    }))
                                                }
                                                className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition active:scale-95 ${
                                                    isSelected
                                                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                                                        : "bg-[#161328] text-slate-300 border border-white/5 hover:border-white/20"
                                                }`}
                                            >
                                                <span>{cat.name}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            ) : (
                                <select
                                    name="categoryId"
                                    value={formData.categoryId || ""}
                                    onChange={handleChange}
                                    className="w-full bg-[#151226] border border-white/10 rounded-xl px-3.5 py-3 text-xs text-white focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
                                >
                                    <option value="" disabled className="text-slate-500">
                                        Seleccionar categoría...
                                    </option>
                                    {categories.map((cat) => (
                                        <option
                                            key={cat.id}
                                            value={cat.id}
                                            className="bg-[#151320] text-slate-100"
                                        >
                                            {cat.name}
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>

                        {/* PROVEEDOR */}
                        <div>
                            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                                Proveedor
                            </label>
                            <select
                                name="providerId"
                                value={formData.providerId || ""}
                                onChange={handleChange}
                                className="w-full bg-[#151226] border border-white/10 rounded-xl px-3.5 py-3 text-xs text-white focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
                            >
                                <option value="" className="text-slate-500">
                                    Sin proveedor
                                </option>
                                {providers.map((prov) => (
                                    <option
                                        key={prov.id}
                                        value={prov.id}
                                        className="bg-[#151320] text-slate-100"
                                    >
                                        {prov.businessName || prov.name || `Proveedor #${prov.id}`}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* DESCRIPCIÓN */}
                        <div>
                            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                                Descripción
                            </label>
                            <textarea
                                name="description"
                                rows={3}
                                maxLength={500}
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Características del producto..."
                                className="w-full bg-[#151226] border border-white/10 rounded-xl p-3 text-xs text-white placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                            />
                        </div>
                    </div>
                )}

                {/* 2. TAB: PRECIOS Y MARGEN */}
                {activeTab === "pricing" && (
                    <div className="space-y-4 animate-in fade-in duration-150">
                        {/* CARD RESUMEN FINANCIERO */}
                        <div className="bg-linear-to-br from-indigo-950/60 to-purple-950/40 border border-indigo-500/20 rounded-2xl p-4">
                            <div className="flex items-center justify-between">
                                <span className="text-[11px] font-bold uppercase text-indigo-300">
                                    Ganancia Neta Estimada
                                </span>
                                <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                                    +{profitMargin}%
                                </span>
                            </div>
                            <div className="text-2xl font-black text-emerald-400 mt-1 font-mono">
                                ${profit.toLocaleString("es-AR")}
                            </div>
                            <p className="text-[10px] text-slate-400 mt-1">
                                Costo (${costPrice.toLocaleString("es-AR")}) vs Venta ($
                                {(Number(formData.price) || 0).toLocaleString("es-AR")})
                            </p>
                        </div>

                        {/* COSTO ($) */}
                        <div>
                            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                                Costo ($)
                            </label>
                            <div className="relative">
                                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                                    $
                                </span>
                                <input
                                    type="number"
                                    step="any"
                                    min="0"
                                    value={costPriceInput}
                                    onChange={handleCostPriceChange}
                                    placeholder="0"
                                    className="w-full bg-[#151226] border border-white/10 rounded-xl pl-8 pr-3.5 py-3 text-sm font-mono text-white focus:ring-2 focus:ring-indigo-500 outline-none shadow-inner [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                />
                            </div>
                        </div>

                        {/* MARGEN (%) + CHIPS TÁCTILES */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
                                    Margen (%)
                                </label>
                                <span className="text-xs font-bold text-indigo-400 font-mono">
                                    {marginInput ? `${marginInput}%` : "0%"}
                                </span>
                            </div>
                            <div className="grid grid-cols-4 gap-2 mb-2.5">
                                {[15, 30, 50, 100].map((m) => (
                                    <button
                                        key={m}
                                        type="button"
                                        onClick={() => handleMarginChipClick(m)}
                                        className={`py-2 rounded-xl text-xs font-bold transition active:scale-95 ${
                                            Number(marginInput) === m
                                                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                                                : "bg-[#161328] text-indigo-300 border border-white/5 hover:border-white/20"
                                        }`}
                                    >
                                        +{m}%
                                    </button>
                                ))}
                            </div>
                            <div className="relative">
                                <input
                                    type="number"
                                    step="any"
                                    value={marginInput}
                                    onChange={handleMarginChange}
                                    placeholder="Ej: 30"
                                    className="w-full bg-[#151226] border border-white/10 rounded-xl pl-3.5 pr-8 py-2.5 text-sm font-semibold text-indigo-300 focus:ring-2 focus:ring-indigo-500 outline-none shadow-inner [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                />
                                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                                    %
                                </span>
                            </div>
                        </div>

                        {/* VENTA ($) */}
                        <div>
                            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                                Precio de Venta ($) <span className="text-indigo-400">*</span>
                            </label>
                            <div className="relative">
                                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-400 font-bold">
                                    $
                                </span>
                                <input
                                    type="number"
                                    step="any"
                                    min="0"
                                    name="price"
                                    autoComplete="off"
                                    value={priceInput}
                                    onChange={handlePriceChange}
                                    placeholder="0"
                                    className="w-full bg-[#151226] border border-emerald-500/40 rounded-xl pl-8 pr-3.5 py-3.5 text-base font-bold font-mono text-emerald-400 focus:ring-2 focus:ring-emerald-500 outline-none shadow-[0_0_15px_rgba(16,185,129,0.1)] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                />
                            </div>
                        </div>

                        <div className="p-3 bg-white/[0.03] rounded-xl border border-white/5 flex items-start gap-2.5">
                            <Info size={16} className="text-indigo-400 shrink-0 mt-0.5" />
                            <p className="text-[11px] text-slate-300 leading-relaxed">
                                Podés ajustar tanto el margen como el precio de venta; el sistema recalcula automáticamente de forma bidireccional.
                            </p>
                        </div>
                    </div>
                )}

                {/* 3. TAB: STOCK E INVENTARIO */}
                {activeTab === "stock" && (
                    <div className="space-y-4 animate-in fade-in duration-150">
                        {/* STEPPER TÁCTIL DE STOCK */}
                        <div className="bg-[#141124] border border-white/10 rounded-2xl p-4">
                            <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-2">
                                Stock Actual <span className="text-indigo-400">*</span>
                            </span>

                            <div className="flex items-center justify-between gap-2">
                                <button
                                    type="button"
                                    onClick={() => adjustStock(-10)}
                                    className="w-11 h-11 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center active:scale-90 transition"
                                >
                                    -10
                                </button>
                                <button
                                    type="button"
                                    onClick={() => adjustStock(-1)}
                                    className="w-11 h-11 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/30 flex items-center justify-center active:scale-90 transition"
                                >
                                    <Minus size={18} />
                                </button>

                                <div className="flex-1 text-center">
                                    <input
                                        type="number"
                                        name="stock"
                                        step="1"
                                        value={formData.stock}
                                        onChange={handleChange}
                                        className="w-full text-center bg-transparent text-2xl font-black font-mono text-white outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                    />
                                    <span className="text-[10px] text-slate-400 uppercase font-semibold">
                                        unidades
                                    </span>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => adjustStock(1)}
                                    className="w-11 h-11 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/30 flex items-center justify-center active:scale-90 transition"
                                >
                                    <Plus size={18} />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => adjustStock(10)}
                                    className="w-11 h-11 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center active:scale-90 transition"
                                >
                                    +10
                                </button>
                            </div>
                        </div>

                        {/* STOCK MÍNIMO */}
                        <div>
                            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                                Stock Mínimo
                            </label>
                            <input
                                type="number"
                                value={minStock}
                                onChange={(e) => setMinStock(e.target.value)}
                                placeholder="0"
                                className="w-full bg-[#151226] border border-white/10 rounded-xl px-3.5 py-3 text-sm font-mono text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                            <div className="mt-1.5 flex items-center gap-1.5">
                                {currentStockNum <= minStockNum && minStockNum > 0 ? (
                                    <span className="text-[11px] text-amber-400 font-semibold flex items-center gap-1">
                                        <AlertCircle size={12} />
                                        Alerta: Stock actual en nivel mínimo o bajo
                                    </span>
                                ) : (
                                    <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                                        <CheckCircle2 size={12} />
                                        Nivel de stock saludable
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* SWITCHES TÁCTILES */}
                        <div className="space-y-3 pt-1">
                            <div
                                onClick={() =>
                                    setFormData((prev: any) => ({
                                        ...prev,
                                        showingInCatalog: !prev.showingInCatalog,
                                    }))
                                }
                                className="p-3.5 bg-[#141124] border border-white/10 rounded-2xl flex items-center justify-between cursor-pointer select-none active:scale-[0.99] transition"
                            >
                                <div>
                                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                                        <ShoppingBag size={14} className="text-indigo-400" />
                                        Mostrar en catálogo
                                    </div>
                                    <div className="text-[10px] text-slate-400 mt-0.5">
                                        Visible para clientes en la tienda pública
                                    </div>
                                </div>
                                <div
                                    className={`w-11 h-6 rounded-full transition p-1 flex items-center ${
                                        formData.showingInCatalog
                                            ? "bg-indigo-600 justify-end"
                                            : "bg-slate-700 justify-start"
                                    }`}
                                >
                                    <div className="w-4 h-4 rounded-full bg-white shadow-md"></div>
                                </div>
                            </div>

                            <div
                                onClick={() =>
                                    setFormData((prev: any) => ({
                                        ...prev,
                                        isOffer: !prev.isOffer,
                                    }))
                                }
                                className="p-3.5 bg-[#141124] border border-white/10 rounded-2xl flex items-center justify-between cursor-pointer select-none active:scale-[0.99] transition"
                            >
                                <div>
                                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                                        <Sparkles size={14} className="text-amber-400" />
                                        Oferta
                                    </div>
                                    <div className="text-[10px] text-slate-400 mt-0.5">
                                        Destacar producto como oferta especial
                                    </div>
                                </div>
                                <div
                                    className={`w-11 h-6 rounded-full transition p-1 flex items-center ${
                                        formData.isOffer
                                            ? "bg-amber-500 justify-end"
                                            : "bg-slate-700 justify-start"
                                    }`}
                                >
                                    <div className="w-4 h-4 rounded-full bg-white shadow-md"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 4. TAB: VISTA PREVIA */}
                {activeTab === "preview" && (
                    <div className="space-y-3 animate-in fade-in duration-150">
                        <div className="text-center">
                            <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider">
                                Vista Previa en Tienda Mobile
                            </span>
                        </div>

                        <div className="bg-[#151226] border border-white/10 rounded-3xl overflow-hidden shadow-xl">
                            <div className="relative aspect-square w-full max-h-56 bg-[#151320] overflow-hidden flex items-center justify-center p-4">
                                {formData.imageUrl ? (
                                    <img
                                        src={getDriveDirectLink(formData.imageUrl)}
                                        alt={formData.name}
                                        className="w-full h-full object-contain"
                                    />
                                ) : (
                                    <ImageIcon size={48} className="text-slate-600" />
                                )}
                                {formData.isOffer && (
                                    <div className="absolute top-3 left-3 bg-red-600 text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-full shadow-lg">
                                        ¡OFERTA!
                                    </div>
                                )}
                                <div className="absolute top-3 right-3 bg-black/60 backdrop-blur text-slate-200 text-[10px] font-semibold px-2.5 py-1 rounded-lg border border-white/10">
                                    {selectedCategoryName}
                                </div>
                            </div>

                            <div className="p-4 space-y-2">
                                <h3 className="text-base font-bold text-white leading-snug">
                                    {formData.name || "Nombre del Producto"}
                                </h3>
                                <p className="text-xs text-slate-400 line-clamp-2">
                                    {formData.description || "Sin descripción proporcionada."}
                                </p>

                                <div className="pt-2 flex items-baseline justify-between border-t border-white/5">
                                    <div>
                                        <span className="text-[10px] text-slate-400 block">Precio Venta</span>
                                        <span className="text-xl font-black text-emerald-400 font-mono">
                                            ${(Number(formData.price) || 0).toLocaleString("es-AR")}
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-[10px] text-slate-400 block">Disponibilidad</span>
                                        <span
                                            className={`text-xs font-bold ${
                                                currentStockNum > 0 ? "text-indigo-400" : "text-red-400"
                                            }`}
                                        >
                                            {currentStockNum > 0
                                                ? `${currentStockNum} en stock`
                                                : "Sin stock"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* BARRA INFERIOR DE ACCIÓN MÓVIL */}
            <div className="p-3.5 bg-[#0e0b1c]/95 border-t border-white/10 space-y-2">
                <div className="flex items-center gap-2.5">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-4 py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold active:scale-95 transition"
                    >
                        Cancelar
                    </button>

                    <button
                        type="button"
                        onClick={handleActionClick}
                        disabled={isLoading}
                        className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition active:scale-95 ${
                            isFormInvalid
                                ? "bg-slate-800/80 text-slate-400 border border-white/5"
                                : "bg-emerald-600/25 text-emerald-300 border border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                        }`}
                    >
                        {isLoading ? (
                            <RefreshCw size={16} className="animate-spin" />
                        ) : mode === "create" ? (
                            <>
                                <PackagePlus size={16} />
                                <span>Crear producto</span>
                            </>
                        ) : (
                            <>
                                <Check size={16} />
                                <span>Guardar cambios</span>
                            </>
                        )}
                    </button>
                </div>

                {isFormInvalid && !isLoading && (
                    <p className="text-amber-400/80 text-[11px] text-center font-medium">
                        * Complete Nombre, Código, Categoría y Precio para guardar
                    </p>
                )}
            </div>

            {/* MODAL: ESCÁNER DE CÓDIGO DE BARRAS */}
            {isScannerOpen && (
                <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col justify-between p-5 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between text-white pt-2">
                        <div className="flex items-center gap-2">
                            <ScanLine className="text-indigo-400 animate-pulse" size={20} />
                            <span className="font-semibold text-sm">Escáner de Código de Barras</span>
                        </div>
                        <button
                            type="button"
                            onClick={() => setIsScannerOpen(false)}
                            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition active:scale-95"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    <div className="my-auto flex flex-col items-center">
                        <div className="relative w-64 h-48 border-2 border-indigo-400/80 rounded-2xl overflow-hidden flex items-center justify-center bg-indigo-950/20 shadow-[0_0_30px_rgba(99,102,241,0.3)]">
                            <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-indigo-400"></div>
                            <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-indigo-400"></div>
                            <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-indigo-400"></div>
                            <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-indigo-400"></div>

                            <div className="w-full h-0.5 bg-red-500 shadow-[0_0_12px_#ef4444] animate-bounce"></div>

                            <p className="absolute bottom-3 text-[11px] text-indigo-200/80 font-mono tracking-wider">
                                Apunte al código EAN / UPC
                            </p>
                        </div>

                        <p className="text-xs text-slate-300 mt-4 text-center max-w-xs">
                            Enfoque el código de barras del producto o genere uno automáticamente.
                        </p>
                    </div>

                    <div className="space-y-2 pb-4">
                        <button
                            type="button"
                            onClick={() => {
                                const code = generateRandomBarcode();
                                setBarcode(code);
                                setIsScannerOpen(false);
                                toast.success(`Código capturado: ${code}`);
                            }}
                            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 active:scale-95 transition"
                        >
                            <Barcode size={18} />
                            Simular Lectura de Código
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsScannerOpen(false)}
                            className="w-full py-2.5 bg-white/10 text-slate-300 font-medium text-xs rounded-xl hover:bg-white/15 transition"
                        >
                            Cerrar
                        </button>
                    </div>
                </div>
            )}

            {/* MODAL: CARGA DE IMAGEN POR URL */}
            {isPhotoPickerOpen && (
                <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex flex-col justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-[#12101e] border border-white/10 rounded-3xl p-5 space-y-4 max-w-sm w-full mx-auto shadow-2xl">
                        <div className="flex items-center justify-between text-white">
                            <span className="font-bold text-sm flex items-center gap-2">
                                <Camera size={18} className="text-indigo-400" />
                                Imagen del Producto
                            </span>
                            <button
                                type="button"
                                onClick={() => setIsPhotoPickerOpen(false)}
                                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        <div className="w-full h-40 rounded-2xl bg-[#151320] border border-white/10 overflow-hidden flex items-center justify-center p-2">
                            {formData.imageUrl ? (
                                <img
                                    src={getDriveDirectLink(formData.imageUrl)}
                                    alt="Vista previa"
                                    className="w-full h-full object-contain"
                                />
                            ) : (
                                <div className="text-center text-slate-500">
                                    <ImageIcon size={32} className="mx-auto mb-1" />
                                    <span className="text-xs">Sin imagen</span>
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                                URL de Imagen (Web o Google Drive)
                            </label>
                            <input
                                type="url"
                                name="imageUrl"
                                autoComplete="off"
                                value={formData.imageUrl}
                                onChange={handleChange}
                                placeholder="Pegar enlace de la imagen..."
                                className="w-full bg-[#151320] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>

                        <div className="flex gap-2 pt-1">
                            {formData.imageUrl && (
                                <button
                                    type="button"
                                    onClick={() =>
                                        setFormData((prev: any) => ({ ...prev, imageUrl: "" }))
                                    }
                                    className="px-3 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 font-semibold text-xs rounded-xl transition"
                                >
                                    Limpiar
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={() => setIsPhotoPickerOpen(false)}
                                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition shadow-lg shadow-indigo-600/30"
                            >
                                Listo
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
