import React from "react";
import { CartItem } from "@/context/CartContext";
import CartRow from "@/components/CartRow";

interface CartTableProps {
    cart: CartItem[];
}

const CartTable: React.FC<CartTableProps> = ({ cart }) => {
    return (
        <div className="flex flex-col w-full [zoom:0.9] lg:[zoom:1]">
            <div className="hidden sm:grid grid-cols-[4fr_1.5fr_1.2fr_1.5fr_24px] gap-4 p-4 border-b border-gray-200 text-[11px] lg:text-xs font-bold text-gray-400 tracking-wider items-center font-lato">
                <div className="uppercase">Producto</div>
                <div className="uppercase text-center">Precio Unitario</div>
                <div className="uppercase text-center">Cantidad</div>
                <div className="uppercase text-center">Subtotal</div>
                <div></div> {/* Placeholder for the expand toggle */}
            </div>

            <div className="divide-y divide-gray-200">
                {cart.map((item) => (
                    <CartRow key={item.product.id} item={item} />
                ))}
            </div>
        </div>
    );
};

export default CartTable;
