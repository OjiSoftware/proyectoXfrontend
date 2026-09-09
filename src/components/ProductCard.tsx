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
                style: { backgroundColor: "#EDC062", color: "#1A2D2A" },
                duration: 2000,
            });

            setProductQuantity(1);
        } catch (error: any) {
            // Check if error comes from stock limits
            toast.error(error.message || "Error al agregar al carrito", {
                style: { backgroundColor: "#f44336", color: "white" },
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
        <div className="group flex flex-col w-full h-full relative cursor-pointer">
            {/* Imagen del Producto en contenedor limpio */}
            <div className="w-full aspect-square bg-[#F5F6F8] rounded-2xl overflow-hidden relative mb-4 transition-all duration-300 group-hover:shadow-md">
                <Link to={`/producto/${product.id}`} className="w-full h-full flex items-center justify-center p-6">
                    <img
                        src={getDriveDirectLink(product.imageUrl) || "https://via.placeholder.com/150"}
                        alt={product.name || "Nombre del producto"}
                        className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500 mix-blend-multiply"
                    />
                </Link>

                {/* Badge de cantidad en carrito */}
                {quantityInCart > 0 && (
                    <div className="absolute top-3 left-3 bg-[#1A2D2A] text-[#EDC062] text-[10px] font-bold px-3 py-1.5 rounded-full shadow-sm z-10 flex items-center gap-1.5">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
                            <path d="M2.25 2.25a.75.75 0 000 1.5h1.386c.17 0 .318.114.362.278l2.558 9.592a3.752 3.752 0 00-2.806 3.63c0 .414.336.75.75.75h15.75a.75.75 0 000-1.5H5.378A2.25 2.25 0 017.5 15h11.218a.75.75 0 00.674-.421 60.358 60.358 0 002.96-7.228.75.75 0 00-.525-.965A60.864 60.864 0 005.68 4.509l-.232-.867A1.875 1.875 0 003.636 2.25H2.25zM3.75 20.25a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zM16.5 20.25a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0z" />
                        </svg>
                        {quantityInCart}
                    </div>
                )}

                {/* Badge Out of Stock */}
                {maxAvailable <= 0 && (
                     <div className="absolute top-3 right-3 bg-red-500/90 backdrop-blur-sm text-white text-[10px] font-bold px-3 py-1.5 rounded-full shadow-sm z-10 uppercase tracking-wider">
                         Agotado
                     </div>
                )}

                {/* Quick Add Button (Aparece en hover) */}
                <div className="absolute inset-x-0 bottom-0 p-4 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all md:translate-y-4 md:group-hover:translate-y-0 duration-300 z-20">
                    <button
                        className={`w-full py-3 rounded-xl flex items-center justify-center text-sm font-bold shadow-lg transition-all ${
                            isAdding ? "bg-[#FAD390] text-[#1A2D2A]" : 
                            maxAvailable <= 0 ? "bg-gray-300 text-gray-500 cursor-not-allowed" : 
                            "bg-[#1A2D2A] hover:bg-[#EDC062] text-white hover:text-[#1A2D2A] cursor-pointer"
                        }`}
                        onClick={handleAddToCart}
                        disabled={isAdding || maxAvailable <= 0}
                    >
                        {isAdding ? (
                            <div className="flex items-center gap-2">
                                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                <span>Agregando...</span>
                            </div>
                        ) : maxAvailable <= 0 ? (
                            <span>Sin Stock</span>
                        ) : (
                            <div className="flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                                <span>Agregar al carrito</span>
                            </div>
                        )}
                    </button>
                </div>
            </div>

            {/* Información centrada y elegante */}
            <div className="flex flex-col items-center text-center px-2">
                {product.brand && (
                    <span className="text-[10px] md:text-[11px] text-gray-500 font-sans uppercase tracking-[0.2em] mb-1.5">
                        {product.brand.name}
                    </span>
                )}
                <Link to={`/producto/${product.id}`}>
                    <h3 className="text-[#1A2D2A] text-[14px] md:text-[16px] font-bold leading-snug tracking-tight hover:text-[#EDC062] transition-colors line-clamp-2">
                        {product.name}
                    </h3>
                </Link>
                <p className="text-[#1A2D2A] font-black text-[18px] md:text-[20px] tracking-tighter mt-2">
                    {formatPrice(product.price)}
                </p>
                {product.unit && (
                    <span className="text-[10px] font-sans text-gray-400 mt-1 uppercase tracking-wider">
                        {product.unit}
                    </span>
                )}
            </div>
        </div>
    );
};

export default ProductCard;
