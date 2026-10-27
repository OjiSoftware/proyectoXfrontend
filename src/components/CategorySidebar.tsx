import { useEffect, useState } from 'react';
import { catalogApi } from '@/services/CatalogService';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/20/solid';

interface SidebarProps {
    onSelectSubCategory: (id: number, subName: string, catName: string) => void;
    onSelectBrand: (id: number, brandName: string) => void;
    onClearFilters: () => void;
    selectedSubCategory?: number | null;
    selectedBrand?: number | null;
}
export function CategorySidebar({ onSelectSubCategory, onSelectBrand, onClearFilters, selectedSubCategory, selectedBrand }: SidebarProps) {
    const [categories, setCategories] = useState<any[]>([]);
    const [brands, setBrands] = useState<any[]>([]);

    // State for expanded menus
    const [expandedCategories, setExpandedCategories] = useState<Record<number, boolean>>({});
    const [brandsExpanded, setBrandsExpanded] = useState<boolean>(false);
    const [isMobileExpanded, setIsMobileExpanded] = useState<boolean>(false);

    const toggleCategory = (id: number) => {
        setExpandedCategories(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    useEffect(() => {
        const loadMenu = async () => {
            try {
                const [categoryData, brandData] = await Promise.all([
                    catalogApi.getCategoryTree(),
                    catalogApi.getActivesBrands()
                ]);

                setCategories(categoryData);
                setBrands(brandData)

            } catch (error) {
                console.error("Error cargando el menú de sidebar:", error);
            }
        };
        loadMenu();
    }, []);

    return (
        <aside className="max-lg:w-full lg:w-64 flex-shrink-0">
            {/* Contenedor principal estilo Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6 md:sticky md:top-8">

                {/* Encabezado Móvil (Sólo visible en pantallas pequeñas) */}
                <div
                    className="lg:hidden flex items-center justify-between cursor-pointer "
                    onClick={() => setIsMobileExpanded(!isMobileExpanded)}
                >
                    <h2 className="text-[12px] text-darker font-bold font-lato uppercase tracking-[0.1rem]">
                        Filtrar Categorías
                    </h2>
                    {isMobileExpanded ? (
                        <ChevronUpIcon className="h-5 w-5 text-gray-500" />
                    ) : (
                        <ChevronDownIcon className="h-5 w-5 text-gray-500" />
                    )}
                </div>

                {/* Contenido (oculto en móvil si no está expandido) */}
                <div className={`${isMobileExpanded ? 'block' : 'hidden'} lg:block`}>
                    {/* Botón "Ver Todo" integrado dentro de la card */}
                    <button
                        onClick={onClearFilters}
                        className="w-full lg:mt-0 mb-6 mt-4 py-2 px-4 bg-[#4caf50] hover:bg-[#8bc34a] text-white text-xs subpixel-antialiased font-bold font-lato uppercase tracking-[0.1rem] rounded-lg transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-95"
                    >
                        MOSTRAR TODO
                    </button>

                    {/* SECCIÓN DE CATEGORÍAS */}
                    <div className="mb-8">
                        <h2 className="hidden lg:block text-[13px] text-darker subpixel-antialiased font-bold font-lato uppercase tracking-[0.1rem] mb-4">
                            Categorías
                        </h2>

                        <ul className="space-y-6">
                            {categories.map((cat) => {
                                const isExpanded = expandedCategories[cat.id] ?? false; // Default expanded or collapsed, adjust if needed
                                return (
                                    <li key={cat.id}>
                                        {/* Nombre de Línea (Hogar, Jardín, etc) */}
                                        <div
                                            className="flex items-center justify-between mb-3 cursor-pointer group"
                                            onClick={() => toggleCategory(cat.id)}
                                        >
                                            <h3 className="text-gray-500 font-semibold text-sm font-lato group-hover:text-[#4caf50] transition-colors">
                                                {cat.name}
                                            </h3>
                                            {isExpanded ? (
                                                <ChevronUpIcon className="h-4 w-4 text-gray-400 group-hover:text-[#4caf50]" />
                                            ) : (
                                                <ChevronDownIcon className="h-4 w-4 text-gray-400 group-hover:text-[#4caf50]" />
                                            )}
                                        </div>

                                        {isExpanded && (
                                            <ul className="ml-4 space-y-2 mb-6">
                                                {cat.subCategories?.map((sub: any) => (
                                                    <li
                                                        key={sub.id}
                                                        onClick={() => onSelectSubCategory(sub.id, sub.name, cat.name)}
                                                        className={`text-sm font-lato cursor-pointer transition-all duration-200 ${selectedSubCategory === sub.id ? 'text-[#4caf50] font-bold' : 'text-gray-400 hover:text-[#4caf50]'}`}
                                                    >
                                                        {sub.name}
                                                    </li>
                                                ))}
                                            </ul>
                                        )}

                                        {/* Separador sutil entre líneas de categorías */}
                                        {isExpanded && <hr className="mt-2 border-gray-50" />}
                                    </li>
                                )
                            })}
                        </ul>
                    </div>

                    {/* SECCIÓN DE MARCAS */}
                    <div>
                        <div
                            className="flex items-center justify-between mb-4 cursor-pointer group"
                            onClick={() => setBrandsExpanded(!brandsExpanded)}
                        >
                            <h2 className="text-[13px] text-darker subpixel-antialiased font-bold font-lato uppercase tracking-[0.1rem]">
                                Nuestras Marcas
                            </h2>
                            {brandsExpanded ? (
                                <ChevronUpIcon className="h-5 w-5 text-gray-400 group-hover:text-[#4caf50]" />
                            ) : (
                                <ChevronDownIcon className="h-5 w-5 text-gray-400 group-hover:text-[#4caf50]" />
                            )}
                        </div>
                        {brandsExpanded && (
                            <ul className="space-y-1">
                                {brands.map((brand) => (
                                    <li
                                        key={brand.id}
                                        onClick={() => onSelectBrand(brand.id, brand.name)}
                                        className={`px-2 py-0.5 text-sm font-lato cursor-pointer transition-colors ${selectedBrand === brand.id ? 'text-[#4caf50] font-bold' : 'text-gray-400 hover:text-[#4caf50]'}`}
                                    >
                                        • {brand.name}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div> {/* Cierra el div condicional para móvil */}
            </div>
        </aside>
    );
}
