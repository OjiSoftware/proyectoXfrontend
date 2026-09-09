import { useEffect, useState, useMemo } from "react";
import DashboardLayout from "@/layouts/DashboardLayout";
import Pagination from "@/components/PaginationManagement";
import SearchBar from "@/components/SearchBar";
import { ConfirmDeleteModal } from "@/components/ConfirmDeleteModal";
import { SubCategoriesTable } from "@/components/SubCategoriesTable";
import { SubCategory } from "@/types/subcategory.types";
import { useItemsPerpage } from "@/hooks/useItemsPerpage";
import { useDeleteSubCategory } from "@/hooks/useDeleteSubCategory";
import { subCategoryApi } from "@/services/SubCategoryService";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/constants/routes";
import { PlusIcon } from "lucide-react";

export default function SubCategoriesPage() {
    const [currentPage, setCurrentPage] = useState(1);
    const [query, setQuery] = useState("");
    const [subcategories, setSubCategories] = useState<SubCategory[]>([]);
    const [subCategoryToDelete, setSubCategoryToDelete] = useState<SubCategory | null>(null);

    // ---------------- Estados de Ordenamiento ----------------
    const [sortColumn, setSortColumn] = useState<string | null>(null);
    const [sortDirection, setSortDirection] = useState<"asc" | "desc" | null>(
        null,
    );

    const navigate = useNavigate();
    const itemsPerPage = useItemsPerpage();
    const { deleteSubCategory, loading } = useDeleteSubCategory(setSubCategories);



    // ---------------- Filtrado y Ordenamiento Combinados ----------------
    const filteredSubCategories = useMemo(() => {
        const searchTerm = query.trim().toLowerCase();

        // 1. Filtrar
        const filtered = subcategories.filter((b) => {
            const matchesQuery = b.name.toLowerCase().includes(searchTerm);
            return matchesQuery;
        });

        // 2. Inyectar originalIndex
        const subcategoriesWithIndex = filtered.map((subCategory, index) => ({
            ...subCategory,
            originalIndex: index + 1,
        }));

        if (!sortColumn || !sortDirection) {
            return subcategoriesWithIndex;
        }

        // 3. Ordenar
        return [...subcategoriesWithIndex].sort((a, b) => {
            let aVal: any;
            let bVal: any;

            if (sortColumn === "rowNum") {
                aVal = (a as any).originalIndex;
                bVal = (b as any).originalIndex;
            } else {
                aVal = a[sortColumn as keyof SubCategory] ?? "";
                bVal = b[sortColumn as keyof SubCategory] ?? "";
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
    }, [subcategories, query, sortColumn, sortDirection]);

    // ---------------- Paginaci�n ----------------
    const lastIndex = currentPage * itemsPerPage;
    const firstIndex = lastIndex - itemsPerPage;
    const currentSubCategories = filteredSubCategories.slice(firstIndex, lastIndex);

    // ---------------- Funci�n Handle Sort ----------------
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
        const fetchSubCategories = async () => {
            try {
                const data = await subCategoryApi.getAll();
                setSubCategories(data);
            } catch (error) {
                console.error("Error cargando subcategorías", error);
            }
        };
        fetchSubCategories();
    }, []);

    useEffect(() => setCurrentPage(1), [itemsPerPage, query]);

    return (
        <DashboardLayout
            title="Lista de subcategorías"
            subtitle="Gesti�n de subcategorías del sistema."
            actions={
                <button
                    onClick={() => navigate(ROUTES.subcategories.create)}
                    className="flex items-center gap-2 px-4 py-2 text-xs rounded-lg bg-accent-500 text-[#00001A] font-extrabold transition-all duration-300 cursor-pointer shadow-[0_0_15px_rgba(0,240,255,0.4)] hover:bg-accent-400 hover:shadow-[0_0_20px_rgba(0,240,255,0.6)] active:scale-95"
                >
                    <PlusIcon size={18} />
                    <span className="hidden md:inline">Nueva subcategoría</span>
                </button>
            }
        >
            <div className="space-y-6">


                {/* CONTENEDOR BUSCADOR TIPO GLASS */}
                <div className="bg-gray-800/30 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-xl">
                    <SearchBar
                        value={query}
                        onChange={setQuery}
                        placeholder="Buscar por nombre de la subcategoría..."
                        containerClassName="max-w-full"
                        inputClassName="bg-gray-900/50 text-white border-white/10 placeholder:text-slate-500 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all rounded-xl h-11"
                        iconClassName="text-slate-500 group-focus-within:text-pink-400"
                    />
                </div>

                <SubCategoriesTable
                    subcategories={currentSubCategories}
                    onDelete={(subCategory) => setSubCategoryToDelete(subCategory)}
                    currentPage={currentPage}
                    itemsPerPage={itemsPerPage}
                    onSort={handleSort}
                    currentSortColumn={sortColumn}
                    currentSortDirection={sortDirection}
                />

                <Pagination
                    totalItems={filteredSubCategories.length}
                    itemsPerPage={itemsPerPage}
                    currentPage={currentPage}
                    onPageChange={setCurrentPage}
                />

                {subCategoryToDelete && (
                    <ConfirmDeleteModal
                        isOpen={true}
                        itemName={subCategoryToDelete.name}
                        isLoading={loading}
                        onCancel={() => setSubCategoryToDelete(null)}
                        onConfirm={async () => {
                            await deleteSubCategory(subCategoryToDelete.id);

                            // Ajustamos p�gina si la �ltima subcategoría desaparece de la vista
                            if (currentSubCategories.length === 1 && currentPage > 1) {
                                setCurrentPage((prev) => prev - 1);
                            }

                            setSubCategoryToDelete(null);
                        }}
                    />
                )}
            </div>
        </DashboardLayout>
    );
}


