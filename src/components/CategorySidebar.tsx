import { useEffect, useState } from 'react';
import { categoryApi } from '@/services/CategoryService';
import { Category } from '@/types/category.types';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/20/solid';

interface SidebarProps {
    onSelectCategory: (id: number, catName: string) => void;
    onClearFilters: () => void;
    selectedCategory?: number | null;
}

export function CategorySidebar({ onSelectCategory, onClearFilters, selectedCategory }: SidebarProps) {
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
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6 md:sticky md:top-6 max-h-[calc(100vh-3rem)] overflow-y-auto">

                {/* Encabezado Móvil (Sólo visible en pantallas pequeñas) */}
                <div
                    className="md:hidden flex items-center justify-between cursor-pointer"
                    onClick={() => setIsMobileExpanded(!isMobileExpanded)}
                >
                    <h2 className="text-xs text-[#1A2D2A] font-bold font-fredoka uppercase tracking-wider">
                        Filtrar Categorías
                    </h2>
                    {isMobileExpanded ? (
                        <ChevronUpIcon className="h-5 w-5 text-gray-500" />
                    ) : (
                        <ChevronDownIcon className="h-5 w-5 text-gray-500" />
                    )}
                </div>

                {/* Contenido (oculto en móvil si no está expandido) */}
                <div className={`${isMobileExpanded ? 'block' : 'hidden'} md:block`}>
                    {/* Botón "Ver Todo" integrado dentro de la card */}
                    <button
                        onClick={onClearFilters}
                        className="w-full md:mt-0 mb-6 mt-4 py-2 px-4 bg-[#37b9c7] hover:bg-[#2BAAB0] text-white text-xs font-bold font-nunito uppercase tracking-wider rounded-xl transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-95"
                    >
                        MOSTRAR TODO
                    </button>

                    {/* SECCIÓN DE CATEGORÍAS */}
                    <div>
                        <h2 className="hidden md:block text-xs text-[#1A2D2A] font-bold font-fredoka uppercase tracking-wider mb-4">
                            Categorías
                        </h2>

                        <ul className="space-y-1.5">
                            {categories.map((cat) => {
                                const isSelected = selectedCategory === cat.id;
                                return (
                                    <li
                                        key={cat.id}
                                        onClick={() => onSelectCategory(cat.id, cat.name)}
                                        className={`px-3 py-2 text-sm font-nunito cursor-pointer transition-all duration-200 rounded-xl ${
                                            isSelected
                                                ? 'text-[#37b9c7] font-bold bg-[#D5F3F4]/40'
                                                : 'text-gray-600 hover:text-[#37b9c7] hover:bg-gray-50'
                                        }`}
                                    >
                                        {cat.name}
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                </div> {/* Cierra el div condicional para móvil */}
            </div>
        </aside>
    );
}
