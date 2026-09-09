import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Product } from "@/types/product.types";
import { ROUTES } from "@/constants/routes";
// Lucide para info técnica
import { Package, Tag, Layers, Info, Box } from "lucide-react";
// Heroicons para mantener consistencia con la tabla
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

    return (
      <div
        className="fixed inset-0 z-[60] flex items-end md:items-center justify-center bg-black/60 backdrop-blur-md p-0 md:p-4"
        onClick={onClose}
      >
        <div
          className="bg-[#0C0A15]/95 backdrop-blur-3xl border-t md:border border-white/10 rounded-t-[32px] md:rounded-3xl p-4 md:p-6 w-full max-w-4xl shadow-[0_0_50px_rgba(0,0,0,0.5)] text-left transform transition-all animate-fade-in max-h-[95vh] md:max-h-[90vh] overflow-y-auto flex flex-col ring-1 ring-white/5"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Cabecera */}
          <div className="flex justify-between items-center mb-4 md:mb-6 border-b border-white/5 pb-3 md:pb-4">
            <h2 className="text-lg md:text-xl font-bold text-slate-100 flex items-center gap-2">
              <Package className="text-brand-400" size={20} />
              Detalles <span className="hidden md:inline">del producto</span>
              <span className="tracking-wider">#{product.id}</span>
            </h2>
            <button
              onClick={onClose}
              className="text-slate-500 hover:text-rose-400 hover:bg-white/5 w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer text-2xl md:text-3xl leading-none"
            >
              &times;
            </button>
          </div>

          <div className="space-y-4 md:space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              {/* Imagen */}
              <div className="md:col-span-1 flex justify-center">
                <div className="w-48 h-48 md:w-full md:h-auto md:aspect-square rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-center overflow-hidden shrink-0">
                  {product.imageUrl ? (
                    <img
                      src={getDriveDirectLink(product.imageUrl)}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                    />
                  ) : (
                    <Package size={48} className="text-slate-500 opacity-50" />
                  )}
                </div>
              </div>

              {/* Bloque de Información Principal */}
              <div className="md:col-span-2">
                <div className="bg-white/[0.02] p-4 md:p-5 rounded-2xl border border-white/5 h-full flex flex-col shadow-inner">
                  <div className="mb-2 md:mb-4">
                    <h3 className="text-xl md:text-2xl font-bold text-white leading-tight">
                      {product.name}
                    </h3>
                  </div>

                  {/* Descripción arriba del borde */}
                  <p className="text-xs md:text-sm text-slate-400 italic leading-relaxed mb-4">
                    {product.description ||
                      'Este producto no cuenta con una descripción detallada por el momento.'}
                  </p>

                  {/* Borde y Precio abajo de la descripción */}
                  <div className="mt-auto pt-3 md:pt-4 border-t border-white/5 inline-flex flex-col">
                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                      Precio de venta
                    </span>
                    <span className="text-2xl md:text-3xl font-black text-emerald-400">
                      {formatARS(product.price || 0)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 md:gap-4">
              {/* Categoría */}
              <div className="bg-white/[0.02] p-3 md:p-4 rounded-2xl border border-white/5 flex flex-col md:flex-row gap-2 md:gap-4 md:items-center">
                <div className="p-2 md:p-3 bg-indigo-500/10 rounded-xl text-indigo-400 w-fit">
                  <Layers size={18} className="md:w-5 md:h-5" />
                </div>
                <div>
                  <span className="text-[10px] md:text-xs text-slate-500 uppercase block font-medium">
                    Categoría
                  </span>
                  <span className="text-xs md:text-sm font-semibold text-slate-200">
                    {product.subCategory?.category?.name || 'General'}
                    <span className="text-slate-600 mx-1">/</span>
                    {product.subCategory?.name || 'Varios'}
                  </span>
                </div>
              </div>

              {/* Marca */}
              <div className="bg-white/[0.02] p-3 md:p-4 rounded-2xl border border-white/5 flex flex-col md:flex-row gap-2 md:gap-4 md:items-center">
                <div className="p-2 md:p-3 bg-amber-500/10 rounded-xl text-amber-400 w-fit">
                  <Tag size={18} className="md:w-5 md:h-5" />
                </div>
                <div>
                  <span className="text-[10px] md:text-xs text-slate-500 uppercase block font-medium">
                    Marca
                  </span>
                  <span className="text-xs md:text-sm font-semibold text-slate-200">
                    {product.brand?.name || 'Sin Marca'}
                  </span>
                </div>
              </div>

              {/* Stock */}
              <div className="bg-white/[0.02] p-3 md:p-4 rounded-2xl border border-white/5 flex flex-col md:flex-row gap-2 md:gap-4 md:items-center">
                <div className="p-2 md:p-3 bg-emerald-500/10 rounded-xl text-emerald-400 w-fit">
                  <Info size={18} className="md:w-5 md:h-5" />
                </div>
                <div>
                  <span className="text-[10px] md:text-xs text-slate-500 uppercase block font-medium">
                    Stock
                  </span>
                  <span
                    className={`text-xs md:text-sm font-bold ${product.stock === 0 ? 'text-rose-400 drop-shadow-[0_0_8px_rgba(251,113,133,0.5)]' : 'text-slate-200'}`}
                  >
                    {product.stock ?? 0} u.
                  </span>
                </div>
              </div>

              {/* Presentación */}
              <div className="bg-white/[0.02] p-3 md:p-4 rounded-2xl border border-white/5 flex flex-col md:flex-row gap-2 md:gap-4 md:items-center">
                <div className="p-2 md:p-3 bg-slate-500/10 rounded-xl text-slate-400 w-fit">
                  <Box size={18} className="md:w-5 md:h-5" />
                </div>
                <div>
                  <span className="text-[10px] md:text-xs text-slate-500 uppercase block font-medium">
                    Unidad
                  </span>
                  <span className="text-xs md:text-sm font-semibold text-slate-200">
                    {product.unit || 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            {/* Banner de Catálogo */}
            <div
              className={`p-2 md:p-3 rounded-2xl border flex items-center justify-center gap-2 text-[10px] md:text-xs font-bold tracking-widest uppercase ${
                product.showingInCatalog
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
                  : 'bg-white/[0.02] border-white/5 text-slate-500'
              }`}
            >
              <div
                className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full ${product.showingInCatalog ? 'bg-emerald-400 animate-pulse' : 'bg-gray-400'}`}
              ></div>
              {product.showingInCatalog ? 'Visible en Catálogo' : 'Oculto'}
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 md:mt-8 flex justify-end border-t border-white/5 pt-4 gap-2 md:gap-3">
            <button
              className="px-4 md:px-6 py-3 md:py-2.5 font-bold rounded-2xl text-xs flex-1 md:flex-none border border-white/10 text-slate-300 bg-transparent transition-all duration-300 cursor-pointer hover:bg-white/5 hover:text-white"
              onClick={onClose}
            >
              Cerrar
            </button>
            <Link
              to={ROUTES.products.edit(product.id)}
              className="px-4 md:px-6 py-3 md:py-2.5 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-500 transition cursor-pointer text-xs shadow-[0_0_20px_rgba(79,70,229,0.4)] flex items-center justify-center gap-2 flex-1 md:flex-none border border-indigo-500/30 active:scale-95 hover:-translate-y-0.5"
            >
              <PencilIcon className="w-3.5 h-3.5 md:w-4 md:h-4" />
              Editar producto
            </Link>
          </div>
        </div>
      </div>
    );
}

