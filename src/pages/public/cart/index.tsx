import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import CartTable from "@/components/CartTable";
import { useCart } from "@/context/CartContext";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeftIcon } from "@heroicons/react/20/solid";
import { ShoppingBag, Sparkles, ArrowRight } from "lucide-react";

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
            <div className="flex flex-col min-h-screen w-full bg-[linear-gradient(180deg,#d8f3f5_0%,#ffffff_420px,#ffffff_100%)] font-nunito text-[#1A2D2A]">
                <Navbar search={search} setSearch={setSearch} />
                <div className="flex-grow flex items-center justify-center p-6">
                    <div className="relative overflow-hidden text-center bg-white p-8 md:p-10 rounded-3xl shadow-md border border-[#D5F3F4] max-w-md w-full">
                        <div className="pointer-events-none absolute -right-10 -top-10 w-36 h-36 rounded-full bg-[#FFF6B8]/40" />
                        <div className="pointer-events-none absolute -left-10 -bottom-10 w-36 h-36 rounded-full bg-[#D5F3F4]/40" />
                        <div className="relative mx-auto w-16 h-16 rounded-2xl bg-[#FFF6B8] flex items-center justify-center mb-4 shadow-xs ring-4 ring-[#FFF6B8]/40">
                            <ShoppingBag className="w-8 h-8 text-[#2b99a6]" />
                        </div>
                        <h2 className="relative text-2xl font-bold mb-2 font-fredoka text-[#2b99a6]">
                            Tu carrito está vacío
                        </h2>
                        <p className="relative text-[#3d635f] mb-6 text-sm md:text-base font-nunito">
                            Agregá productos suaves y confiables desde nuestro catálogo para comenzar.
                        </p>
                        <button
                            className="relative px-8 py-3 bg-[#33aab8] hover:bg-[#2b99a6] text-white font-bold rounded-full transition-all w-full cursor-pointer text-sm uppercase tracking-wider shadow-[0_5px_0_rgba(26,45,42,0.12)] hover:-translate-y-0.5 inline-flex items-center justify-center gap-2"
                            onClick={() => navigate("/catalogo")}
                        >
                            Explorar tienda <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen w-full bg-[linear-gradient(180deg,#d8f3f5_0%,#ffffff_420px,#ffffff_100%)] font-nunito text-[#1A2D2A]">
            <Navbar search={search} setSearch={setSearch} />

            <div className="w-full max-w-[1187px] mx-auto py-6 md:py-8 flex-grow px-4">
                {/* Banner Encabezado Carrito */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#37b9c7] via-[#33aab8] to-[#2b99a6] p-6 md:p-8 mb-6 shadow-[0_12px_30px_-12px_rgba(43,170,176,0.45)] border border-white/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="pointer-events-none absolute -right-10 -top-10 w-44 h-44 rounded-full bg-white/15" />
                    <div className="relative">
                        <span className="inline-flex items-center gap-1.5 text-white/90 text-xs font-bold uppercase tracking-widest mb-1">
                            <Sparkles className="w-3.5 h-3.5 text-[#FFF000]" /> Tu pedido
                        </span>
                        <h1 className="text-2xl md:text-3xl font-bold font-fredoka text-[#FFF000] leading-tight drop-shadow-[0_2px_0_rgba(0,0,0,0.12)]">
                            Tu carrito de compras
                        </h1>
                    </div>
                    <button
                        onClick={() => navigate("/catalogo")}
                        className="relative w-fit bg-[#FFF6B8] hover:bg-white text-[#1A2D2A] text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-full flex items-center gap-1.5 cursor-pointer transition-all shadow-sm"
                    >
                        <ChevronLeftIcon className="w-4 h-4 text-[#2b99a6]" />
                        Seguir comprando
                    </button>
                </div>

                <div className="flex flex-col lg:flex-row gap-6 items-start">
                    {/* Lista de productos */}
                    <div className="flex-[0_0_100%] lg:flex-[0_0_66%] bg-white rounded-3xl shadow-sm border border-[#D5F3F4] overflow-hidden w-full p-2">
                        <CartTable cart={cart} />
                    </div>

                    {/* Resumen de orden */}
                    <div className="flex-[0_0_100%] lg:flex-[1_1_32%] bg-gradient-to-br from-[#FFF9CE] to-[#FFF29C] rounded-3xl shadow-md border border-amber-200/70 p-6 sticky top-8 flex flex-col gap-4 font-nunito w-full">
                        <h2 className="text-lg font-bold text-[#2b99a6] border-b border-amber-200/70 pb-3">
                            Resumen del pedido
                        </h2>

                        <div className="flex flex-col gap-1 my-1">
                            <div className="flex justify-between items-center">
                                <span className="font-bold text-[#3d635f] text-base">
                                    Total provisional
                                </span>
                                <span className="font-black text-2xl text-[#2b99a6]">
                                    $
                                    {totalPrice.toLocaleString("es-AR", {
                                        minimumFractionDigits: 2,
                                    })}
                                </span>
                            </div>
                        </div>

                        {/* BOTÓN HACIA WHATSAPP: Pedido directo */}
                        <button
                            className="w-full py-3.5 bg-[#33aab8] hover:bg-[#2b99a6] text-white text-sm uppercase tracking-wider font-bold rounded-full transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_5px_0_rgba(26,45,42,0.12)] hover:-translate-y-0.5 active:scale-[0.98]"
                            onClick={handleRealizarPedido}
                        >
                            Realizar pedido <ArrowRight className="w-4 h-4" />
                        </button>

                        {!showConfirmClear ? (
                            <button
                                className="w-full py-2.5 bg-white/80 text-red-500 text-xs uppercase tracking-wider font-bold rounded-full hover:bg-white transition border border-red-200 cursor-pointer"
                                onClick={() => setShowConfirmClear(true)}
                            >
                                Vaciar carrito
                            </button>
                        ) : (
                            <div className="flex flex-col gap-2 mt-1 bg-white/80 p-3.5 rounded-2xl border border-red-200">
                                <span className="text-xs text-red-600 text-center font-bold">
                                    ¿Seguro que deseas vaciar el carrito?
                                </span>
                                <div className="flex gap-2">
                                    <button
                                        className="w-1/2 py-2 bg-red-500 text-white text-xs font-bold rounded-full hover:bg-red-600 transition cursor-pointer"
                                        onClick={() => {
                                            clearCart();
                                            setShowConfirmClear(false);
                                        }}
                                    >
                                        Sí, vaciar
                                    </button>
                                    <button
                                        className="w-1/2 py-2 bg-gray-100 text-[#3d635f] text-xs font-bold rounded-full hover:bg-gray-200 transition cursor-pointer"
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
