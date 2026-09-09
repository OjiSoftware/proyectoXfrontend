import React, { useState, useRef, useEffect } from "react";
import { Product } from "../types/product.types";
import { Search, ChevronDown, X, Plus } from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeadCell,
    TableRow,
} from "flowbite-react";

interface ProductSelectorProps {
    products: Product[];
    onProductSelect: (product: Product) => void;
}

const ProductSelector: React.FC<ProductSelectorProps> = ({
    products,
    onProductSelect,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const filteredProducts = products.filter((product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    const handleSelect = (product: Product) => {
        const stockActual = product.stock ?? 0;
        if (stockActual <= 0) return;

        onProductSelect(product);
        setSearchTerm("");
        setIsOpen(false);
    };

    return (
        <div className="w-full mb-4 relative" ref={containerRef}>
            <label className="block text-sm font-medium text-gray-200 mb-2">
                Buscar producto
            </label>

            <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-brand-400">
                    <Search size={18} />
                </div>

                <input
                    type="text"
                    placeholder="Escribe el nombre del producto..."
                    value={searchTerm}
                    onFocus={() => setIsOpen(true)}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setIsOpen(true);
                    }}
                    className="block w-full bg-slate-700/90 border border-gray-500 rounded-xl pl-10 pr-10 py-3 text-white focus:ring-2 focus:ring-brand-400 outline-none transition-all placeholder:text-gray-400"
                />

                <div className="absolute inset-y-0 right-0 pr-3 flex items-center gap-2">
                    {searchTerm && (
                        <button
                            type="button"
                            onClick={() => setSearchTerm("")}
                            className="text-gray-400 hover:text-white cursor-pointer"
                        >
                            <X size={16} />
                        </button>
                    )}
                    <ChevronDown
                        size={20}
                        className={`text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
                    />
                </div>
            </div>

            {isOpen && (
                <div className="absolute z-50 w-full mt-2 bg-slate-800 border border-slate-600 rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="max-h-64 overflow-y-auto custom-scrollbar">
                        <Table className="bg-transparent! shadow-none!">
                            <TableHead>
                                <TableRow>
                                    <TableHeadCell className="w-10 md:w-12 bg-slate-700/80! text-slate-400! border-b! border-slate-600! text-left py-2! px-3 md:px-4!">
                                        ID
                                    </TableHeadCell>
                                    <TableHeadCell className="bg-slate-700/80! text-slate-400! border-b! border-slate-600! text-left py-2! px-3 md:px-4!">
                                        Producto
                                    </TableHeadCell>
                                    <TableHeadCell className="hidden md:table-cell! bg-slate-700/80! text-slate-400! border-b! border-slate-600! text-center py-2! px-4!">
                                        Stock
                                    </TableHeadCell>
                                    <TableHeadCell className="hidden md:table-cell! bg-slate-700/80! text-slate-400! border-b! border-slate-600! text-center py-2! px-4!">
                                        Precio
                                    </TableHeadCell>
                                    <TableHeadCell className="w-12 md:w-16 bg-slate-700/80! border-b! border-slate-600! py-2! px-3 md:px-4!">
                                        <span className="sr-only">
                                            Acciones
                                        </span>
                                    </TableHeadCell>
                                </TableRow>
                            </TableHead>

                            <TableBody className="divide-y divide-slate-700/50">
                                {filteredProducts.length > 0 ? (
                                    filteredProducts.map((product) => {
                                        const stockActual = product.stock ?? 0;
                                        const isOutOfStock = stockActual <= 0;

                                        return (
                                            <TableRow
                                                key={product.id}
                                                onClick={() =>
                                                    !isOutOfStock &&
                                                    handleSelect(product)
                                                }
                                                className={`border-slate-700/50! transition-colors ${
                                                    isOutOfStock
                                                        ? "opacity-40 cursor-not-allowed bg-slate-900/50!"
                                                        : "cursor-pointer bg-transparent! hover:bg-slate-700/50!"
                                                }`}
                                            >
                                                <TableCell className="text-left font-mono text-xs text-gray-500! bg-transparent! py-3! px-3 md:px-4!">
                                                    {product.id}
                                                </TableCell>

                                                <TableCell className="text-left bg-transparent! py-3! px-3 md:px-4!">
                                                    {/* Nombre del producto */}
                                                    <div
                                                        className={`font-medium ${isOutOfStock ? "text-gray-500!" : "text-gray-200!"}`}
                                                    >
                                                        {product.name}
                                                    </div>

                                                    <div className="md:hidden flex items-center justify-between gap-3 mt-1.5 border-t border-slate-700/50 pt-1.5">
                                                        {isOutOfStock ? (
                                                            <span className="bg-red-500/20 text-red-400 text-[10px] font-bold px-2 py-0.5 rounded border border-red-500/30 uppercase">
                                                                Sin stock
                                                            </span>
                                                        ) : (
                                                            <span className="text-gray-400! text-[11px] font-medium">
                                                                Stock:{" "}
                                                                {stockActual}
                                                            </span>
                                                        )}
                                                        <span
                                                            className={`text-xs font-bold ${isOutOfStock ? "line-through text-gray-600!" : "text-emerald-400!"}`}
                                                        >
                                                            {Number(
                                                                product.price,
                                                            ).toLocaleString(
                                                                "es-AR",
                                                                {
                                                                    style: "currency",
                                                                    currency:
                                                                        "ARS",
                                                                    maximumFractionDigits: 0,
                                                                },
                                                            )}
                                                        </span>
                                                    </div>
                                                </TableCell>

                                                {/* Stock y Precio en Desktop */}
                                                <TableCell className="hidden md:table-cell! text-center bg-transparent! py-3! px-4!">
                                                    {isOutOfStock ? (
                                                        <span className="bg-red-500/20 text-red-400 text-[10px] font-bold px-2 py-0.5 rounded border border-red-500/30 uppercase">
                                                            Sin stock
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-300!">
                                                            {stockActual} un.
                                                        </span>
                                                    )}
                                                </TableCell>
                                                <TableCell
                                                    className={`hidden md:table-cell! text-center bg-transparent! py-3! px-4! ${isOutOfStock ? "line-through text-gray-600!" : "text-gray-300!"}`}
                                                >
                                                    {Number(
                                                        product.price,
                                                    ).toLocaleString("es-AR", {
                                                        style: "currency",
                                                        currency: "ARS",
                                                    })}
                                                </TableCell>

                                                <TableCell className="text-center bg-transparent! py-3! px-3 md:px-4!">
                                                    <button
                                                        type="button"
                                                        title="Agregar producto"
                                                        disabled={isOutOfStock}
                                                        className={`p-1.5 rounded-lg flex items-center justify-center mx-auto cursor-pointer ${
                                                            isOutOfStock
                                                                ? "text-gray-700"
                                                                : "text-brand-400 hover:text-white"
                                                        }`}
                                                    >
                                                        <Plus size={18} />
                                                    </button>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                ) : (
                                    <TableRow className="bg-transparent!">
                                        <TableCell
                                            colSpan={5}
                                            className="py-8 text-center text-gray-400! bg-transparent!"
                                        >
                                            No se encontraron productos
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductSelector;

