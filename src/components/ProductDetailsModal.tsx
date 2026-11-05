import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Product } from "@/types/product.types";
import { ROUTES } from "@/constants/routes";
import {
    Package,
    Layers,
    Barcode,
    TrendingUp,
    DollarSign,
    Coins,
    PackageOpen,
    Eye,
    EyeOff,
    Sparkles,
} from "lucide-react";
import { PencilIcon } from "@heroicons/react/20/solid";
import { getDriveDirectLink } from "@/helpers/url.helper";

interface ProductDetailsModalProps {
    isOpen: boolean;
    product: Product | null;
    onClose: () => void;
}

export function ProductDetailsModal({
    isOpen,
    product,
    onClose,
}: ProductDetailsModalProps) {
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape" && isOpen) onClose();
        };
        document.addEventListener("keydown", handleEsc);
        return () => document.removeEventListener("keydown", handleEsc);
    }, [isOpen, onClose]);

    if (!isOpen || !product) return null;

    const formatARS = (amount: number) => {
        return new Intl.NumberFormat("es-AR", {
            style: "currency",
            currency: "ARS",
            minimumFractionDigits: 2,
        }).format(amount);
    };

    const cost = product.costPrice != null ? Number(product.costPrice) : 0;
    const price = Number(product.price) || 0;
    const hasCost = cost > 0;
    const profitMargin = hasCost && price > 0
        ? (((price - cost) / cost) * 100).toFixed(1)
        : null;
    const netProfit = hasCost && price > 0 ? price - cost : null;

    return (
        <div
            className="fixed inset-0 z-[60] flex items-end md:items-center justify-center bg-black/70 backdrop-blur-md p-0 md:p-4"
            onClick={onClose}
        >
            <div
                className="bg-[#0C0A15]/95 backdrop-blur-3xl border-t md:border border-white/10 rounded-t-[32px] md:rounded-3xl p-5 md:p-6 w-full max-w-3xl shadow-[0_0_60px_rgba(0,0,0,0.7)] text-left transform transition-all animate-fade-in max-h-[92vh] md:max-h-[90vh] overflow-y-auto flex flex-col ring-1 ring-white/5"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Cabecera */}
                <div className="flex justify-between items-center mb-4 pb-3 border-b border-white/5">
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                            <Package size={20} />
                        </div>
                        <div>
                            <h2 className="text-base md:text-lg font-bold text-slate-100 flex items-center gap-2">
                                Detalle de Producto
                                <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-white/5 text-slate-400 border border-white/5">
                                    #{product.id}
                                </span>
                            </h2>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-slate-500 hover:text-rose-400 hover:bg-white/5 w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer text-2xl leading-none"
                    >
                        &times;
                    </button>
                </div>

                <div className="space-y-4">
                    {/* Tarjeta Superior: Imagen + Info Principal */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-white/[0.02] p-4 rounded-2xl border border-white/5 shadow-inner">
                        <div className="sm:col-span-1 flex justify-center items-center">
                            <div className="w-36 h-36 sm:w-full sm:h-auto sm:aspect-square rounded-xl bg-[#151320] border border-white/5 flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                                {product.imageUrl ? (
                                    <img
                                        src={getDriveDirectLink(product.imageUrl)}
                                        alt={product.name}
                                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                                    />
                                ) : (
                                    <Package size={42} className="text-slate-600" />
                                )}
                            </div>
                        </div>

                        <div className="sm:col-span-2 flex flex-col justify-between">
                            <div>
                                <div className="flex flex-wrap items-center gap-2 mb-2">
                                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center gap-1">
                                        <Layers size={11} />
                                        {product.category?.name || "Sin categoría"}
                                    </span>
                                    {product.isOffer && (
                                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                                            <Sparkles size={11} />
                                            En oferta
                                        </span>
                                    )}
                                </div>
                                <h3 className="text-lg sm:text-xl font-bold text-white leading-snug">
                                    {product.name}
                                </h3>
                                <p className="text-xs text-slate-400 mt-2 leading-relaxed line-clamp-3">
                                    {product.description || (
                                        <span className="italic text-slate-500">
                                            Sin descripción registrada.
                                        </span>
                                    )}
                                </p>
                            </div>

                            {/* Código de barra */}
                            <div className="mt-3 pt-3 border-t border-white/5 flex items-center gap-2 text-xs">
                                <Barcode size={16} className="text-slate-500 shrink-0" />
                                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                                    Código:
                                </span>
                                <span className="font-mono text-slate-300 font-medium">
                                    {product.barcode || <span className="text-slate-600 italic">Sin código</span>}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* BLOQUE FINANCIERO: Costo, Venta, Margen y Ganancia neta */}
                    <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1 mb-2 block">
                            Información Financiera y Rentabilidad
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {/* Costo */}
                            <div className="bg-white/[0.02] border border-white/5 p-3.5 rounded-2xl flex flex-col justify-between">
                                <div className="flex items-center justify-between text-slate-400 mb-1">
                                    <span className="text-[10px] font-bold uppercase tracking-wider">
                                        Precio de Costo
                                    </span>
                                    <div className="w-6 h-6 rounded-lg bg-slate-500/10 flex items-center justify-center text-slate-400">
                                        <Coins size={13} />
                                    </div>
                                </div>
                                <div>
                                    <span className="text-xl md:text-2xl font-black text-slate-200">
                                        {hasCost ? formatARS(cost) : <span className="text-slate-600 text-lg">No asignado</span>}
                                    </span>
                                    <span className="block text-[10px] text-slate-500 mt-0.5">
                                        Costo de adquisición
                                    </span>
                                </div>
                            </div>

                            {/* Venta */}
                            <div className="bg-emerald-500/[0.04] border border-emerald-500/15 p-3.5 rounded-2xl flex flex-col justify-between shadow-[0_0_20px_rgba(16,185,129,0.05)]">
                                <div className="flex items-center justify-between text-emerald-400 mb-1">
                                    <span className="text-[10px] font-bold uppercase tracking-wider">
                                        Precio de Venta
                                    </span>
                                    <div className="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                                        <DollarSign size={14} />
                                    </div>
                                </div>
                                <div>
                                    <span className="text-xl md:text-2xl font-black text-emerald-400">
                                        {formatARS(price)}
                                    </span>
                                    <span className="block text-[10px] text-emerald-500/70 mt-0.5">
                                        Precio al público
                                    </span>
                                </div>
                            </div>

                            {/* Margen y Ganancia */}
                            <div className="bg-indigo-500/[0.04] border border-indigo-500/15 p-3.5 rounded-2xl flex flex-col justify-between shadow-[0_0_20px_rgba(99,102,241,0.05)]">
                                <div className="flex items-center justify-between text-indigo-400 mb-1">
                                    <span className="text-[10px] font-bold uppercase tracking-wider">
                                        Margen / Ganancia
                                    </span>
                                    <div className="w-6 h-6 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                                        <TrendingUp size={13} />
                                    </div>
                                </div>
                                <div>
                                    {profitMargin !== null ? (
                                        <>
                                            <div className="flex items-baseline gap-1.5">
                                                <span className="text-xl md:text-2xl font-black text-indigo-300">
                                                    +{profitMargin}%
                                                </span>
                                            </div>
                                            <span className="block text-[10px] text-indigo-400/80 mt-0.5 font-medium">
                                                Ganancia: {formatARS(netProfit || 0)} / u.
                                            </span>
                                        </>
                                    ) : (
                                        <>
                                            <span className="text-sm font-semibold text-slate-500 block">
                                                Sin costo base
                                            </span>
                                            <span className="block text-[10px] text-slate-600 mt-0.5">
                                                Ingrese costo para calcular margen
                                            </span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stock y Catálogo */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white/[0.02] p-3 rounded-2xl border border-white/5 flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-slate-500/10 border border-white/5 flex items-center justify-center text-slate-300 shrink-0">
                                <PackageOpen size={18} />
                            </div>
                            <div>
                                <span className="text-[10px] text-slate-500 uppercase font-bold block">
                                    Stock disponible
                                </span>
                                <span
                                    className={`text-sm md:text-base font-black ${
                                        product.stock === 0
                                            ? "text-rose-400 drop-shadow-[0_0_8px_rgba(251,113,133,0.5)]"
                                            : "text-slate-100"
                                    }`}
                                >
                                    {product.stock ?? 0} unidades
                                </span>
                            </div>
                        </div>

                        <div className="bg-white/[0.02] p-3 rounded-2xl border border-white/5 flex items-center gap-3">
                            <div
                                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                                    product.showingInCatalog
                                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                                        : "bg-slate-500/10 border-white/5 text-slate-500"
                                }`}
                            >
                                {product.showingInCatalog ? <Eye size={18} /> : <EyeOff size={18} />}
                            </div>
                            <div>
                                <span className="text-[10px] text-slate-500 uppercase font-bold block">
                                    Catálogo Web
                                </span>
                                <span
                                    className={`text-xs md:text-sm font-bold ${
                                        product.showingInCatalog ? "text-emerald-400" : "text-slate-500"
                                    }`}
                                >
                                    {product.showingInCatalog ? "Visible al público" : "Oculto del catálogo"}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-5 flex justify-end border-t border-white/5 pt-4 gap-2.5">
                    <button
                        type="button"
                        className="px-5 py-2.5 font-bold rounded-xl text-xs flex-1 sm:flex-none border border-white/10 text-slate-300 bg-transparent transition-all duration-300 cursor-pointer hover:bg-white/5 hover:text-white active:scale-95"
                        onClick={onClose}
                    >
                        Cerrar
                    </button>
                    <Link
                        to={ROUTES.products.edit(product.id)}
                        className="px-5 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-500 transition cursor-pointer text-xs shadow-[0_0_20px_rgba(79,70,229,0.4)] flex items-center justify-center gap-2 flex-1 sm:flex-none border border-indigo-500/30 active:scale-95 hover:-translate-y-0.5"
                    >
                        <PencilIcon className="w-3.5 h-3.5" />
                        Editar producto
                    </Link>
                </div>
            </div>
        </div>
    );
}

