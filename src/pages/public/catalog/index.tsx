import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { catalogApi } from "@/services/CatalogService";
import ProductCard from "@/components/ProductCard";
import Footer from "@/components/Footer";
import { CategorySidebar } from "@/components/CategorySidebar";
import Pagination from "@/components/PaginationCatalog";
import { Product } from "@/types/product.types";
import Navbar from "@/components/Navbar";

export default function CatalogPage() {
    const [searchParams, setSearchParams] = useSearchParams();

    // ---------------- STATE ----------------
    const [catProducts, setCatProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [search, setSearch] = useState(searchParams.get("search") || ""); // estado de búsqueda
    const [showFilters, setShowFilters] = useState(false); // Estado para mostrar/ocultar filtros
    const itemsPerPage = 12;

    const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
    const [selectedCatName, setSelectedCatName] = useState<string | null>(null);
    const [sortBy, setSortBy] = useState<"default" | "price_asc" | "price_desc" | "name_asc" | "name_desc">("default");

    // ---------------- FETCH ----------------
    useEffect(() => {
        const loadCatalog = async () => {
            try {
                setIsLoading(true);
                const data = await catalogApi.getCatalog();
                setCatProducts(data);
            } catch (error) {
                console.error("Error al cargar el catálogo:", error);
            } finally {
                setIsLoading(false);
            }
        };
        loadCatalog();
    }, []);

    // Sincronizar búsqueda desde URL si cambia (ej. al presionar enter en Navbar)
    useEffect(() => {
        setSearch(searchParams.get("search") || "");
    }, [searchParams]);

    // ---------------- BUSQUEDA Y FILTROS ----------------
    const filteredProducts = useMemo(() => {
        let filtered = catProducts;

        if (search.trim() !== '') {
            const searchTerms = search.toLowerCase().trim().split(/\s+/);

            filtered = filtered.filter((p) => {
                const searchableText = `
                    ${p.name}
                    ${p.category?.name || ''}
                `.toLowerCase();

                return searchTerms.every((term) => searchableText.includes(term));
            });
        }

        if (selectedCategory !== null) {
            filtered = filtered.filter(
                (p) => Number(p.categoryId) === selectedCategory || Number(p.category?.id) === selectedCategory
            );
        }

        return [...filtered].sort((a, b) => {
            const offerDiff = (b.isOffer ? 1 : 0) - (a.isOffer ? 1 : 0);
            if (offerDiff !== 0) return offerDiff;

            switch (sortBy) {
                case "price_asc":
                    return a.price - b.price;
                case "price_desc":
                    return b.price - a.price;
                case "name_asc":
                    return a.name.localeCompare(b.name, "es");
                case "name_desc":
                    return b.name.localeCompare(a.name, "es");
                default:
                    return (b.id ?? 0) - (a.id ?? 0);
            }
        });
    }, [search, selectedCategory, sortBy, catProducts]);

    // ---------------- HANDLERS DE FILTROS ----------------
    const handleSelectCategory = (catId: number, catName: string) => {
        setSelectedCategory(catId);
        setSelectedCatName(catName);
    };

    const handleClearFilters = () => {
        setSelectedCategory(null);
        setSelectedCatName(null);
        setSearch("");
        if (searchParams.has("search")) {
            searchParams.delete("search");
            setSearchParams(searchParams);
        }
    };

    // ---------------- PAGINACIÓN ----------------
    const lastIndex = currentPage * itemsPerPage;
    const firstIndex = lastIndex - itemsPerPage;
    const currentProducts = filteredProducts.slice(firstIndex, lastIndex);

    useEffect(() => {
        setCurrentPage(1);
    }, [search, selectedCategory, sortBy]);

    // ---------------- UI ----------------
    return (
        <div className="flex flex-col min-h-screen w-full bg-[#F8F8F8] font-nunito text-[#1A2D2A]">
            {/* Navbar con búsqueda */}
            <Navbar search={search} setSearch={setSearch} />

            <div className="w-full max-[1187px]:px-4 max-w-[1187px] mx-auto md:py-6 py-5 flex-grow">
                <div className="flex justify-between items-center mb-6">
                    <div className="text-[#9E9494] md:text-sm text-[12px] flex items-center gap-1.5 flex-wrap">
                        <span className="hover:text-gray-600 cursor-pointer transition-colors" onClick={handleClearFilters}>Upa Lelé</span>
                        {selectedCatName && (
                            <>
                                <span>/</span>
                                <span className="cursor-default font-semibold text-gray-500">{selectedCatName}</span>
                            </>
                        )}
                    </div>

                    {/* Ordenar + Botón Filtros (mobile) */}
                    <div className="flex items-center gap-3">
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                            aria-label="Ordenar productos"
                            className="border border-gray-200 bg-white shadow-sm px-3 py-2 rounded-xl text-xs md:text-sm font-semibold text-[#1A2D2A] focus:outline-none focus:border-[#37b9c7] cursor-pointer"
                        >
                            <option value="default">Más recientes</option>
                            <option value="price_asc">Menor precio</option>
                            <option value="price_desc">Mayor precio</option>
                            <option value="name_asc">Nombre: A - Z</option>
                            <option value="name_desc">Nombre: Z - A</option>
                        </select>

                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="md:hidden flex items-center gap-2 border border-gray-200 bg-white shadow-sm px-4 py-2 rounded-xl text-sm font-bold text-[#1A2D2A] hover:border-[#EDC062] hover:bg-gray-50 transition-all cursor-pointer"
                        >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" />
                        </svg>
                        <span>Filtros</span>
                        </button>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row items-start gap-6">
                    {/* FILTROS (Fijo / lateral a la izquierda en desktop, desplegable en mobile) */}
                    <div className={`${showFilters ? 'block' : 'hidden'} md:block w-full md:w-64 shrink-0`}>
                        <CategorySidebar
                            onSelectCategory={handleSelectCategory}
                            onClearFilters={handleClearFilters}
                            selectedCategory={selectedCategory}
                        />
                    </div>

                    {/* PRODUCTOS */}
                    <div className="w-full flex-1 flex flex-col gap-6 min-w-0">
                        {isLoading ? (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 flex-1 flex items-center justify-center">
                                <div className="animate-spin h-8 w-8 text-[#33aab8] rounded-full border-4 border-t-transparent border-[#33aab8]" />
                            </div>
                        ) : filteredProducts.length === 0 ? (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex-1 flex items-center justify-center">
                                <p className="text-gray-500 md:text-lg text-sm text-center">
                                    No hay productos que coincidan con la selección
                                </p>
                            </div>
                        ) : (
                            <>
                                {/* Contenedor de Productos */}
                                <div className="w-full h-fit">
                                    {/* GRID */}
                                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                                        {currentProducts.map((product) => (
                                            <ProductCard
                                                key={product.id}
                                                product={product}
                                            />
                                        ))}
                                    </div>
                                </div>

                                {/* PAGINACIÓN */}
                                <Pagination
                                    totalItems={filteredProducts.length}
                                    itemsPerPage={itemsPerPage}
                                    currentPage={currentPage}
                                    onPageChange={setCurrentPage}
                                />
                            </>
                        )}
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}
