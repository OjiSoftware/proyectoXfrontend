import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { catalogApi } from "@/services/CatalogService";
import ProductCard from "@/components/ProductCard";
import Footer from "@/components/Footer";
import { CategorySidebar, SortOption } from "@/components/CategorySidebar";
import Pagination from "@/components/PaginationCatalog";
import { Product } from "@/types/product.types";
import Navbar from "@/components/Navbar";
import { PackageSearch } from "lucide-react";

export default function CatalogPage() {
    const [searchParams, setSearchParams] = useSearchParams();

    // ---------------- STATE ----------------
    const [catProducts, setCatProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [search, setSearch] = useState(searchParams.get("search") || ""); // estado de búsqueda
    const [showFilters, setShowFilters] = useState(false); // Estado para mostrar/ocultar filtros
    const itemsPerPage = 12;

    const initialCategoryId = searchParams.get("categoryId") ? Number(searchParams.get("categoryId")) : null;
    const [selectedCategory, setSelectedCategory] = useState<number | null>(initialCategoryId);
    const [selectedCatName, setSelectedCatName] = useState<string | null>(null);
    const [sortBy, setSortBy] = useState<SortOption>("default");

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

    // Sincronizar búsqueda y categoría desde URL si cambia
    useEffect(() => {
        setSearch(searchParams.get("search") || "");
        const catId = searchParams.get("categoryId");
        setSelectedCategory(catId ? Number(catId) : null);
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
        if (searchParams.has("search") || searchParams.has("categoryId")) {
            searchParams.delete("search");
            searchParams.delete("categoryId");
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
        <div className="flex flex-col min-h-screen w-full bg-[linear-gradient(180deg,#d8f3f5_0%,#ffffff_420px,#ffffff_100%)] font-nunito text-[#1A2D2A]">
            {/* Navbar con búsqueda */}
            <Navbar search={search} setSearch={setSearch} />

            <div className="w-full max-[1187px]:px-4 max-w-[1187px] mx-auto md:py-8 py-5 flex-grow">
                {/* Encabezado del Catálogo */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#37b9c7] via-[#33aab8] to-[#2b99a6] p-6 md:p-8 mb-6 shadow-[0_12px_30px_-12px_rgba(43,170,176,0.45)] border border-white/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="pointer-events-none absolute -right-12 -top-12 w-48 h-48 rounded-full bg-white/15" />
                    <div className="pointer-events-none absolute right-24 -bottom-16 w-40 h-40 rounded-full bg-[#FFF6B8]/20" />
                    <div className="relative">
                        <div className="text-white/85 text-xs font-bold uppercase tracking-widest flex items-center gap-1.5 mb-1.5 flex-wrap">
                            <span className="hover:text-[#FFF000] cursor-pointer transition-colors" onClick={handleClearFilters}>
                                Upa Lelé
                            </span>
                            <span>/</span>
                            <span>Catálogo</span>
                            {selectedCatName && (
                                <>
                                    <span>/</span>
                                    <span className="text-[#FFF000]">{selectedCatName}</span>
                                </>
                            )}
                            {search.trim() && (
                                <>
                                    <span>/</span>
                                    <span className="text-[#FFF000]">"{search.trim()}"</span>
                                </>
                            )}
                        </div>

                    </div>

                    <div className="relative flex items-center gap-3">
                        <span className="bg-white/20 backdrop-blur-sm border border-white/30 text-white text-xs font-bold px-3.5 py-1.5 rounded-full">
                            {filteredProducts.length} {filteredProducts.length === 1 ? "producto" : "productos"}
                        </span>

                        {/* Botón Filtros (solo visible en mobile) */}
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="md:hidden flex items-center gap-2 bg-[#FFF6B8] hover:bg-white shadow-sm px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider text-[#1A2D2A] transition-all cursor-pointer"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-[#2b99a6]">
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
                            sortBy={sortBy}
                            onSortChange={setSortBy}
                        />
                    </div>

                    {/* PRODUCTOS */}
                    <div className="w-full flex-1 flex flex-col gap-6 min-w-0">
                        {isLoading ? (
                            <div className="bg-white rounded-3xl shadow-sm border border-[#D5F3F4] p-16 flex-1 flex flex-col items-center justify-center gap-3">
                                <div className="animate-spin h-10 w-10 text-[#33aab8] rounded-full border-4 border-t-transparent border-[#33aab8]" />
                                <p className="text-sm font-bold text-[#2b99a6]">Cargando productos...</p>
                            </div>
                        ) : filteredProducts.length === 0 ? (
                            <div className="bg-gradient-to-br from-[#FFF9CE]/60 to-[#FFF29C]/40 rounded-3xl shadow-sm border border-amber-200/60 p-10 flex-1 flex flex-col items-center justify-center text-center gap-3">
                                <div className="bg-white p-4 rounded-2xl shadow-sm ring-4 ring-white/60">
                                    <PackageSearch className="w-8 h-8 text-[#2b99a6]" />
                                </div>
                                <p className="text-[#2b99a6] font-bold md:text-xl text-base">
                                    No encontramos productos con esa búsqueda
                                </p>
                                <p className="text-[#3d635f] text-sm max-w-sm">
                                    Probá limpiando los filtros o buscando otra categoría.
                                </p>
                                <button
                                    onClick={handleClearFilters}
                                    className="mt-2 bg-[#33aab8] hover:bg-[#2b99a6] text-white font-bold text-xs uppercase tracking-wider px-6 py-2.5 rounded-full shadow-sm transition-all cursor-pointer"
                                >
                                    Ver todo el catálogo
                                </button>
                            </div>
                        ) : (
                            <>
                                {/* Contenedor de Productos */}
                                <div className="w-full h-fit">
                                    {/* GRID */}
                                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-5">
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
