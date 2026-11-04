import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import CartTable from "@/components/CartTable";
import { useCart } from "@/context/CartContext";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeftIcon } from "@heroicons/react/20/solid";

export default function CartPage() {
    const { cart, totalPrice, clearCart } = useCart();
    const [search, setSearch] = useState("");
    const navigate = useNavigate();
    const [showConfirmClear, setShowConfirmClear] = useState(false);

    const handleRealizarPedido = () => {
        if (cart.length === 0) return;

        const phoneClean = "5493456479016";

        let message = `🛒 *Nuevo Pedido - Upa Lelé*\n\n`;
        message += `¡Hola! Quisiera realizar el siguiente pedido:\n\n`;

        cart.forEach((item) => {
            const subtotal = item.product.price * item.quantity;
            message += `• ${item.quantity}x ${item.product.name} - $${subtotal.toLocaleString("es-AR", {
                minimumFractionDigits: 2,
            })}\n`;
        });

        message += `\n*Total: $${totalPrice.toLocaleString("es-AR", {
            minimumFractionDigits: 2,
        })}*\n\n`;
        message += `¡Muchas gracias!`;

        const whatsappUrl = `https://wa.me/${phoneClean}?text=${encodeURIComponent(message)}`;

        window.open(whatsappUrl, "_blank");
        clearCart();
        navigate("/catalogo");
    };

    // Si el carrito está vacío, mostramos el estado inicial
    if (cart.length === 0) {
        return (
            <div className="flex flex-col min-h-screen w-full bg-[#f1f3f5] font-nunito text-[#1A2D2A]">
                <Navbar search={search} setSearch={setSearch} />
                <div className="flex-grow flex items-center justify-center p-8">
                    <div className="text-center bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-md w-full">
                        <h2 className="text-2xl font-bold mb-3 font-fredoka text-[#1A2D2A]">
                            Tu carrito está vacío
                        </h2>
                        <p className="text-gray-600 mb-6 text-sm md:text-base font-nunito">
                            Agregá productos desde la tienda para comenzar.
                        </p>
                        <button
                            className="px-6 py-2.5 bg-[#37b9c7] hover:bg-[#2BAAB0] text-white font-bold rounded-xl transition w-full cursor-pointer text-sm shadow-sm"
                            onClick={() => navigate("/catalogo")}
                        >
                            Explorar tienda
                        </button>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen w-full bg-[#f1f3f5] border-b border-gray-200 font-nunito text-[#1A2D2A]">
            <Navbar search={search} setSearch={setSearch} />

            <div className="w-full max-w-[1187px] mx-auto py-6 flex-grow px-2 sm:px-4">
                {/* BOTÓN VOLVER */}
                <div className="mb-2">
                    <button
                        onClick={() => navigate("/catalogo")}
                        className="md:text-sm text-xs font-semibold text-[#37b9c7] hover:text-[#2BAAB0] flex items-center gap-1 cursor-pointer transition-colors"
                    >
                        <ChevronLeftIcon className="md:w-4 md:h-4 w-3 h-3" />
                        Volver a la tienda
                    </button>
                </div>

                <h1 className="text-2xl md:text-3xl font-bold font-fredoka text-[#1A2D2A] text-left leading-tight pb-4 px-1">
                    Tu carrito de compras
                </h1>

                <div className="flex flex-col lg:flex-row gap-6 items-start">
                    {/* Lista de productos */}
                    <div className="flex-[0_0_100%] lg:flex-[0_0_68%] bg-white rounded-2xl max-sm:rounded-none shadow-sm border border-gray-200 max-sm:border-x-0 overflow-hidden w-full">
                        <CartTable cart={cart} />
                    </div>

                    {/* Resumen de orden */}
                    <div className="flex-[0_0_100%] lg:flex-[1_1_30%] bg-white rounded-2xl max-sm:rounded-none shadow-sm border border-gray-200 max-sm:border-x-0 p-5 sticky top-8 flex flex-col gap-3 font-nunito w-full">

                        <div className="flex flex-col gap-1 mb-2 mt-1">
                            <div className="flex justify-between items-center">
                                <span className="font-bold text-gray-800 text-base">
                                    Total
                                </span>
                                <span className="font-black text-xl text-black">
                                    $
                                    {totalPrice.toLocaleString("es-AR", {
                                        minimumFractionDigits: 2,
                                    })}
                                </span>
                            </div>

                        </div>

                        {/* BOTÓN HACIA WHATSAPP: Pedido directo */}
                        <button
                            className="w-full py-3 bg-[#33aab8] text-white text-[0.95rem] font-bold rounded-lg hover:bg-[#15803d] transition shadow-md flex items-center justify-center gap-2 mt-2 cursor-pointer shadow-[0_0_20px_rgba(22,163,74,0.3)] hover:shadow-[0_0_25px_rgba(22,163,74,0.4)] active:scale-[0.98]"
                            onClick={handleRealizarPedido}
                        >
                            Realizar pedido
                        </button>

                        {!showConfirmClear ? (
                            <button
                                className="w-full py-2.5 bg-red-50 text-red-600 text-sm font-semibold rounded-lg hover:bg-red-100 transition border border-red-200 mt-1 cursor-pointer"
                                onClick={() => setShowConfirmClear(true)}
                            >
                                Vaciar carrito
                            </button>
                        ) : (
                            <div className="flex flex-col gap-2 mt-2">
                                <span className="text-xs text-red-600 text-center font-bold">
                                    ¿Seguro que deseas vaciar el carrito?
                                </span>
                                <div className="flex gap-2">
                                    <button
                                        className="w-1/2 py-2 bg-red-500 text-white text-sm font-bold rounded-lg hover:bg-red-600 transition cursor-pointer"
                                        onClick={() => {
                                            clearCart();
                                            setShowConfirmClear(false);
                                        }}
                                    >
                                        Sí, vaciar
                                    </button>
                                    <button
                                        className="w-1/2 py-2 bg-gray-200 text-gray-700 text-sm font-bold rounded-lg hover:bg-gray-300 transition cursor-pointer"
                                        onClick={() =>
                                            setShowConfirmClear(false)
                                        }
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}
