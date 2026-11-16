import { useEffect, useState, useMemo } from "react";
import DashboardLayout from "@/layouts/DashboardLayout";
import Pagination from "@/components/PaginationManagement";
import SearchBar from "@/components/SearchBar";
import { ConfirmDeleteModal } from "@/components/ConfirmDeleteModal";
import { ProvidersTable } from "@/components/ProvidersTable";
import { Provider } from "@/types/provider.types";
import { useItemsPerpage } from "@/hooks/useItemsPerpage";
import { useDeleteProvider } from "@/hooks/useDeleteProvider";
import { providerApi } from "@/services/ProviderService";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/constants/routes";
import { PlusIcon } from "lucide-react";

export default function ProvidersPage() {
    const [currentPage, setCurrentPage] = useState(1);
    const [query, setQuery] = useState("");
    const [providers, setProviders] = useState<Provider[]>([]);
    const [providerToDelete, setProviderToDelete] = useState<Provider | null>(null);

    // Ordenamiento
    const [sortColumn, setSortColumn] = useState<string | null>(null);
    const [sortDirection, setSortDirection] = useState<"asc" | "desc" | null>(null);

    const navigate = useNavigate();
    const itemsPerPage = useItemsPerpage();
    const { deleteProvider, loading } = useDeleteProvider(setProviders);

    // Filtrado y Ordenamiento
    const filteredProviders = useMemo(() => {
        const searchTerm = query.trim().toLowerCase();

        const filtered = providers.filter((p) => {
            const matchesName = p.name.toLowerCase().includes(searchTerm);
            const matchesContact = p.contact ? p.contact.toLowerCase().includes(searchTerm) : false;
            const matchesEmail = p.email ? p.email.toLowerCase().includes(searchTerm) : false;
            return matchesName || matchesContact || matchesEmail;
        });

        const withIndex = filtered.map((provider, index) => ({
            ...provider,
            originalIndex: index + 1,
        }));

        if (!sortColumn || !sortDirection) {
            return withIndex;
        }

        return [...withIndex].sort((a, b) => {
            let aVal: any;
            let bVal: any;

            if (sortColumn === "rowNum") {
                aVal = a.originalIndex;
                bVal = b.originalIndex;
            } else {
                aVal = (a as any)[sortColumn] ?? "";
                bVal = (b as any)[sortColumn] ?? "";
            }

            if (typeof aVal === "string") {
                const comparison = aVal.localeCompare(bVal);
                return sortDirection === "asc" ? comparison : -comparison;
            }

            return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
        });
    }, [providers, query, sortColumn, sortDirection]);

    const lastIndex = currentPage * itemsPerPage;
    const firstIndex = lastIndex - itemsPerPage;
    const currentProviders = filteredProviders.slice(firstIndex, lastIndex);

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

    useEffect(() => {
        const fetchProviders = async () => {
            try {
                const data = await providerApi.getAll();
                setProviders(data);
            } catch (error) {
                console.error("Error cargando proveedores", error);
            }
        };
        fetchProviders();
    }, []);

    useEffect(() => setCurrentPage(1), [itemsPerPage, query]);

    return (
        <DashboardLayout
            title="Lista de proveedores"
            subtitle="Gestión de proveedores y contactos del sistema."
            actions={
                <button
                    title="Nuevo proveedor"
                    onClick={() => navigate(ROUTES.providers.create)}
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
                            placeholder="Buscar por nombre, contacto o email..."
                            containerClassName="max-w-full"
                            inputClassName="bg-[#151519] text-white text-sm border-white/10 placeholder:text-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all rounded-xl h-11"
                            iconClassName="text-slate-500 group-focus-within:text-indigo-400"
                        />
                    </div>
                </div>

                <ProvidersTable
                    providers={currentProviders}
                    onDelete={(provider) => setProviderToDelete(provider)}
                    currentPage={currentPage}
                    itemsPerPage={itemsPerPage}
                    onSort={handleSort}
                    currentSortColumn={sortColumn}
                    currentSortDirection={sortDirection}
                />

                <Pagination
                    totalItems={filteredProviders.length}
                    itemsPerPage={itemsPerPage}
                    currentPage={currentPage}
                    onPageChange={setCurrentPage}
                />

                {providerToDelete && (
                    <ConfirmDeleteModal
                        isOpen={true}
                        itemName={providerToDelete.name}
                        isLoading={loading}
                        onCancel={() => setProviderToDelete(null)}
                        onConfirm={async () => {
                            await deleteProvider(providerToDelete.id);

                            if (currentProviders.length === 1 && currentPage > 1) {
                                setCurrentPage((prev) => prev - 1);
                            }

                            setProviderToDelete(null);
                        }}
                    />
                )}
            </div>
        </DashboardLayout>
    );
}
