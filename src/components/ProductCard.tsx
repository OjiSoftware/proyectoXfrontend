import React, { useState } from "react";
import type { Product } from "../types/product.types";
import { useCart } from "@/context/CartContext";
import { toast } from "react-hot-toast";
import { Link } from "react-router-dom";
import { getDriveDirectLink } from "@/helpers/url.helper";

interface Props {
    product: Product;
}

const ProductCard: React.FC<Props> = ({ product }) => {
    const { cart, addToCart } = useCart();
    const [isAdding, setIsAdding] = useState(false);
    const [productQuantity, setProductQuantity] = useState(1);

    // Calcular cantidad en carrito
    const cartItem = cart.find((item) => item.product.id === product.id);
    const quantityInCart = cartItem ? cartItem.quantity : 0;

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("es-AR", {
            style: "currency",
            currency: "ARS",
        }).format(price);
    };

    const handleAddToCart = async () => {
        setIsAdding(true);
        try {
            await new Promise((res) => setTimeout(res, 1000));

            addToCart(product, productQuantity);

            toast.success(`${product.name} agregado al carrito 🛒`, {
                style: { backgroundColor: "#1E8A90", color: "#FFE600", fontWeight: "bold" },
                duration: 2000,
            });

            setProductQuantity(1);
        } catch (error: any) {
            // Check if error comes from stock limits
            toast.error(error.message || "Error al agregar al carrito", {
                style: { backgroundColor: "#dc2626", color: "white" },
                duration: 3000,
            });
        } finally {
            setIsAdding(false);
        }
    };

    // Evaluate if user can add more in the selector based on current cart
    const maxAvailable = product.stock !== undefined ? product.stock - quantityInCart : Infinity;
    const minQuantity = maxAvailable <= 0 ? 0 : 1;

    // Adjust internal state if maxAvailable drops below current selection
    React.useEffect(() => {
        if (productQuantity > maxAvailable) {
            setProductQuantity(Math.max(minQuantity, maxAvailable));
        } else if (productQuantity < minQuantity) {
            setProductQuantity(minQuantity);
        }
    }, [maxAvailable, minQuantity, productQuantity]);

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col hover:shadow-xl hover:-translate-y-1 hover:border-[#2BAAB0]/40 transition-all duration-300 w-full h-full max-w-full sm:max-w-60 group/card">
            {/* Imagen del Producto */}
            <Link to={`/producto/${product.id}`} className="w-full aspect-square flex items-center justify-center md:mb-2 mb-0.5 cursor-pointer relative group bg-[#F4FBFB] rounded-xl overflow-hidden">
                <img
                    src={getDriveDirectLink(product.imageUrl) || "https://via.placeholder.com/150"}
                    alt={product.name || "Nombre del producto"}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300 mix-blend-multiply"
                />
                {/* Badge de cantidad en carrito */}
                {quantityInCart > 0 && (
                    <div className="absolute top-2 left-2 bg-[#1E8A90] text-[#FFE600] text-[11px] font-bold px-2.5 py-1 rounded-full shadow-md z-10 flex items-center gap-1 border border-[#FFE600]/30">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                            <path d="M2.25 2.25a.75.75 0 000 1.5h1.386c.17 0 .318.114.362.278l2.558 9.592a3.752 3.752 0 00-2.806 3.63c0 .414.336.75.75.75h15.75a.75.75 0 000-1.5H5.378A2.25 2.25 0 017.5 15h11.218a.75.75 0 00.674-.421 60.358 60.358 0 002.96-7.228.75.75 0 00-.525-.965A60.864 60.864 0 005.68 4.509l-.232-.867A1.875 1.875 0 003.636 2.25H2.25zM3.75 20.25a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zM16.5 20.25a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0z" />
                        </svg>
                        <span>{quantityInCart}</span>
                    </div>
                )}
            </Link>

            {/* Información */}
            <div className="grow flex flex-col justify-start mt-1">
                {/* Marca (Confianza) */}
                {product.brand && (
                    <span className="hidden md:block md:text-[11px] mt-2 text-gray-400 font-nunito font-semibold uppercase tracking-wider mb-1">
                        {product.brand.name}
                    </span>
                )}

                <Link to={`/producto/${product.id}`}>
                    <h3
                        title={product.name}
                        className="text-[#1A2D2A] font-nunito text-sm md:text-base font-bold leading-snug tracking-tight hover:text-[#1E8A90] transition-colors line-clamp-2"
                    >
                        {product.name}
                    </h3>
                </Link>

                {/* Badge de empaque - mobile */}
                {product.unit && (
                    <div className="md:hidden mt-2 text-[10px] font-bold font-nunito text-[#1E8A90] bg-[#D5F3F4] px-2 py-0.5 rounded-md w-fit border border-[#2BAAB0]/30 uppercase tracking-wide">
                        {product.unit}
                    </div>
                )}
                {/* Badge de empaque - desktop */}
                {product.unit && (
                    <div className="hidden md:block mt-2 text-[11px] font-bold font-nunito text-[#1E8A90] bg-[#D5F3F4] px-2.5 py-1 rounded-md w-fit border border-[#2BAAB0]/30 uppercase tracking-wide">
                        {product.unit}
                    </div>
                )}
            </div>

            {/* Precio - mobile */}
            <div className="md:hidden mt-3 mb-2 flex flex-col">
                <p className="text-[#1E8A90] font-nunito font-bold text-lg tracking-tight leading-none">
                    {formatPrice(product.price)}
                </p>
            </div>
            {/* Precio - desktop */}
            <div className="hidden md:flex mt-4 mb-3 flex-col">
                <p className="text-[#1E8A90] font-nunito font-bold text-xl tracking-tight leading-none">
                    {formatPrice(product.price)}
                </p>
            </div>

            {/* Selector de Cantidad */}
            <div className="flex flex-col items-center gap-1.5 mb-2 mt-2">
                <div className="flex items-center justify-center bg-gray-50 border border-gray-200 rounded-lg md:h-8 h-6 shadow-sm transition-all focus-within:border-[#2BAAB0] focus-within:ring-1 focus-within:ring-[#2BAAB0]/20 overflow-hidden min-w-[116px]">
                    {maxAvailable <= 0 ? (
                        <div className="text-center font-bold text-[11px] px-3 w-full">
                            {quantityInCart > 0 ? (
                                <span className="text-amber-600">Límite alcanzado</span>
                            ) : (
                                <span className="text-red-500">Sin stock</span>
                            )}
                        </div>
                    ) : (
                        <>
                            <button
                                type="button"
                                className="w-10 h-full flex items-center justify-center text-gray-500 hover:bg-white hover:text-red-500 transition-colors cursor-pointer active:bg-gray-100"
                                onClick={() =>
                                    setProductQuantity(Math.max(minQuantity, productQuantity - 1))
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

                            <input
                                type="number"
                                value={productQuantity === 0 ? "" : productQuantity}
                                onChange={(e) => {
                                    const rawValue = e.target.value;
                                    if (rawValue === "") {
                                        setProductQuantity(0);
                                        return;
                                    }
                                    const val = parseInt(rawValue, 10);
                                    if (!isNaN(val)) {
                                        // Clamp value up to max available
                                        setProductQuantity(Math.min(Math.max(0, val), maxAvailable));
                                    }
                                }}
                                onBlur={() => {
                                    if (productQuantity < minQuantity) setProductQuantity(minQuantity);
                                }}
                                className="w-9 h-full text-center bg-transparent border-none font-bold text-[#1A2D2A] text-sm focus:ring-0 p-0 leading-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />

                            <button
                                type="button"
                                disabled={productQuantity >= maxAvailable}
                                className={`w-10 h-full flex items-center justify-center transition-colors ${productQuantity >= maxAvailable ? "text-gray-300 cursor-not-allowed" : "text-gray-500 hover:bg-white hover:text-[#1E8A90] cursor-pointer active:bg-gray-100"}`}
                                onClick={() => setProductQuantity(Math.min(maxAvailable, productQuantity + 1))}
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
                        </>
                    )}
                </div>
            </div>

            {/* Botón Añadir al carrito */}
            <button
                className={`mt-2 relative ${isAdding
                    ? "bg-[#1E8A90]"
                    : "bg-[#2BAAB0] hover:bg-[#1E8A90] active:scale-[0.98]"
                    } text-white md:py-2 md:px-3 py-2 px-1 rounded-xl shadow-sm flex items-center justify-center text-xs font-bold transition-all duration-200 ${isAdding || maxAvailable <= 0 ? "cursor-not-allowed opacity-70" : "cursor-pointer"} overflow-hidden`}
                onClick={handleAddToCart}
                disabled={isAdding || maxAvailable <= 0}
            >
                {/* Spinner: Solo aparece si isAdding es true, posicionado absolutamente al centro */}
                {isAdding && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <svg
                            className="animate-spin h-5 w-5 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                        >
                            <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                            />
                            <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                        </svg>
                    </div>
                )}

                {/* Contenido original: Mantiene el ancho del botón incluso cargando */}
                <div
                    className={`flex items-center justify-center gap-2 ${isAdding ? "invisible" : "visible"}`}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                    </svg>
                    <span>Agregar al carrito</span>
                </div>
            </button>
        </div>
    );
};

export default ProductCard;
