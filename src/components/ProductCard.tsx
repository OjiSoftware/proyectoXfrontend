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
                style: { backgroundColor: "#37b9c7", color: "#FFE600", fontWeight: "bold" },
                duration: 2000,
            });

            setProductQuantity(1);
        } catch (error: any) {
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
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-3.5 sm:p-4 flex flex-col hover:shadow-xl hover:-translate-y-1 hover:border-[#D5F3F4] transition-all duration-300 w-full h-full max-w-full sm:max-w-60 group/card">
            {/* Imagen del Producto */}
            <Link
                to={`/producto/${product.id}`}
                className="w-full aspect-square flex items-center justify-center mb-2.5 cursor-pointer relative group bg-gradient-to-b from-[#F4FBFB] to-[#E8F7F8] rounded-2xl overflow-hidden border border-[#D5F3F4]/60"
            >
                <img
                    src={getDriveDirectLink(product.imageUrl) || "https://via.placeholder.com/150"}
                    alt={product.name || "Nombre del producto"}
                    className="w-full h-full object-contain p-2.5 group-hover:scale-108 transition-transform duration-300 mix-blend-multiply drop-shadow-sm"
                />
                {product.isOffer && (
                    <span className="absolute top-2.5 right-2.5 rounded-full bg-gradient-to-r from-[#FF9F43] to-[#F368E0] bg-[#FF8A3D] px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-white shadow-sm">
                        Oferta
                    </span>
                )}
                {/* Badge de cantidad en carrito */}
                {quantityInCart > 0 && (
                    <div className="absolute top-2.5 left-2.5 bg-[#2b99a6] text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-md z-10 flex items-center gap-1 ring-2 ring-white">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 text-[#FFF000]">
                            <path d="M2.25 2.25a.75.75 0 000 1.5h1.386c.17 0 .318.114.362.278l2.558 9.592a3.752 3.752 0 00-2.806 3.63c0 .414.336.75.75.75h15.75a.75.75 0 000-1.5H5.378A2.25 2.25 0 017.5 15h11.218a.75.75 0 00.674-.421 60.358 60.358 0 002.96-7.228.75.75 0 00-.525-.965A60.864 60.864 0 005.68 4.509l-.232-.867A1.875 1.875 0 003.636 2.25H2.25zM3.75 20.25a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zM16.5 20.25a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0z" />
                        </svg>
                        <span>{quantityInCart}</span>
                    </div>
                )}
            </Link>

            {/* Información */}
            <div className="grow flex flex-col justify-start">
                {/* Marca (Confianza) */}
                {product.brand && (
                    <span className="inline-block w-fit text-[10px] md:text-[11px] text-[#2b99a6] bg-[#D5F3F4]/50 px-2.5 py-0.5 rounded-full font-nunito font-bold uppercase tracking-wider mb-1.5">
                        {product.brand.name}
                    </span>
                )}

                <Link to={`/producto/${product.id}`}>
                    <h3
                        title={product.name}
                        className="text-[#1A2D2A] font-nunito text-sm md:text-base font-bold leading-snug tracking-tight hover:text-[#2b99a6] transition-colors line-clamp-2 min-h-[2.5em]"
                    >
                        {product.name}
                    </h3>
                </Link>
            </div>

            {/* Precio */}
            <div className="mt-2.5 pt-2 border-t border-gray-100 flex flex-col">
                <p className="text-[#2b99a6] font-nunito font-extrabold text-lg md:text-xl tracking-tight leading-none">
                    {formatPrice(product.price)}
                </p>
            </div>

            {/* Selector de Cantidad */}
            <div className="flex flex-col items-center gap-1.5 mb-1.5 mt-2.5">
                <div className="flex items-center justify-center bg-[#F4FBFB] border border-[#D5F3F4] rounded-full md:h-8 h-7 shadow-xs transition-all focus-within:border-[#2BAAB0] focus-within:ring-2 focus-within:ring-[#2BAAB0]/20 overflow-hidden w-full">
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
                                className="w-9 h-full flex items-center justify-center text-[#3d635f] hover:bg-white hover:text-red-500 transition-colors cursor-pointer active:bg-gray-100"
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
                                        setProductQuantity(Math.min(Math.max(0, val), maxAvailable));
                                    }
                                }}
                                onBlur={() => {
                                    if (productQuantity < minQuantity) setProductQuantity(minQuantity);
                                }}
                                className="flex-1 h-full text-center bg-transparent border-none font-bold text-[#1A2D2A] text-sm focus:ring-0 p-0 leading-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />

                            <button
                                type="button"
                                disabled={productQuantity >= maxAvailable}
                                className={`w-9 h-full flex items-center justify-center transition-colors ${productQuantity >= maxAvailable ? "text-gray-300 cursor-not-allowed" : "text-[#3d635f] hover:bg-white hover:text-[#2b99a6] cursor-pointer active:bg-gray-100"}`}
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
                className={`mt-1 relative ${isAdding
                    ? "bg-[#37b9c7]"
                    : "bg-[#2BAAB0] hover:bg-[#37b9c7] active:scale-[0.98]"
                    } text-white py-2.5 px-3 rounded-full shadow-sm hover:shadow-md flex items-center justify-center text-xs font-bold transition-all duration-200 ${isAdding || maxAvailable <= 0 ? "cursor-not-allowed opacity-70" : "cursor-pointer"} overflow-hidden`}
                onClick={handleAddToCart}
                disabled={isAdding || maxAvailable <= 0}
            >
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

                <div
                    className={`flex items-center justify-center gap-1.5 ${isAdding ? "invisible" : "visible"}`}
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
