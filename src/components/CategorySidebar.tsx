import { useEffect, useState } from 'react';
import { categoryApi } from '@/services/CategoryService';
import { Category } from '@/types/category.types';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/20/solid';
import { Sparkles } from 'lucide-react';

export type SortOption = "default" | "price_asc" | "price_desc" | "name_asc" | "name_desc";

interface SidebarProps {
    onSelectCategory: (id: number, catName: string) => void;
    onClearFilters: () => void;
    selectedCategory?: number | null;
    sortBy: SortOption;
    onSortChange: (sort: SortOption) => void;
}

export function CategorySidebar({ onSelectCategory, onClearFilters, selectedCategory, sortBy, onSortChange }: SidebarProps) {
    const [categories, setCategories] = useState<Category[]>([]);
    const [isMobileExpanded, setIsMobileExpanded] = useState<boolean>(false);

    useEffect(() => {
        const loadCategories = async () => {
            try {
                const categoryData = await categoryApi.getAll();
                setCategories(categoryData);
            } catch (error) {
                console.error("Error cargando el menú de sidebar:", error);
            }
        };
        loadCategories();
    }, []);

    return (
        <aside className="w-full md:w-64 flex-shrink-0">
            {/* Contenedor principal estilo Card con posicionamiento sticky en desktop */}
            <div className="bg-white rounded-3xl shadow-sm border border-[#D5F3F4] p-5 md:p-6 md:sticky md:top-6 max-h-[calc(100vh-3rem)] overflow-y-auto">

                {/* Encabezado Móvil (Sólo visible en pantallas pequeñas) */}
                <div
                    className="md:hidden flex items-center justify-between cursor-pointer"
                    onClick={() => setIsMobileExpanded(!isMobileExpanded)}
                >
                    <h2 className="text-xs text-[#2b99a6] font-bold font-fredoka uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" /> Filtrar Categorías
                    </h2>
                    {isMobileExpanded ? (
                        <ChevronUpIcon className="h-5 w-5 text-[#2b99a6]" />
                    ) : (
                        <ChevronDownIcon className="h-5 w-5 text-[#2b99a6]" />
                    )}
                </div>

                {/* Contenido (oculto en móvil si no está expandido) */}
                <div className={`${isMobileExpanded ? 'block' : 'hidden'} md:block`}>
                    {/* Botón "Ver Todo" integrado dentro de la card */}
                    <button
                        onClick={onClearFilters}
                        className="w-full md:mt-0 mb-6 mt-4 py-2.5 px-4 bg-[#FFF6B8] hover:bg-[#FFF29C] text-[#1A2D2A] text-xs font-bold font-nunito uppercase tracking-wider rounded-full transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-xs border border-amber-200/70 active:scale-95"
                    >
                        Mostrar todo
                    </button>

                    {/* SECCIÓN DE ORDENAMIENTO */}
                    <div className="mb-6">
                        <h2 className="text-xs text-[#2b99a6] font-bold font-fredoka uppercase tracking-wider mb-2.5">
                            Ordenar por
                        </h2>
                        <select
                            value={sortBy}
                            onChange={(e) => onSortChange(e.target.value as SortOption)}
                            aria-label="Ordenar productos"
                            className="w-full border border-[#D5F3F4] bg-[#F4FBFB] px-3.5 py-2.5 rounded-2xl text-sm font-bold font-nunito text-[#3d635f] focus:outline-none focus:border-[#37b9c7] focus:ring-2 focus:ring-[#37b9c7]/20 cursor-pointer transition-all"
                        >
                            <option value="default">Más recientes</option>
                            <option value="price_asc">Menor precio</option>
                            <option value="price_desc">Mayor precio</option>
                            <option value="name_asc">Nombre: A - Z</option>
                            <option value="name_desc">Nombre: Z - A</option>
                        </select>
                    </div>

                    {/* SECCIÓN DE CATEGORÍAS */}
                    <div>
                        <h2 className="hidden md:block text-xs text-[#2b99a6] font-bold font-fredoka uppercase tracking-wider mb-3">
                            Categorías
                        </h2>

                        <ul className="space-y-1.5">
                            {categories.map((cat) => {
                                const isSelected = selectedCategory === cat.id;
                                return (
                                    <li
                                        key={cat.id}
                                        onClick={() => onSelectCategory(cat.id, cat.name)}
                                        className={`px-3.5 py-2.5 text-sm font-nunito cursor-pointer transition-all duration-200 rounded-2xl flex items-center justify-between ${
                                            isSelected
                                                ? 'text-[#2b99a6] font-extrabold bg-gradient-to-r from-[#E2F8F9] to-[#D5F3F4] shadow-xs border border-[#bce8ea]'
                                                : 'text-[#3d635f] font-semibold hover:text-[#2b99a6] hover:bg-[#F4FBFB]'
                                        }`}
                                    >
                                        <span>{cat.name}</span>
                                        {isSelected && <span className="w-2 h-2 rounded-full bg-[#2b99a6]" />}
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                </div>
            </div>
        </aside>
    );
}
