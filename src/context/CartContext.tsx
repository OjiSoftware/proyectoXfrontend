import { Product } from "@/types/product.types";
import { createContext, ReactNode, useContext, useState, useMemo } from "react";
import { useEffect } from "react";
export interface CartItem {
    product: Product;
    quantity: number;
}

interface CartContextType {
    cart: CartItem[];
    addToCart: (product: Product, quantity?: number) => void;
    removeFromCart: (productId: number) => void;
    updateQuantity: (productId: number, quantity: number) => void;
    clearCart: () => void;
    totalItems: number;
    totalPrice: number;
}

export const CartContext = createContext<CartContextType | undefined>(
    undefined,
);

export function CartProvider({ children }: { children: ReactNode }) {
    const [cart, setCart] = useState<CartItem[]>(() => {
        try {
            const savedCart = localStorage.getItem("cart");
            return savedCart ? JSON.parse(savedCart) : [];
        } catch (error) {
            console.error("Error cargando el carrito desde localStorage", error);
            return [];
        }
    });

    useEffect(() => {
        localStorage.setItem("cart", JSON.stringify(cart));
    }, [cart]);

    const addToCart = (product: Product, quantity: number = 1) => {
        setCart((prev) => {
            const existing = prev.find(
                (item) => item.product.id === product.id,
            );

            const currentQuantity = existing ? existing.quantity : 0;
            const newTotalQuantity = currentQuantity + quantity;

            if (product.stock !== undefined && newTotalQuantity > product.stock) {
                throw new Error(`Solo hay ${product.stock} unidades disponibles en stock.`);
            }

            if (existing) {
                return prev.map((item) =>
                    item.product.id === product.id
                        ? { ...item, quantity: newTotalQuantity }
                        : item,
                );
            }

            return [...prev, { product, quantity: newTotalQuantity }];
        });
    };

    const removeFromCart = (productId: number) => {
        setCart((prev) => prev.filter((item) => item.product.id !== productId));
    };

    const updateQuantity = (productId: number, quantity: number) => {
        if (quantity <= 0) {
            removeFromCart(productId);
            return;
        }

        setCart((prev) => {
            const existing = prev.find((item) => item.product.id === productId);
            if (!existing) return prev;

            if (existing.product.stock !== undefined && quantity > existing.product.stock) {
                throw new Error(`Solo hay ${existing.product.stock} unidades disponibles en stock.`);
            }

            return prev.map((item) =>
                item.product.id === productId ? { ...item, quantity } : item,
            );
        });
    };

    const clearCart = () => {
        setCart([]);
    };

    const totalItems = useMemo(() => {
        return cart.reduce((sum, item) => sum + item.quantity, 0);
    }, [cart]);

    const totalPrice = useMemo(() => {
        return cart.reduce(
            (sum, item) => sum + item.product.price * item.quantity,
            0,
        );
    }, [cart]);

    const value = useMemo(
        () => ({
            cart,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            totalItems,
            totalPrice,
        }),
        [cart, totalItems, totalPrice],
    );

    return (
        <CartContext.Provider value={value}>{children}</CartContext.Provider>
    );
}

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error("useCart debe usarse dentro de un CartProvider");
    }
    return context;
};
