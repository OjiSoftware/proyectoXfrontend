import React, { useState } from "react";
import { CartItem, useCart } from "@/context/CartContext";
import { TrashIcon } from "@heroicons/react/24/outline";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/20/solid";
import { getDriveDirectLink } from "@/helpers/url.helper";

interface CartRowProps {
    item: CartItem;
}

const CartRow: React.FC<CartRowProps> = ({ item }) => {
    const { updateQuantity, removeFromCart } = useCart();
    const [isExpanded, setIsExpanded] = useState(false);

    const maxStock = item.product.stock ?? Infinity;
    const isAtMaxStock = item.quantity >= maxStock;

    const imageUrl =
        getDriveDirectLink(item.product.imageUrl) ||
        "https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg";

    return (
        <div className="p-4 bg-white hover:bg-gray-50 transition-colors font-lato border-b border-gray-100 last:border-b-0 relative">
            {/* Grid Principal: Se añade min-w-0 para permitir que el contenido se encoja */}
            <div className="flex flex-col sm:grid sm:grid-cols-[4fr_1.5fr_1.2fr_1.5fr_24px] gap-4 sm:items-center">
                {/* Columna 1: Contenedor de Imagen y Título */}
                <div className="flex items-center justify-between w-full min-w-0">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                        {isExpanded && (
                            <div className="w-16 h-16 flex-shrink-0 flex items-center justify-center p-1 border border-gray-200 rounded bg-white">
                                <img
                                    src={imageUrl}
                                    alt={item.product.name}
                                    className="max-w-full max-h-full object-contain mix-blend-multiply"
                                />
                            </div>
                        )}

                        {/* El contenedor del texto tiene flex-1 y min-w-0 para forzar el truncado */}
                        <div className="flex flex-col gap-0.5 justify-center min-w-0 flex-1">
                            <div className="flex items-center gap-x-3 min-w-0">
                                <h3
                                    title={item.product.name}
                                    className="text-[#3b4b5e] text-[15px] sm:text-sm font-bold hover:underline cursor-pointer truncate"
                                >
                                    {item.product.name}
                                </h3>

                                {/* Delete Button (Desktop) */}
                                <button
                                    onClick={() =>
                                        removeFromCart(item.product.id)
                                    }
                                    className="hidden sm:flex flex-shrink-0 text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded transition items-center justify-center cursor-pointer"
                                    title="Eliminar producto"
                                >
                                    <TrashIcon className="w-5 h-5 sm:w-4 sm:h-4 stroke-2" />
                                </button>
                            </div>
                            {/* Unit */}
                            {item.product.unit && (
                                <span className="text-[12px] text-gray-400 font-lato">
                                    {item.product.unit}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Flecha Desplegable (Móvil) */}
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="sm:hidden text-gray-400 hover:text-gray-600 transition p-1 hover:bg-gray-100 rounded flex-shrink-0 cursor-pointer ml-2"
                        title={isExpanded ? "Ocultar imagen" : "Ver imagen"}
                    >
                        {isExpanded ? (
                            <ChevronUpIcon className="w-5 h-5" />
                        ) : (
                            <ChevronDownIcon className="w-5 h-5" />
                        )}
                    </button>
                </div>

                {/* Column 2: Unit Price (Desktop) */}
                <div className="hidden sm:flex flex-col text-center justify-center h-full">
                    <span className="text-[#3b4b5e] font-bold text-[15px]">
                        ${" "}
                        {Number(item.product.price).toLocaleString("es-AR", {
                            minimumFractionDigits: 2,
                        })}
                    </span>
                </div>

                {/* Column 3: Quantity Control (Desktop) */}
                <div className="hidden sm:flex flex-col items-center justify-center">
                    {/* h-8 es el tamaño ideal: ni gigante ni minúsculo */}
                    <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg h-8 shadow-sm transition-all focus-within:border-blue-400 focus-within:ring-1 focus-within:ring-blue-50 overflow-hidden">
                        {/* Botón Menos - w-8 lo hace cuadrado perfecto con el h-8 del padre */}
                        <button
                            type="button"
                            className="w-6 h-full flex items-center justify-center text-gray-500 hover:bg-white hover:text-red-500 transition-colors cursor-pointer active:bg-gray-100"
                            onClick={() =>
                                updateQuantity(
                                    item.product.id,
                                    Math.max(1, item.quantity - 1),
                                )
                            }
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={3}
                                stroke="currentColor"
                                className="w-3.5 h-3.5"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M19.5 12h-15"
                                />
                            </svg>
                        </button>

                        {/* Input de Cantidad - w-9 es suficiente para 2 o 3 dígitos sin sobrar demasiado espacio */}
                        <input
                            type="number"
                            value={item.quantity === 0 ? "" : item.quantity}
                            onChange={(e) => {
                                const rawValue = e.target.value;
                                if (rawValue === "") {
                                    updateQuantity(item.product.id, 0);
                                    return;
                                }
                                const val = parseInt(rawValue, 10);
                                if (!isNaN(val)) {
                                    updateQuantity(
                                        item.product.id,
                                        Math.min(Math.max(0, val), maxStock),
                                    );
                                }
                            }}
                            onBlur={() => {
                                if (item.quantity < 1)
                                    updateQuantity(item.product.id, 1);
                            }}
                            className="w-9 h-full text-center bg-transparent border-none font-bold text-[#3b4b5e] text-sm focus:ring-0 p-0 leading-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />

                        <button
                            type="button"
                            disabled={isAtMaxStock}
                            className={`w-6 h-full flex items-center justify-center transition-colors active:bg-gray-100 ${isAtMaxStock
                                ? "text-gray-300 cursor-not-allowed"
                                : "text-gray-500 hover:bg-white hover:text-green-600 cursor-pointer"
                                }`}
                            onClick={() => {
                                if (!isAtMaxStock) {
                                    updateQuantity(
                                        item.product.id,
                                        item.quantity + 1,
                                    );
                                }
                            }}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={3}
                                stroke="currentColor"
                                className="w-3.5 h-3.5"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M12 4.5v15m7.5-7.5h-15"
                                />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Column 4: Total Price (Desktop) */}
                <div className="hidden sm:flex flex-col text-center justify-center h-full">
                    <div className="text-[#2f3027] font-bold font-lato text-[15px] lg:text-base whitespace-nowrap">
                        ${" "}
                        {(item.product.price * item.quantity).toLocaleString(
                            "es-AR",
                            {
                                minimumFractionDigits: 2,
                            },
                        )}
                    </div>
                </div>

                {/* Column 5: Flecha Desplegable (Desktop) */}
                <div className="hidden sm:flex sm:justify-end sm:items-center">
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="text-gray-400 hover:text-gray-600 transition p-1 hover:bg-gray-100 rounded cursor-pointer"
                        title={isExpanded ? "Ocultar imagen" : "Ver imagen"}
                    >
                        {isExpanded ? (
                            <ChevronUpIcon className="w-5 h-5" />
                        ) : (
                            <ChevronDownIcon className="w-5 h-5" />
                        )}
                    </button>
                </div>

                {/* MOBILE VIEW EXPANDED AREA */}
                <div
                    className={`${isExpanded ? "flex" : "hidden"} sm:hidden flex-col gap-4 w-full mt-2 items-center border-t border-gray-50 pt-4`}
                >
                    {/* Unit Price (Mobile) */}
                    <div className="flex flex-col text-center justify-center w-full">
                        <span className="text-gray-400 text-xs mb-1 uppercase font-bold tracking-wider">
                            Precio Unitario
                        </span>
                        <span className="text-[#3b4b5e] font-bold text-[15px]">
                            ${" "}
                            {Number(item.product.price).toLocaleString(
                                "es-AR",
                                { minimumFractionDigits: 2 },
                            )}
                        </span>
                    </div>

                    {/* Quantity Control (Mobile) */}
                    <div className="flex flex-col items-center justify-center">
                        <span className="text-gray-400 text-xs mb-1 uppercase font-bold tracking-wider">
                            Cantidad
                        </span>

                        {/* Contenedor principal con el mismo estilo que Desktop */}
                        <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg h-8 shadow-sm transition-all focus-within:border-blue-400 focus-within:ring-1 focus-within:ring-blue-50 overflow-hidden">
                            {/* Botón Menos */}
                            <button
                                type="button"
                                className="w-8 h-full flex items-center justify-center text-gray-500 hover:bg-white hover:text-red-500 transition-colors cursor-pointer active:bg-gray-100"
                                onClick={() =>
                                    updateQuantity(
                                        item.product.id,
                                        Math.max(1, item.quantity - 1),
                                    )
                                }
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={3}
                                    stroke="currentColor"
                                    className="w-3.5 h-3.5"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M19.5 12h-15"
                                    />
                                </svg>
                            </button>

                            {/* Input de Cantidad */}
                            <input
                                type="number"
                                value={item.quantity === 0 ? "" : item.quantity}
                                onChange={(e) => {
                                    const rawValue = e.target.value;
                                    if (rawValue === "") {
                                        updateQuantity(item.product.id, 0);
                                        return;
                                    }
                                    const val = parseInt(rawValue, 10);
                                    if (!isNaN(val)) {
                                        updateQuantity(
                                            item.product.id,
                                            Math.min(Math.max(0, val), maxStock),
                                        );
                                    }
                                }}
                                onBlur={() => {
                                    if (item.quantity < 1)
                                        updateQuantity(item.product.id, 1);
                                }}
                                className="w-9 h-full text-center bg-transparent border-none font-bold text-[#3b4b5e] text-sm focus:ring-0 p-0 leading-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />

                            {/* Botón Más */}
                            <button
                                type="button"
                                disabled={isAtMaxStock}
                                className={`w-8 h-full flex items-center justify-center transition-colors active:bg-gray-100 ${isAtMaxStock
                                    ? "text-gray-300 cursor-not-allowed"
                                    : "text-gray-500 hover:bg-white hover:text-green-600 cursor-pointer"
                                    }`}
                                onClick={() => {
                                    if (!isAtMaxStock) {
                                        updateQuantity(
                                            item.product.id,
                                            item.quantity + 1,
                                        );
                                    }
                                }}
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={3}
                                    stroke="currentColor"
                                    className="w-3.5 h-3.5"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M12 4.5v15m7.5-7.5h-15"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Total & Delete (Mobile) */}
                    <div className="flex justify-between items-center border-t border-gray-100 pt-3 w-full">
                        <button
                            onClick={() => removeFromCart(item.product.id)}
                            className="text-red-500 font-bold text-sm flex items-center gap-1"
                        >
                            <TrashIcon className="w-5 h-5" /> Eliminar
                        </button>
                        <div className="text-right">
                            <span className="text-gray-400 text-xs uppercase font-bold block">
                                Subtotal
                            </span>
                            <span className="text-[#2f3027] font-bold text-[17px]">
                                ${" "}
                                {(
                                    item.product.price * item.quantity
                                ).toLocaleString("es-AR", {
                                    minimumFractionDigits: 2,
                                })}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CartRow;
