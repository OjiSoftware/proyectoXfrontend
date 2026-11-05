import { useEffect, useState, useMemo } from "react";
import DashboardLayout from "@/layouts/DashboardLayout";
import Pagination from "@/components/PaginationManagement";
import SearchBar from "@/components/SearchBar";
import { ConfirmDeleteModal } from "@/components/ConfirmDeleteModal";
import { CategoriesTable } from "@/components/CategoriesTable";
import { Category } from "@/types/category.types";
import { useItemsPerpage } from "@/hooks/useItemsPerpage";
import { useDeleteCategory } from "@/hooks/useDeleteCategory";
import { categoryApi } from "@/services/CategoryService";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/constants/routes";
import { PlusIcon } from "lucide-react";

export default function CategoriesPage() {
    const [currentPage, setCurrentPage] = useState(1);
    const [query, setQuery] = useState("");
    const [categories, setCategories] = useState<Category[]>([]);
    const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

    // ---------------- Estados de Ordenamiento ----------------
    const [sortColumn, setSortColumn] = useState<string | null>(null);
    const [sortDirection, setSortDirection] = useState<"asc" | "desc" | null>(
        null,
    );

    const navigate = useNavigate();
    const itemsPerPage = useItemsPerpage();
    const { deleteCategory, loading } = useDeleteCategory(setCategories);

    // ---------------- Filtrado y Ordenamiento Combinados ----------------
    const filteredCategories = useMemo(() => {
        const searchTerm = query.trim().toLowerCase();

        // 1. Filtrar
        const filtered = categories.filter((b) => {
            const matchesQuery = b.name.toLowerCase().includes(searchTerm);
            return matchesQuery;
        });

        // 2. Inyectar originalIndex
        const categoriesWithIndex = filtered.map((category, index) => ({
            ...category,
            originalIndex: index + 1,
        }));

        if (!sortColumn || !sortDirection) {
            return categoriesWithIndex;
        }

        // 3. Ordenar
        return [...categoriesWithIndex].sort((a, b) => {
            let aVal: any;
            let bVal: any;

            if (sortColumn === "rowNum") {
                aVal = (a as any).originalIndex;
                bVal = (b as any).originalIndex;
            } else {
                aVal = a[sortColumn as keyof Category] ?? "";
                bVal = b[sortColumn as keyof Category] ?? "";
            }

            if (
                sortColumn === "rowNum" ||
                sortColumn === "id" ||
                typeof aVal === "number"
            ) {
                return sortDirection === "asc"
                    ? Number(aVal) - Number(bVal)
                    : Number(bVal) - Number(aVal);
            }

            return sortDirection === "asc"
                ? String(aVal).localeCompare(String(bVal))
                : String(bVal).localeCompare(String(aVal));
        });
    }, [categories, query, sortColumn, sortDirection]);

    // ---------------- Paginación ----------------
    const lastIndex = currentPage * itemsPerPage;
    const firstIndex = lastIndex - itemsPerPage;
    const currentCategories = filteredCategories.slice(firstIndex, lastIndex);

    // ---------------- Función Handle Sort ----------------
    const handleSort = (col: string) => {
        if (sortColumn === col) {
            if (sortDirection === "asc") setSortDirection("desc");
            else {
                setSortColumn(null);
                setSortDirection(null);
            }
        } else {
            setSortColumn(col);
            setSortDirection("asc");
        }
    };

    // ---------------- Fetch ----------------
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const data = await categoryApi.getAll();
                setCategories(data);
            } catch (error) {
                console.error("Error cargando categorías", error);
            }
        };
        fetchCategories();
    }, []);

    useEffect(() => setCurrentPage(1), [itemsPerPage, query]);

    return (
        <DashboardLayout
            title="Lista de categorías"
            subtitle="Gestión de categorías del sistema."
            actions={
                <button
                    title="Nueva categoría"
                    onClick={() => navigate(ROUTES.categories.create)}
                    className="group flex items-center justify-center w-11 h-11 rounded-[14px] bg-indigo-600 text-white font-bold transition-all duration-300 cursor-pointer shadow-[0_0_20px_rgba(79,70,229,0.4)] hover:bg-indigo-500 hover:shadow-[0_0_30px_rgba(79,70,229,0.7)] hover:-translate-y-0.5 border border-indigo-400/30 active:scale-95 active:translate-y-0"
                >
                    <PlusIcon size={22} className="drop-shadow-[0_0_8px_rgba(255,255,255,0.5)] group-hover:rotate-90 transition-transform duration-500" />
                </button>
            }
        >
            <div className="space-y-3">
                {/* BUSCADOR */}
                <div className="flex flex-col lg:flex-row lg:items-center gap-3">
                    <div className="flex-1 min-w-[200px]">
                        <SearchBar
                            value={query}
                            onChange={setQuery}
                            placeholder="Buscar por nombre de la categoría..."
                            containerClassName="max-w-full"
                            inputClassName="bg-[#151519] text-white text-sm border-white/10 placeholder:text-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all rounded-xl h-11"
                            iconClassName="text-slate-500 group-focus-within:text-indigo-400"
                        />
                    </div>
                </div>

                <CategoriesTable
                    categories={currentCategories}
                    onDelete={(category) => setCategoryToDelete(category)}
                    currentPage={currentPage}
                    itemsPerPage={itemsPerPage}
                    onSort={handleSort}
                    currentSortColumn={sortColumn}
                    currentSortDirection={sortDirection}
                />

                <Pagination
                    totalItems={filteredCategories.length}
                    itemsPerPage={itemsPerPage}
                    currentPage={currentPage}
                    onPageChange={setCurrentPage}
                />

                {categoryToDelete && (
                    <ConfirmDeleteModal
                        isOpen={true}
                        itemName={categoryToDelete.name}
                        isLoading={loading}
                        onCancel={() => setCategoryToDelete(null)}
                        onConfirm={async () => {
                            await deleteCategory(categoryToDelete.id);

                            if (currentCategories.length === 1 && currentPage > 1) {
                                setCurrentPage((prev) => prev - 1);
                            }

                            setCategoryToDelete(null);
                        }}
                    />
                )}
            </div>
        </DashboardLayout>
    );
}
