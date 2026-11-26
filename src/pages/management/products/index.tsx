import { useEffect, useState, useMemo, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CheckCircle2, X, PlusIcon, AlertTriangle, PackageX, EyeOff, ChevronDown, SlidersHorizontal, Tag } from "lucide-react";
import { ExportDropdown } from "@/components/ExportDropdown";
import DashboardLayout from "@/layouts/DashboardLayout";
import { ProductsTable } from "@/components/ProductsTable";
import Pagination from "@/components/PaginationManagement";
import { Product } from "@/types/product.types";
import { useItemsPerpage } from "@/hooks/useItemsPerpage";
import SearchBar from "../../../components/SearchBar";
import { ConfirmDeleteModal } from "../../../components/ConfirmDeleteModal";
import { useDisableProduct } from "@/hooks/useDisableProduct";
import { productApi } from "@/services/ProductService";
import { ROUTES } from "@/constants/routes";
import toast from "react-hot-toast";
import { buildProductExportSheet } from "@/helpers/productExport";

export default function ProductsPage() {
    const location = useLocation();
    const navigate = useNavigate();

    // ---------------- Estados ----------------
    const [currentPage, setCurrentPage] = useState(1);
    const [query, setQuery] = useState("");
    const [products, setProducts] = useState<Product[]>([]);
    const [productToDelete, setProductToDelete] = useState<Product | null>(null);

    // ---------------- Filtros ----------------
    const [filterStock, setFilterStock] = useState<'all' | 'low' | 'out' | 'ok'>('all');
    const [filterVisibility, setFilterVisibility] = useState<'all' | 'visible' | 'hidden'>('all');
    const [filterBrand, setFilterBrand] = useState<string>('all');
    const [filterCategory, setFilterCategory] = useState<string>('all');
    const [filterProvider, setFilterProvider] = useState<string>('all');
    const [filterSubCategory, setFilterSubCategory] = useState<string>('all');

    // ---------------- Columnas visibles ----------------
    const ALL_PRODUCT_COLS = new Set(['barcode', 'category', 'provider', 'stock', 'price', 'catalog']);
    const [visibleColumns, setVisibleColumns] = useState<Set<string>>(new Set(ALL_PRODUCT_COLS));

    const toggleColumn = (col: string) => {
        setVisibleColumns(prev => {
            const next = new Set(prev);
            if (next.has(col)) { next.delete(col); } else { next.add(col); }
            return next;
        });
    };

    // ---------------- Dropdown refs ----------------
    const [categoryOpen, setCategoryOpen] = useState(false);
    const [filterOpen, setFilterOpen] = useState(false);
    const [paramsOpen, setParamsOpen] = useState(false);
    const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
    const categoryRef = useRef<HTMLDivElement>(null);
    const filterRef = useRef<HTMLDivElement>(null);
    const paramsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (categoryRef.current && !categoryRef.current.contains(e.target as Node)) setCategoryOpen(false);
            if (filterRef.current && !filterRef.current.contains(e.target as Node)) setFilterOpen(false);
            if (paramsRef.current && !paramsRef.current.contains(e.target as Node)) setParamsOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // ---------------- Estados de Ordenamiento ----------------
    const [sortColumn, setSortColumn] = useState<string | null>(null);
    const [sortDirection, setSortDirection] = useState<"asc" | "desc" | null>(
        null,
    );

    // ---------------- Estados del Toast ----------------
    const [showWelcome, setShowWelcome] = useState(false);
    const [userName, setUserName] = useState("");

    const itemsPerPage = useItemsPerpage();
    const { disableProduct, loading } = useDisableProduct(setProducts);

    // --- ALERTAS ESPECÍFICAS SOLICITADAS ---
    const lowStockProducts = useMemo(() => products.filter(p => (p.stock ?? 0) > 0 && (p.stock ?? 0) <= 5), [products]);
    const outOfStockProducts = useMemo(() => products.filter(p => !p.stock || p.stock <= 0), [products]);
    const hiddenProducts = useMemo(() => products.filter(p => !p.showingInCatalog), [products]);
    const lowStockCount = lowStockProducts.length;
    const outOfStockCount = outOfStockProducts.length;
    const hiddenProductsCount = hiddenProducts.length;

    // --- ESTADO DROPDOWNS ---
    const [openDropdown, setOpenDropdown] = useState<'lowStock' | 'outOfStock' | 'hidden' | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setOpenDropdown(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // ---------------- Lógica de Filtrado y Ordenamiento ----------------
    const filteredProducts = useMemo(() => {
        const searchTerm = query.trim().toLowerCase();

        // 1. Filtrar
        const filtered = products.filter((p) => {
            if (!p.status) return false;
            const matchesQuery =
                p.name.toLowerCase().includes(searchTerm) ||
                (p.barcode && p.barcode.toLowerCase().includes(searchTerm));
            if (!matchesQuery) return false;

            // Filtro de stock
            const stock = p.stock ?? 0;
            if (filterStock === 'low' && !(stock > 0 && stock <= 5)) return false;
            if (filterStock === 'out' && stock > 0) return false;
            if (filterStock === 'ok' && stock <= 5) return false;

            // Filtro de visibilidad
            if (filterVisibility === 'visible' && !p.showingInCatalog) return false;
            if (filterVisibility === 'hidden' && p.showingInCatalog) return false;

            // Filtro de categoría
            if (filterCategory !== 'all' && (p.category?.name ?? '') !== filterCategory) return false;

            // Filtro de proveedor
            if (filterProvider !== 'all') {
                const pName = p.provider?.businessName || p.provider?.name || '';
                if (pName !== filterProvider) return false;
            }

            return true;
        });

        // 2. Asignar posición original (para que el número de fila "viaje" con el objeto)
        const productsWithIndex = filtered.map((product, index) => ({
            ...product,
            originalIndex: index + 1,
        }));

        // Si no hay ordenamiento activo, devolvemos la lista con los índices
        if (!sortColumn || !sortDirection) {
            return productsWithIndex;
        }

        // 3. Ordenar
        return [...productsWithIndex].sort((a, b) => {
            let aVal: any;
            let bVal: any;

            if (sortColumn === "rowNum") {
                aVal = (a as any).originalIndex;
                bVal = (b as any).originalIndex;
            } else if (sortColumn === "brand.name") {
                aVal = a.brand?.name || "";
                bVal = b.brand?.name || "";
            } else if (sortColumn === "category.name") {
                aVal = a.category?.name || "";
                bVal = b.category?.name || "";
            } else if (sortColumn === "provider.businessName") {
                aVal = a.provider?.businessName || a.provider?.name || "";
                bVal = b.provider?.businessName || b.provider?.name || "";
            } else {
                aVal = a[sortColumn as keyof Product] ?? "";
                bVal = b[sortColumn as keyof Product] ?? "";
            }

            // Comparación Numérica
            if (
                sortColumn === "rowNum" ||
                sortColumn === "id" ||
                sortColumn === "stock" ||
                sortColumn === "price" ||
                typeof aVal === "number"
            ) {
                return sortDirection === "asc"
                    ? Number(aVal) - Number(bVal)
                    : Number(bVal) - Number(aVal);
            }

            // Comparación de Strings (o booleanos convertidos a string)
            return sortDirection === "asc"
                ? String(aVal).localeCompare(String(bVal))
                : String(bVal).localeCompare(String(aVal));
        });
    }, [products, query, sortColumn, sortDirection, filterStock, filterVisibility, filterBrand, filterCategory, filterProvider, filterSubCategory]);

    // ---------------- Manejo Datos Excel ----------------

    const handleExportProducts = async () => {
        try {
            const sheet = buildProductExportSheet(filteredProducts);
            const { exportExcel } = await import("@/helpers/excelExport");

            exportExcel({
                fileName: "productos.xlsx",
                sheets: [sheet],
            });

            toast.success("Productos exportados a planilla Excel.");
        } catch (error) {
            console.error("Error al exportar productos:", error);
            toast.error("No se pudieron exportar los productos.");
        }
    };


    // ---------------- Paginación ----------------
    const lastIndex = currentPage * itemsPerPage;
    const firstIndex = lastIndex - itemsPerPage;
    const currentProducts = filteredProducts.slice(firstIndex, lastIndex);

    // ---------------- Funciones ----------------
    const handleSort = (col: string) => {
        if (sortColumn === col) {
            if (sortDirection === "asc") {
                setSortDirection("desc");
            } else if (sortDirection === "desc") {
                setSortColumn(null);
                setSortDirection(null);
            }
        } else {
            setSortColumn(col);
            setSortDirection("asc");
        }
    };

    // ---------------- Efectos ----------------
    useEffect(() => {
        if (location.state?.welcome) {
            setUserName(location.state.userName || "Usuario");
            setShowWelcome(true);
            window.history.replaceState({}, document.title);
            const timer = setTimeout(() => setShowWelcome(false), 4000);
            return () => clearTimeout(timer);
        }
    }, [location]);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const data = await productApi.getAllProducts();
                setProducts(data);
            } catch (error) {
                console.error("Error cargando productos", error);
            }
        };
        fetchProducts();
    }, []);

    useEffect(() => setCurrentPage(1), [itemsPerPage, query, filterStock, filterVisibility, filterBrand, filterCategory, filterProvider, filterSubCategory]);

    // Valores únicos derivados de los datos reales
    const uniqueBrands = useMemo(() =>
        [...new Set(products.map(p => p.brand?.name).filter(Boolean) as string[])].sort(), [products]);
    const uniqueCategories = useMemo(() =>
        [...new Set(products.map(p => p.category?.name).filter(Boolean) as string[])].sort(), [products]);
    const uniqueProviders = useMemo(() =>
        [...new Set(products.map(p => p.provider?.businessName || p.provider?.name).filter(Boolean) as string[])].sort(), [products]);

    const resetFilters = () => {
        setQuery('');
        setFilterStock('all');
        setFilterVisibility('all');
        setFilterBrand('all');
        setFilterCategory('all');
        setFilterProvider('all');
        setFilterSubCategory('all');
    };

    const otherFiltersCount = [
        filterStock !== 'all',
        filterVisibility !== 'all',
        filterBrand !== 'all',
        filterProvider !== 'all',
        filterSubCategory !== 'all',
    ].filter(Boolean).length;

    const activeFiltersCount = otherFiltersCount + (filterCategory !== 'all' ? 1 : 0);

    const hasActiveFilters = query !== '' || activeFiltersCount > 0;


    return (
        <>
            {/* TOAST DE BIENVENIDA */}
            <div
                className={`fixed bottom-6 right-6 z-[100] transition-all duration-500 transform ${showWelcome
                    ? "translate-x-0 opacity-100"
                    : "translate-x-[120%] opacity-0"
                    }`}
            >
                <div className="mgmt-modal backdrop-blur-md shadow-2xl rounded-xl p-4 flex items-start gap-3 min-w-[300px]">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                        <h3 className="text-xs font-semibold font-poppins text-[var(--text-primary)]">
                            ¡Hola, {userName}!
                        </h3>
                        <p className="text-xs text-[var(--text-muted)] mt-1">
                            Sesión iniciada correctamente.
                        </p>
                    </div>
                    <button
                        onClick={() => setShowWelcome(false)}
                        className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            </div>

            <DashboardLayout
                title="Lista de productos"
                subtitle="Gestión de productos del sistema."
                headerWidgets={
                    <div ref={dropdownRef} className="flex items-center gap-2">

                        {/* ALERTA: CASI SIN STOCK */}
                        <div className="relative">
                            <button
                                onClick={() => setOpenDropdown(openDropdown === 'lowStock' ? null : 'lowStock')}
                                className={`relative flex items-center justify-center w-9 h-9 rounded-xl border transition-all duration-200 cursor-pointer ${openDropdown === 'lowStock'
                                    ? 'bg-amber-500/20 border-amber-500/50 shadow-[0_0_12px_rgba(251,191,36,0.25)]'
                                    : 'bg-amber-500/10 border-amber-500/25 hover:bg-amber-500/20 hover:border-amber-500/40'
                                    }`}
                                title="Casi sin stock"
                            >
                                <AlertTriangle className="w-4 h-4 text-amber-500" />
                                {lowStockCount > 0 && (
                                    <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-0.5 bg-amber-400 text-gray-900 text-[9px] font-black rounded-full flex items-center justify-center leading-none">
                                        {lowStockCount}
                                    </span>
                                )}
                            </button>
                            {openDropdown === 'lowStock' && (
                                <div className="absolute right-0 top-full mt-2 w-64 mgmt-modal backdrop-blur-xl rounded-2xl shadow-2xl z-50 overflow-hidden">
                                    <div className="px-4 py-3 border-b border-[var(--border-subtle)] bg-amber-500/10">
                                        <div className="flex items-center gap-2">
                                            <AlertTriangle className="w-4 h-4 text-amber-500" />
                                            <p className="text-xs font-bold text-amber-500 uppercase tracking-wider">Casi sin stock</p>
                                        </div>
                                        <p className="text-2xl font-black text-amber-500 mt-1">{lowStockCount} <span className="text-xs font-normal text-[var(--text-muted)]">productos</span></p>
                                    </div>
                                    <div className="max-h-52 overflow-y-auto py-1">
                                        {lowStockProducts.length === 0 ? (
                                            <p className="text-xs text-[var(--text-muted)] px-4 py-3 text-center">Sin alertas activas</p>
                                        ) : lowStockProducts.map(p => (
                                            <div key={p.id} className="flex items-center justify-between px-4 py-2 hover:bg-[var(--bg-elevated)] transition-colors">
                                                <span className="text-xs text-[var(--text-primary)] truncate flex-1 mr-2">{p.name}</span>
                                                <span className="text-xs font-bold text-amber-500 shrink-0">{p.stock} uds.</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* ALERTA: SIN STOCK */}
                        <div className="relative">
                            <button
                                onClick={() => setOpenDropdown(openDropdown === 'outOfStock' ? null : 'outOfStock')}
                                className={`relative flex items-center justify-center w-9 h-9 rounded-xl border transition-all duration-200 cursor-pointer ${openDropdown === 'outOfStock'
                                    ? 'bg-rose-500/20 border-rose-500/50 shadow-[0_0_12px_rgba(244,63,94,0.25)]'
                                    : 'bg-rose-500/10 border-rose-500/25 hover:bg-rose-500/20 hover:border-rose-500/40'
                                    }`}
                                title="Sin stock"
                            >
                                <PackageX className="w-4 h-4 text-rose-500" />
                                {outOfStockCount > 0 && (
                                    <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-0.5 bg-rose-500 text-white text-[9px] font-black rounded-full flex items-center justify-center leading-none">
                                        {outOfStockCount}
                                    </span>
                                )}
                            </button>
                            {openDropdown === 'outOfStock' && (
                                <div className="absolute right-0 top-full mt-2 w-64 mgmt-modal backdrop-blur-xl rounded-2xl shadow-2xl z-50 overflow-hidden">
                                    <div className="px-4 py-3 border-b border-[var(--border-subtle)] bg-rose-500/10">
                                        <div className="flex items-center gap-2">
                                            <PackageX className="w-4 h-4 text-rose-500" />
                                            <p className="text-xs font-bold text-rose-500 uppercase tracking-wider">Sin stock</p>
                                        </div>
                                        <p className="text-2xl font-black text-rose-500 mt-1">{outOfStockCount} <span className="text-xs font-normal text-[var(--text-muted)]">productos</span></p>
                                    </div>
                                    <div className="max-h-52 overflow-y-auto py-1">
                                        {outOfStockProducts.length === 0 ? (
                                            <p className="text-xs text-[var(--text-muted)] px-4 py-3 text-center">Sin alertas activas</p>
                                        ) : outOfStockProducts.map(p => (
                                            <div key={p.id} className="flex items-center justify-between px-4 py-2 hover:bg-[var(--bg-elevated)] transition-colors">
                                                <span className="text-xs text-[var(--text-primary)] truncate flex-1 mr-2">{p.name}</span>
                                                <span className="text-xs font-bold text-rose-500 shrink-0">0 uds.</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* ALERTA: OCULTOS */}
                        <div className="relative">
                            <button
                                onClick={() => setOpenDropdown(openDropdown === 'hidden' ? null : 'hidden')}
                                className={`relative flex items-center justify-center w-9 h-9 rounded-xl border transition-all duration-200 cursor-pointer ${openDropdown === 'hidden'
                                    ? 'bg-indigo-500/15 border-indigo-500/40 shadow-[0_0_12px_rgba(99,102,241,0.2)]'
                                    : 'bg-[var(--bg-elevated)] border-[var(--border-subtle)] hover:border-[var(--border-strong)]'
                                    }`}
                                title="Productos ocultos"
                            >
                                <EyeOff className="w-4 h-4 text-[var(--text-muted)]" />
                                {hiddenProductsCount > 0 && (
                                    <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-0.5 bg-slate-500 text-white text-[9px] font-black rounded-full flex items-center justify-center leading-none">
                                        {hiddenProductsCount}
                                    </span>
                                )}
                            </button>
                            {openDropdown === 'hidden' && (
                                <div className="absolute right-0 top-full mt-2 w-64 mgmt-modal backdrop-blur-xl rounded-2xl shadow-2xl z-50 overflow-hidden">
                                    <div className="px-4 py-3 border-b border-[var(--border-subtle)] bg-[var(--bg-elevated)]">
                                        <div className="flex items-center gap-2">
                                            <EyeOff className="w-4 h-4 text-[var(--text-muted)]" />
                                            <p className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Ocultos del catálogo</p>
                                        </div>
                                        <p className="text-2xl font-black text-[var(--text-primary)] mt-1">{hiddenProductsCount} <span className="text-xs font-normal text-[var(--text-muted)]">productos</span></p>
                                    </div>
                                    <div className="max-h-52 overflow-y-auto py-1">
                                        {hiddenProducts.length === 0 ? (
                                            <p className="text-xs text-[var(--text-muted)] px-4 py-3 text-center">Sin productos ocultos</p>
                                        ) : hiddenProducts.map(p => (
                                            <div key={p.id} className="flex items-center justify-between px-4 py-2 hover:bg-[var(--bg-elevated)] transition-colors">
                                                <span className="text-xs text-[var(--text-primary)] truncate flex-1 mr-2">{p.name}</span>
                                                <span className="text-xs text-[var(--text-muted)] shrink-0">oculto</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                    </div>
                }
            >
                <div className="space-y-3 ">
                    {/* BUSCADOR + FILTROS + PARÁMETROS */}
                    {/* BUSCADOR MÓVIL (< md) */}
                    <div className="md:hidden flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                            <div className="flex-1">
                                <SearchBar
                                    value={query}
                                    onChange={setQuery}
                                    placeholder="Buscar por nombre o código del producto..."
                                    containerClassName="max-w-full"
                                    inputClassName="bg-[#151519] text-white text-xs border-white/10 placeholder:text-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all rounded-xl h-9"
                                    iconClassName="text-slate-500 group-focus-within:text-indigo-400"
                                />
                            </div>
                            <button
                                onClick={() => setMobileFilterOpen(true)}
                                className={`relative h-9 w-9 shrink-0 flex items-center justify-center rounded-xl border transition-all active:scale-95 ${filterStock !== 'all' || filterVisibility !== 'all' || filterCategory !== 'all' || filterProvider !== 'all'
                                    ? 'bg-indigo-500/15 border-indigo-500/40 text-indigo-300'
                                    : 'bg-[#151519] border-white/10 text-slate-300'
                                    }`}
                                title="Filtros"
                            >
                                <SlidersHorizontal className="w-3.5 h-3.5" />
                                {(filterStock !== 'all' || filterVisibility !== 'all' || filterCategory !== 'all' || filterProvider !== 'all') && (
                                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-indigo-500 rounded-full border-2 border-[#07050C]" />
                                )}
                            </button>
                        </div>

                        {/* CHIPS RÁPIDOS MOBILE */}
                        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5 text-xs">
                            <button
                                onClick={() => { setFilterStock('all'); setFilterVisibility('all'); }}
                                className={`shrink-0 px-3 py-1.5 rounded-full border font-medium transition-colors ${filterStock === 'all' && filterVisibility === 'all'
                                    ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300'
                                    : 'bg-white/5 border-white/10 text-slate-400'
                                    }`}
                            >
                                Todos ({products.filter(p => p.status).length})
                            </button>
                            <button
                                onClick={() => { setFilterStock(filterStock === 'low' ? 'all' : 'low'); setFilterVisibility('all'); }}
                                className={`shrink-0 px-3 py-1.5 rounded-full border font-medium flex items-center gap-1.5 transition-colors ${filterStock === 'low'
                                    ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                                    : 'bg-white/5 border-white/10 text-slate-400'
                                    }`}
                            >
                                <span className="w-2 h-2 rounded-full bg-amber-400" />
                                Bajo stock ({lowStockCount})
                            </button>
                            <button
                                onClick={() => { setFilterStock(filterStock === 'out' ? 'all' : 'out'); setFilterVisibility('all'); }}
                                className={`shrink-0 px-3 py-1.5 rounded-full border font-medium flex items-center gap-1.5 transition-colors ${filterStock === 'out'
                                    ? 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                                    : 'bg-white/5 border-white/10 text-slate-400'
                                    }`}
                            >
                                <span className="w-2 h-2 rounded-full bg-rose-400" />
                                Agotados ({outOfStockCount})
                            </button>
                            <button
                                onClick={() => { setFilterVisibility(filterVisibility === 'hidden' ? 'all' : 'hidden'); setFilterStock('all'); }}
                                className={`shrink-0 px-3 py-1.5 rounded-full border font-medium transition-colors ${filterVisibility === 'hidden'
                                    ? 'bg-violet-500/20 border-violet-500/40 text-violet-300'
                                    : 'bg-white/5 border-white/10 text-slate-400'
                                    }`}
                            >
                                Ocultos ({hiddenProductsCount})
                            </button>
                        </div>
                    </div>

                    {/* BUSCADOR Y FILTROS ESCRITORIO (md+): EXACTAMENTE EL ORIGINAL */}
                    <div className="hidden md:flex items-center justify-between gap-3 w-full">
                        {/* Buscador */}
                        <div className="flex-1">
                            <SearchBar
                                value={query}
                                onChange={setQuery}
                                placeholder="Buscar por nombre del producto..."
                                containerClassName="!max-w-none w-full"
                                inputClassName="bg-[#151519] text-white text-sm border-white/10 placeholder:text-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all rounded-xl h-11 w-full"
                                iconClassName="text-slate-500 group-focus-within:text-indigo-400"
                            />
                        </div>

                        {/* Contenedor de Filtros y Acciones */}
                        <div className="flex items-center gap-2 lg:gap-2.5 shrink-0">
                            {/* Dropdown CATEGORÍAS */}
                            <div ref={categoryRef} className="relative shrink-0">
                                <button
                                    type="button"
                                    onClick={() => { setCategoryOpen(o => !o); setFilterOpen(false); setParamsOpen(false); }}
                                    className={`h-11 flex items-center gap-2 px-4 rounded-xl border text-xs font-medium transition-all cursor-pointer ${categoryOpen || filterCategory !== 'all'
                                        ? 'bg-neutral-500/20 border-neutral-500/40 text-white'
                                        : 'bg-[#151519] border-white/10 text-gray-400 hover:border-white/25 hover:text-gray-200'
                                        }`}
                                >
                                    <Tag className="w-3.5 h-3.5 shrink-0" />
                                    <span className="max-w-[140px] truncate">
                                        {filterCategory === 'all' ? 'Categorías' : filterCategory}
                                    </span>
                                    <ChevronDown className={`w-4 h-4 shrink-0 transition-transform ${categoryOpen ? 'rotate-180' : ''}`} />
                                </button>
                                {categoryOpen && (
                                    <div className="absolute right-0 top-full mt-2 w-60 max-h-[75vh] overflow-y-auto bg-[#151519] backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl z-50 p-2 space-y-1">
                                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider px-2 pt-1 pb-1">Categoría</p>
                                        <button
                                            type="button"
                                            onClick={() => { setFilterCategory('all'); setCategoryOpen(false); }}
                                            className={`w-full text-left px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${filterCategory === 'all'
                                                ? 'bg-neutral-500/20 text-white font-semibold'
                                                : 'text-gray-400 font-medium hover:bg-neutral-500/10 hover:text-gray-200'
                                                }`}
                                        >
                                            Todas las categorías
                                        </button>
                                        {uniqueCategories.map(cat => (
                                            <button
                                                key={cat}
                                                type="button"
                                                onClick={() => { setFilterCategory(cat); setCategoryOpen(false); }}
                                                className={`w-full text-left px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${filterCategory === cat
                                                    ? 'bg-neutral-500/20 text-white font-semibold'
                                                    : 'text-gray-400 font-medium hover:bg-neutral-500/10 hover:text-gray-200'
                                                    }`}
                                            >
                                                {cat}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Dropdown OTROS FILTROS (Stock, Visibilidad y Proveedor) */}
                            <div ref={filterRef} className="relative shrink-0">
                                <button
                                    type="button"
                                    onClick={() => { setFilterOpen(o => !o); setCategoryOpen(false); setParamsOpen(false); }}
                                    className={`h-11 flex items-center gap-2 px-4 rounded-xl border text-xs font-medium transition-all cursor-pointer ${filterOpen || otherFiltersCount > 0
                                        ? 'bg-indigo-500/15 border-indigo-500/40 text-indigo-300'
                                        : 'bg-[#151519] border-white/10 text-gray-400 hover:border-white/25 hover:text-gray-200'
                                        }`}
                                >
                                    <SlidersHorizontal className="w-3.5 h-3.5 shrink-0" />
                                    <span>Otros filtros</span>
                                    {otherFiltersCount > 0 && (
                                        <span className="text-[10px] font-bold bg-indigo-500/20 text-indigo-300 px-1.5 rounded-full">
                                            {otherFiltersCount}
                                        </span>
                                    )}
                                    <ChevronDown className={`w-4 h-4 transition-transform ${filterOpen ? 'rotate-180' : ''}`} />
                                </button>
                                {filterOpen && (
                                    <div className="absolute right-0 top-full mt-2 w-72 max-h-[75vh] overflow-y-auto bg-[#151519] backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl z-50 p-3.5 space-y-4">
                                        {/* Stock */}
                                        <div>
                                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Stock</p>
                                            <div className="grid grid-cols-2 gap-1.5">
                                                {([['all', 'Todo'], ['ok', 'Con stock'], ['low', 'Poco stock'], ['out', 'Sin stock']] as const).map(([val, lbl]) => (
                                                    <button key={val} type="button" onClick={() => setFilterStock(val)}
                                                        className={`text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${filterStock === val ? 'bg-indigo-500/20 text-indigo-300' : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
                                                            }`}>
                                                        {lbl}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Visibilidad */}
                                        <div>
                                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Visibilidad</p>
                                            <div className="grid grid-cols-3 gap-1.5">
                                                {([['all', 'Todos'], ['visible', 'Visibles'], ['hidden', 'Ocultos']] as const).map(([val, lbl]) => (
                                                    <button key={val} type="button" onClick={() => setFilterVisibility(val)}
                                                        className={`text-center px-2 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${filterVisibility === val ? 'bg-violet-500/20 text-violet-300' : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
                                                            }`}>
                                                        {lbl}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Proveedor */}
                                        <div>
                                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Proveedor</p>
                                            <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                                                <button type="button" onClick={() => setFilterProvider('all')}
                                                    className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${filterProvider === 'all' ? 'bg-indigo-500/20 text-indigo-300' : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
                                                        }`}>Todos los proveedores</button>
                                                {uniqueProviders.map(prov => (
                                                    <button key={prov} type="button" onClick={() => setFilterProvider(prov)}
                                                        className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${filterProvider === prov ? 'bg-indigo-500/20 text-indigo-300' : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
                                                            }`}>
                                                        {prov}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {otherFiltersCount > 0 && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setFilterStock('all');
                                                    setFilterVisibility('all');
                                                    setFilterProvider('all');
                                                    setFilterBrand('all');
                                                    setFilterSubCategory('all');
                                                }}
                                                className="w-full text-center text-[11px] font-medium text-rose-400/80 hover:text-rose-400 transition-colors cursor-pointer pt-2 border-t border-white/5"
                                            >
                                                Limpiar filtros
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Botón LIMPIAR FILTROS (Global) */}
                            {hasActiveFilters && (
                                <button
                                    type="button"
                                    onClick={resetFilters}
                                    className="btn btn-md btn-danger text-xs font-medium"
                                    title="Limpiar todos los filtros"
                                >
                                    <X className="w-4 h-4" />
                                    <span className="hidden xl:inline">Limpiar filtros</span>
                                </button>
                            )}

                            {/* Dropdown PARÁMETROS (Ver columnas) */}
                            <div ref={paramsRef} className="relative shrink-0">
                                <button
                                    type="button"
                                    onClick={() => { setParamsOpen(o => !o); setFilterOpen(false); setCategoryOpen(false); }}
                                    className={`h-11 flex items-center gap-2 px-4 rounded-xl border text-xs font-medium transition-all cursor-pointer ${paramsOpen || visibleColumns.size < ALL_PRODUCT_COLS.size
                                        ? 'bg-indigo-500/15 border-indigo-500/40 text-indigo-300'
                                        : 'bg-[#151519] border-white/10 text-gray-400 hover:border-white/25 hover:text-gray-200'
                                        }`}
                                >
                                    <ChevronDown className={`w-4 h-4 transition-transform ${paramsOpen ? 'rotate-180' : ''}`} />
                                    Ver columnas
                                    {visibleColumns.size < ALL_PRODUCT_COLS.size && (
                                        <span className="text-[10px] font-bold bg-indigo-500/20 text-indigo-300 px-1.5 rounded-full">
                                            {ALL_PRODUCT_COLS.size - visibleColumns.size} ocultas
                                        </span>
                                    )}
                                </button>
                                {paramsOpen && (
                                    <div className="absolute right-0 top-full mt-2 w-52 bg-[#151519] backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden p-3 space-y-1">
                                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2 px-1">Columnas visibles</p>
                                        {([
                                            ['barcode', 'Código'],
                                            ['category', 'Categoría'],
                                            ['provider', 'Proveedor'],
                                            ['stock', 'Stock'],
                                            ['price', 'Precio'],
                                            ['catalog', 'Catálogo'],
                                        ] as const).map(([col, lbl]) => (
                                            <label key={col} className="flex items-center gap-3 px-2 py-1.5 rounded-lg hover:bg-white/5 cursor-pointer group">
                                                <input
                                                    type="checkbox"
                                                    checked={visibleColumns.has(col)}
                                                    onChange={() => toggleColumn(col)}
                                                    className="w-3.5 h-3.5 rounded text-indigo-500 focus:ring-indigo-500 bg-gray-800 border-gray-600 cursor-pointer"
                                                />
                                                <span className={`text-xs font-medium transition-colors ${visibleColumns.has(col) ? 'text-gray-200' : 'text-gray-500'
                                                    }`}>{lbl}</span>
                                            </label>
                                        ))}
                                        <div className="pt-1 border-t border-white/5">
                                            <button type="button" onClick={() => setVisibleColumns(new Set(ALL_PRODUCT_COLS))}
                                                className="w-full text-center text-[10px] text-gray-500 hover:text-gray-300 transition-colors cursor-pointer py-1">
                                                Mostrar todas
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Dropdown Exportar */}
                            <ExportDropdown onExportExcel={handleExportProducts} />

                            {/* Botón Nuevo producto */}
                            <button
                                type="button"
                                title="Nuevo producto"
                                onClick={() => navigate(ROUTES.products.create)}
                                className="group h-11 inline-flex items-center gap-2 px-4 rounded-xl bg-indigo-600 text-white text-xs font-semibold transition-all duration-200 cursor-pointer shadow-[0_0_20px_rgba(79,70,229,0.35)] hover:bg-indigo-500 hover:shadow-[0_0_25px_rgba(79,70,229,0.55)] border border-indigo-400/30 active:scale-95 shrink-0"
                            >
                                <PlusIcon size={16} className="group-hover:rotate-90 transition-transform duration-300" />
                                <span>Nuevo producto</span>
                            </button>
                        </div>

                    </div>



                    <ProductsTable
                        products={currentProducts}
                        onDelete={(product) => setProductToDelete(product)}
                        currentPage={currentPage}
                        itemsPerPage={itemsPerPage}
                        onSort={handleSort}
                        currentSortColumn={sortColumn}
                        currentSortDirection={sortDirection}
                        visibleColumns={visibleColumns}
                    />

                    <Pagination
                        totalItems={filteredProducts.length}
                        itemsPerPage={itemsPerPage}
                        currentPage={currentPage}
                        onPageChange={setCurrentPage}
                    />

                    {/* BOTTOM SHEET FILTROS MOBILE (< md) */}
                    {mobileFilterOpen && (
                        <div
                            className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex flex-col justify-end"
                            onClick={() => setMobileFilterOpen(false)}
                        >
                            <div
                                className="bg-[#12101F] border-t border-white/10 rounded-t-[28px] p-5 space-y-4 max-h-[85vh] overflow-y-auto shadow-2xl"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="w-10 h-1 bg-white/20 rounded-full mx-auto -mt-1 mb-2" />

                                <div className="flex items-center justify-between">
                                    <h3 className="text-base font-bold text-white">Filtros de productos</h3>
                                    <button
                                        onClick={() => setMobileFilterOpen(false)}
                                        className="p-1 text-slate-400 hover:text-white rounded-lg"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                {/* Estado de Stock */}
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                                        Estado de Stock
                                    </label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {([
                                            ['all', 'Todos'],
                                            ['ok', 'Con stock'],
                                            ['low', 'Bajo stock'],
                                            ['out', 'Agotados'],
                                        ] as const).map(([val, lbl]) => (
                                            <button
                                                key={val}
                                                onClick={() => setFilterStock(val)}
                                                className={`py-2 px-3 rounded-xl text-xs font-medium border transition-colors ${filterStock === val
                                                    ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                                                    : 'bg-white/5 text-slate-400 border-white/10'
                                                    }`}
                                            >
                                                {lbl}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Visibilidad */}
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                                        Visibilidad en Catálogo
                                    </label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {([
                                            ['all', 'Todos'],
                                            ['visible', 'Visibles'],
                                            ['hidden', 'Ocultos'],
                                        ] as const).map(([val, lbl]) => (
                                            <button
                                                key={val}
                                                onClick={() => setFilterVisibility(val)}
                                                className={`py-2 px-3 rounded-xl text-xs font-medium border transition-colors ${filterVisibility === val
                                                    ? 'bg-violet-500/20 text-violet-300 border-violet-500/40'
                                                    : 'bg-white/5 text-slate-400 border-white/10'
                                                    }`}
                                            >
                                                {lbl}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Categoría */}
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                                        Categoría
                                    </label>
                                    <select
                                        value={filterCategory}
                                        onChange={(e) => setFilterCategory(e.target.value)}
                                        className="w-full bg-[#0A0812] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                                    >
                                        <option value="all">Todas las categorías</option>
                                        {uniqueCategories.map((cat) => (
                                            <option key={cat} value={cat}>
                                                {cat}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Proveedor */}
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                                        Proveedor
                                    </label>
                                    <select
                                        value={filterProvider}
                                        onChange={(e) => setFilterProvider(e.target.value)}
                                        className="w-full bg-[#0A0812] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                                    >
                                        <option value="all">Todos los proveedores</option>
                                        {uniqueProviders.map((prov) => (
                                            <option key={prov} value={prov}>
                                                {prov}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Botones de Acción */}
                                <div className="flex items-center gap-2 pt-2">
                                    <button
                                        onClick={() => {
                                            resetFilters();
                                            setMobileFilterOpen(false);
                                        }}
                                        className="btn btn-sm btn-subtle flex-1"
                                    >
                                        Limpiar
                                    </button>
                                    <button
                                        onClick={() => setMobileFilterOpen(false)}
                                        className="btn btn-sm btn-primary flex-1"
                                    >
                                        Aplicar Filtros
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {productToDelete && (
                        <ConfirmDeleteModal
                            isOpen={true}
                            itemName={productToDelete.name}
                            isLoading={loading}
                            onCancel={() => setProductToDelete(null)}
                            onConfirm={async () => {
                                await disableProduct(productToDelete.id);
                                if (
                                    currentProducts.length === 1 &&
                                    currentPage > 1
                                ) {
                                    setCurrentPage((prev) => prev - 1);
                                }
                                setProductToDelete(null);
                            }}
                        />
                    )}
                </div>
            </DashboardLayout>
        </>
    );
}


