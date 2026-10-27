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

    const [selectedSubCategory, setSelectedSubCategory] = useState<number | null>(null);
    const [selectedBrand, setSelectedBrand] = useState<number | null>(null);
    const [selectedCatName, setSelectedCatName] = useState<string | null>(null);
    const [selectedSubCatName, setSelectedSubCatName] = useState<string | null>(null);
    const [selectedBrandName, setSelectedBrandName] = useState<string | null>(null);

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
                    ${p.subCategory?.name || ''}
                    ${p.subCategory?.category?.name || ''}
                `.toLowerCase();

            return searchTerms.every((term) => searchableText.includes(term));
          });
        }

        if (selectedSubCategory !== null) {
            filtered = filtered.filter((p) => Number(p.subCategoryId) === selectedSubCategory);
        }

        if (selectedBrand !== null) {
            filtered = filtered.filter((p) => Number(p.brandId) === selectedBrand);
        }

        return filtered;
    }, [search, selectedSubCategory, selectedBrand, catProducts]);

    // ---------------- HANDLERS DE FILTROS ----------------
    const handleSelectSubCategory = (subId: number, subName: string, catName: string) => {
        setSelectedSubCategory(subId);
        setSelectedSubCatName(subName);
        setSelectedCatName(catName);
    };

    const handleSelectBrand = (brandId: number, brandName: string) => {
        setSelectedBrand(brandId);
        setSelectedBrandName(brandName);
    };

    const handleClearFilters = () => {
        setSelectedSubCategory(null);
        setSelectedSubCatName(null);
        setSelectedCatName(null);
        setSelectedBrand(null);
        setSelectedBrandName(null);
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
    }, [search, selectedSubCategory, selectedBrand]);

    // ---------------- UI ----------------
    return (
        <div className="flex flex-col min-h-screen w-full bg-[#F8F8F8] font-domine">
            {/* Navbar con búsqueda */}
            <Navbar search={search} setSearch={setSearch} />

            <div className="w-full max-[1187px]:px-4 max-w-[1187px] mx-auto md:py-6 py-5 flex-grow">
                <div className="flex justify-between items-center mb-6">
                    <div className="text-[#9E9494] md:text-sm text-[12px] flex items-center gap-1.5 flex-wrap">
                        <span className="hover:text-gray-600 cursor-pointer transition-colors" onClick={handleClearFilters}>ElementAll</span>
                        {(selectedCatName || selectedBrandName) && <span>/</span>}
                        {selectedCatName && (
                            <>
                                <span className="cursor-default">{selectedCatName}</span>
                                <span>/</span>
                                <span className="cursor-default font-semibold text-gray-500">{selectedSubCatName}</span>
                            </>
                        )}
                        {selectedCatName && selectedBrandName && <span>/</span>}
                        {selectedBrandName && (
                            <span className="cursor-default font-semibold text-gray-500">{selectedBrandName}</span>
                        )}
                    </div>

                    <button 
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center gap-2 border border-gray-200 bg-white shadow-sm px-4 py-2 rounded-xl text-sm font-bold text-[#1A2D2A] hover:border-[#EDC062] hover:bg-gray-50 transition-all cursor-pointer"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" />
                        </svg>
                        <span>Filtros</span>
                    </button>
                </div>

                <div className="flex flex-col gap-6 relative">
                    {/* FILTROS DESPLEGABLES */}
                    {showFilters && (
                        <div className="w-full md:absolute md:right-0 md:top-0 md:z-30 md:w-80 md:-mt-4 origin-top-right">
                            <CategorySidebar
                                onSelectSubCategory={handleSelectSubCategory}
                                onSelectBrand={handleSelectBrand}
                                onClearFilters={handleClearFilters}
                                selectedSubCategory={selectedSubCategory}
                                selectedBrand={selectedBrand}
                            />
                        </div>
                    )}
                    
                    {/* PRODUCTOS */}
                    <div className="w-full flex-1 flex flex-col gap-6">
                        {isLoading ? (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 flex-1 flex items-center justify-center">
                                <div className="animate-spin h-8 w-8 text-[#EDC062] rounded-full border-4 border-t-transparent border-[#FAD390]" />
                            </div>
                        ) : filteredProducts.length === 0 ? (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex-1 flex items-center justify-center">
                                <p className="text-gray-500 md:text-lg text-sm text-center">
                                    No hay productos que coincidan con la selección
                                </p>
                            </div>
                        ) : (
                            <>
                                {/* Contenedor Transparente para los Productos para un look más Premium/Minimalista */}
                                <div className="w-full h-fit">
                                    {/* GRID - FULL WIDTH */}
                                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
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
