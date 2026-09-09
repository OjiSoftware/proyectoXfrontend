import { useEffect, useState, useMemo, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CheckCircle2, X, PlusIcon, AlertTriangle, PackageX, EyeOff, ChevronDown } from "lucide-react";
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
    const [filterSubCategory, setFilterSubCategory] = useState<string>('all');

    // ---------------- Columnas visibles ----------------
    const ALL_PRODUCT_COLS = new Set(['unit', 'brand', 'category', 'subCategory', 'stock', 'price', 'catalog']);
    const [visibleColumns, setVisibleColumns] = useState<Set<string>>(new Set(ALL_PRODUCT_COLS));

    const toggleColumn = (col: string) => {
        setVisibleColumns(prev => {
            const next = new Set(prev);
            if (next.has(col)) { next.delete(col); } else { next.add(col); }
            return next;
        });
    };

    // ---------------- Dropdown refs ----------------
    const [filterOpen, setFilterOpen] = useState(false);
    const [brandOpen, setBrandOpen] = useState(false);
    const [categoryOpen, setCategoryOpen] = useState(false);
    const [subCategoryOpen, setSubCategoryOpen] = useState(false);
    const [paramsOpen, setParamsOpen] = useState(false);
    const filterRef = useRef<HTMLDivElement>(null);
    const brandRef = useRef<HTMLDivElement>(null);
    const categoryRef = useRef<HTMLDivElement>(null);
    const subCategoryRef = useRef<HTMLDivElement>(null);
    const paramsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (filterRef.current && !filterRef.current.contains(e.target as Node)) setFilterOpen(false);
            if (brandRef.current && !brandRef.current.contains(e.target as Node)) setBrandOpen(false);
            if (categoryRef.current && !categoryRef.current.contains(e.target as Node)) setCategoryOpen(false);
            if (subCategoryRef.current && !subCategoryRef.current.contains(e.target as Node)) setSubCategoryOpen(false);
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
            const matchesQuery = p.name.toLowerCase().includes(searchTerm);
            if (!matchesQuery) return false;

            // Filtro de stock
            const stock = p.stock ?? 0;
            if (filterStock === 'low' && !(stock > 0 && stock <= 5)) return false;
            if (filterStock === 'out' && stock > 0) return false;
            if (filterStock === 'ok' && stock <= 5) return false;

            // Filtro de visibilidad
            if (filterVisibility === 'visible' && !p.showingInCatalog) return false;
            if (filterVisibility === 'hidden' && p.showingInCatalog) return false;

            // Filtro de marca
            if (filterBrand !== 'all' && (p.brand?.name ?? '') !== filterBrand) return false;

            // Filtro de categoría
            if (filterCategory !== 'all' && (p.subCategory?.category?.name ?? '') !== filterCategory) return false;

            // Filtro de subcategoría
            if (filterSubCategory !== 'all' && (p.subCategory?.name ?? '') !== filterSubCategory) return false;

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
            } else if (sortColumn === "subCategory.category.name") {
                aVal = a.subCategory?.category?.name || "";
                bVal = b.subCategory?.category?.name || "";
            } else if (sortColumn === "subCategory.name") {
                aVal = a.subCategory?.name || "";
                bVal = b.subCategory?.name || "";
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
    }, [products, query, sortColumn, sortDirection, filterStock, filterVisibility, filterBrand, filterCategory, filterSubCategory]);

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

    useEffect(() => setCurrentPage(1), [itemsPerPage, query, filterStock, filterVisibility, filterBrand, filterCategory, filterSubCategory]);

    // Valores únicos derivados de los datos reales
    const uniqueBrands = useMemo(() =>
        [...new Set(products.map(p => p.brand?.name).filter(Boolean) as string[])].sort(), [products]);
    const uniqueCategories = useMemo(() =>
        [...new Set(products.map(p => p.subCategory?.category?.name).filter(Boolean) as string[])].sort(), [products]);
    const uniqueSubCategories = useMemo(() => {
        const source = filterCategory !== 'all'
            ? products.filter(p => (p.subCategory?.category?.name ?? '') === filterCategory)
            : products;
        return [...new Set(source.map(p => p.subCategory?.name).filter(Boolean) as string[])].sort();
    }, [products, filterCategory]);

    const resetFilters = () => {
        setQuery('');
        setFilterStock('all');
        setFilterVisibility('all');
        setFilterBrand('all');
        setFilterCategory('all');
        setFilterSubCategory('all');
    };

    const hasActiveFilters = query !== '' || filterStock !== 'all' || filterVisibility !== 'all' || filterBrand !== 'all' || filterCategory !== 'all' || filterSubCategory !== 'all';


    return (
        <>
            {/* TOAST DE BIENVENIDA */}
            <div
                className={`fixed top-6 right-6 z-[100] transition-all duration-500 transform ${showWelcome
                    ? "translate-x-0 opacity-100"
                    : "translate-x-[120%] opacity-0"
                    }`}
            >
                <div className="bg-slate-800/90 backdrop-blur-md border border-white/10 shadow-2xl rounded-xl p-4 flex items-start gap-3 min-w-[300px]">
                    <CheckCircle2 className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                        <h3 className="text-xs font-bold text-white">
                            ¡Hola, {userName}!
                        </h3>
                        <p className="text-xs text-slate-400 mt-1">
                            Sesión iniciada correctamente.
                        </p>
                    </div>
                    <button
                        onClick={() => setShowWelcome(false)}
                        className="text-slate-500 hover:text-white transition-colors cursor-pointer"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            </div>

            <DashboardLayout
                title="Lista de productos"
                subtitle="Gestión de productos del sistema."
                actions={
                    <button
                        title="Nuevo producto"
                        onClick={() => navigate(ROUTES.products.create)}
                        className="group flex items-center justify-center w-11 h-11 rounded-[14px] bg-indigo-600 text-white font-bold transition-all duration-300 cursor-pointer shadow-[0_0_20px_rgba(79,70,229,0.4)] hover:bg-indigo-500 hover:shadow-[0_0_30px_rgba(79,70,229,0.7)] hover:-translate-y-0.5 border border-indigo-400/30 active:scale-95 active:translate-y-0"
                    >
                        <PlusIcon size={22} className="drop-shadow-[0_0_8px_rgba(255,255,255,0.5)] group-hover:rotate-90 transition-transform duration-500" />
                    </button>
                }
                headerWidgets={
                    <div ref={dropdownRef} className="flex items-center gap-2">

                        {/* ALERTA: CASI SIN STOCK */}
                        <div className="relative">
                            <button
                                onClick={() => setOpenDropdown(openDropdown === 'lowStock' ? null : 'lowStock')}
                                className={`relative flex items-center justify-center w-9 h-9 rounded-xl border transition-all duration-200 cursor-pointer ${openDropdown === 'lowStock'
                                    ? 'bg-amber-500/25 border-amber-400/50 shadow-[0_0_12px_rgba(251,191,36,0.3)]'
                                    : 'bg-amber-900/30 border-amber-500/20 hover:bg-amber-500/20 hover:border-amber-400/40'
                                    }`}
                                title="Casi sin stock"
                            >
                                <AlertTriangle className="w-4 h-4 text-amber-400" />
                                {lowStockCount > 0 && (
                                    <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-0.5 bg-amber-400 text-gray-900 text-[9px] font-black rounded-full flex items-center justify-center leading-none">
                                        {lowStockCount}
                                    </span>
                                )}
                            </button>
                            {openDropdown === 'lowStock' && (
                                <div className="absolute right-0 top-full mt-2 w-64 bg-gray-900/95 backdrop-blur-xl border border-amber-500/20 rounded-2xl shadow-2xl shadow-amber-900/20 z-50 overflow-hidden">
                                    <div className="px-4 py-3 border-b border-amber-500/15 bg-amber-900/20">
                                        <div className="flex items-center gap-2">
                                            <AlertTriangle className="w-4 h-4 text-amber-400" />
                                            <p className="text-xs font-bold text-amber-300 uppercase tracking-wider">Casi sin stock</p>
                                        </div>
                                        <p className="text-2xl font-black text-amber-400 mt-1">{lowStockCount} <span className="text-xs font-normal text-amber-200/60">productos</span></p>
                                    </div>
                                    <div className="max-h-52 overflow-y-auto py-1">
                                        {lowStockProducts.length === 0 ? (
                                            <p className="text-xs text-gray-500 px-4 py-3 text-center">Sin alertas activas</p>
                                        ) : lowStockProducts.map(p => (
                                            <div key={p.id} className="flex items-center justify-between px-4 py-2 hover:bg-white/5 transition-colors">
                                                <span className="text-xs text-gray-300 truncate flex-1 mr-2">{p.name}</span>
                                                <span className="text-xs font-bold text-amber-400 shrink-0">{p.stock} uds.</span>
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
                                    ? 'bg-rose-500/25 border-rose-400/50 shadow-[0_0_12px_rgba(244,63,94,0.3)]'
                                    : 'bg-rose-900/30 border-rose-500/20 hover:bg-rose-500/20 hover:border-rose-400/40'
                                    }`}
                                title="Sin stock"
                            >
                                <PackageX className="w-4 h-4 text-rose-400" />
                                {outOfStockCount > 0 && (
                                    <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-0.5 bg-rose-400 text-white text-[9px] font-black rounded-full flex items-center justify-center leading-none">
                                        {outOfStockCount}
                                    </span>
                                )}
                            </button>
                            {openDropdown === 'outOfStock' && (
                                <div className="absolute right-0 top-full mt-2 w-64 bg-gray-900/95 backdrop-blur-xl border border-rose-500/20 rounded-2xl shadow-2xl shadow-rose-900/20 z-50 overflow-hidden">
                                    <div className="px-4 py-3 border-b border-rose-500/15 bg-rose-900/20">
                                        <div className="flex items-center gap-2">
                                            <PackageX className="w-4 h-4 text-rose-400" />
                                            <p className="text-xs font-bold text-rose-300 uppercase tracking-wider">Sin stock</p>
                                        </div>
                                        <p className="text-2xl font-black text-rose-400 mt-1">{outOfStockCount} <span className="text-xs font-normal text-rose-200/60">productos</span></p>
                                    </div>
                                    <div className="max-h-52 overflow-y-auto py-1">
                                        {outOfStockProducts.length === 0 ? (
                                            <p className="text-xs text-gray-500 px-4 py-3 text-center">Sin alertas activas</p>
                                        ) : outOfStockProducts.map(p => (
                                            <div key={p.id} className="flex items-center justify-between px-4 py-2 hover:bg-white/5 transition-colors">
                                                <span className="text-xs text-gray-300 truncate flex-1 mr-2">{p.name}</span>
                                                <span className="text-xs font-bold text-rose-400 shrink-0">0 uds.</span>
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
                                    ? 'bg-gray-600/40 border-gray-400/40 shadow-[0_0_12px_rgba(148,163,184,0.2)]'
                                    : 'bg-gray-800/50 border-white/10 hover:bg-gray-700/50 hover:border-white/20'
                                    }`}
                                title="Productos ocultos"
                            >
                                <EyeOff className="w-4 h-4 text-gray-400" />
                                {hiddenProductsCount > 0 && (
                                    <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-0.5 bg-gray-400 text-gray-900 text-[9px] font-black rounded-full flex items-center justify-center leading-none">
                                        {hiddenProductsCount}
                                    </span>
                                )}
                            </button>
                            {openDropdown === 'hidden' && (
                                <div className="absolute right-0 top-full mt-2 w-64 bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden">
                                    <div className="px-4 py-3 border-b border-white/5 bg-gray-800/50">
                                        <div className="flex items-center gap-2">
                                            <EyeOff className="w-4 h-4 text-gray-400" />
                                            <p className="text-xs font-bold text-gray-300 uppercase tracking-wider">Ocultos del catálogo</p>
                                        </div>
                                        <p className="text-2xl font-black text-gray-200 mt-1">{hiddenProductsCount} <span className="text-xs font-normal text-gray-500">productos</span></p>
                                    </div>
                                    <div className="max-h-52 overflow-y-auto py-1">
                                        {hiddenProducts.length === 0 ? (
                                            <p className="text-xs text-gray-500 px-4 py-3 text-center">Sin productos ocultos</p>
                                        ) : hiddenProducts.map(p => (
                                            <div key={p.id} className="flex items-center justify-between px-4 py-2 hover:bg-white/5 transition-colors">
                                                <span className="text-xs text-gray-300 truncate flex-1 mr-2">{p.name}</span>
                                                <span className="text-xs text-gray-500 shrink-0">oculto</span>
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
                    <div className="flex flex-col lg:flex-row lg:items-center gap-3">
                        {/* Buscador */}
                        <div className="flex-1 min-w-[200px]">
                            <SearchBar
                                value={query}
                                onChange={setQuery}
                                placeholder="Buscar por nombre del producto..."
                                containerClassName="max-w-full"
                                inputClassName="bg-[#151519] text-white text-sm border-white/10 placeholder:text-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all rounded-xl h-11"
                                iconClassName="text-slate-500 group-focus-within:text-indigo-400"
                            />
                        </div>

                        {/* Contenedor de Filtros y Acciones */}
                        <div className="flex flex-wrap items-center gap-2 lg:gap-3">



                            {/* Dropdown MARCA */}
                            <div ref={brandRef} className="relative shrink-0">
                                <button
                                    onClick={() => { setBrandOpen(o => !o); setFilterOpen(false); setCategoryOpen(false); setParamsOpen(false); }}
                                    className={`h-11 flex items-center gap-2 px-4 rounded-xl border text-xs font-medium transition-all cursor-pointer ${brandOpen || filterBrand !== 'all'
                                        ? 'bg-indigo-500/15 border-indigo-500/40 text-indigo-300'
                                        : 'bg-[#151519] border-white/10 text-gray-400 hover:border-white/25 hover:text-gray-200'
                                        }`}
                                >
                                    <ChevronDown className={`w-4 h-4 transition-transform ${brandOpen ? 'rotate-180' : ''}`} />
                                    {filterBrand !== 'all' ? filterBrand : 'Marca'}
                                    {filterBrand !== 'all' && (
                                        <span className="w-2 h-2 rounded-full bg-indigo-400 shrink-0" />
                                    )}
                                </button>
                                {brandOpen && (
                                    <div className="absolute left-0 top-full mt-2 w-52 bg-[#151519] backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden p-3">
                                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Marca</p>
                                        <div className="space-y-1 max-h-52 overflow-y-auto pr-1">
                                            <button onClick={() => setFilterBrand('all')}
                                                className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${filterBrand === 'all' ? 'bg-indigo-500/20 text-indigo-300' : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
                                                    }`}>Todas las marcas</button>
                                            {uniqueBrands.map(brand => (
                                                <button key={brand} onClick={() => setFilterBrand(brand)}
                                                    className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${filterBrand === brand ? 'bg-indigo-500/20 text-indigo-300' : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
                                                        }`}>
                                                    {brand}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Dropdown CATEGORÍA */}
                            <div ref={categoryRef} className="relative shrink-0">
                                <button
                                    onClick={() => { setCategoryOpen(o => !o); setFilterOpen(false); setBrandOpen(false); setParamsOpen(false); }}
                                    className={`h-11 flex items-center gap-2 px-4 rounded-xl border text-xs font-medium transition-all cursor-pointer ${categoryOpen || filterCategory !== 'all'
                                        ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                                        : 'bg-[#151519] border-white/10 text-gray-400 hover:border-white/25 hover:text-gray-200'
                                        }`}
                                >
                                    <ChevronDown className={`w-4 h-4 transition-transform ${categoryOpen ? 'rotate-180' : ''}`} />
                                    {filterCategory !== 'all' ? filterCategory : 'Categoría'}
                                    {filterCategory !== 'all' && (
                                        <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                                    )}
                                </button>
                                {categoryOpen && (
                                    <div className="absolute left-0 top-full mt-2 w-52 bg-[#151519] backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden p-3">
                                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Categoría</p>
                                        <div className="space-y-1 max-h-52 overflow-y-auto pr-1">
                                            <button onClick={() => setFilterCategory('all')}
                                                className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${filterCategory === 'all' ? 'bg-emerald-500/20 text-emerald-300' : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
                                                    }`}>Todas las categorías</button>
                                            {uniqueCategories.map(cat => (
                                                <button key={cat} onClick={() => setFilterCategory(cat)}
                                                    className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${filterCategory === cat ? 'bg-emerald-500/20 text-emerald-300' : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
                                                        }`}>
                                                    {cat}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Dropdown SUBCATEGORÍA */}
                            <div ref={subCategoryRef} className="relative shrink-0">
                                <button
                                    onClick={() => { setSubCategoryOpen(o => !o); setFilterOpen(false); setBrandOpen(false); setCategoryOpen(false); setParamsOpen(false); }}
                                    className={`h-11 flex items-center gap-2 px-4 rounded-xl border text-xs font-medium transition-all cursor-pointer ${subCategoryOpen || filterSubCategory !== 'all'
                                        ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                                        : 'bg-[#151519] border-white/10 text-gray-400 hover:border-white/25 hover:text-gray-200'
                                        }`}
                                >
                                    <ChevronDown className={`w-4 h-4 transition-transform ${subCategoryOpen ? 'rotate-180' : ''}`} />
                                    {filterSubCategory !== 'all' ? filterSubCategory : 'Subcategoría'}
                                    {filterSubCategory !== 'all' && (
                                        <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                                    )}
                                </button>
                                {subCategoryOpen && (
                                    <div className="absolute left-0 top-full mt-2 w-52 bg-[#151519] backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden p-3">
                                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Subcategoría</p>
                                        {filterCategory !== 'all' && (
                                            <p className="text-[10px] text-emerald-400/70 mb-2 px-1">Filtrado por: {filterCategory}</p>
                                        )}
                                        <div className="space-y-1 max-h-52 overflow-y-auto pr-1">
                                            <button onClick={() => setFilterSubCategory('all')}
                                                className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${filterSubCategory === 'all' ? 'bg-emerald-500/20 text-emerald-300' : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
                                                    }`}>Todas las subcategorías</button>
                                            {uniqueSubCategories.map(sub => (
                                                <button key={sub} onClick={() => setFilterSubCategory(sub)}
                                                    className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${filterSubCategory === sub ? 'bg-emerald-500/20 text-emerald-300' : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
                                                        }`}>
                                                    {sub}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Dropdown otros FILTROS — solo Stock y Visibilidad */}
                            <div ref={filterRef} className="relative shrink-0">
                                <button
                                    onClick={() => { setFilterOpen(o => !o); setBrandOpen(false); setCategoryOpen(false); setParamsOpen(false); }}
                                    className={`h-11 flex items-center gap-2 px-4 rounded-xl border text-xs font-medium transition-all cursor-pointer ${filterOpen || filterStock !== 'all' || filterVisibility !== 'all'
                                        ? 'bg-indigo-500/15 border-indigo-500/40 text-indigo-300'
                                        : 'bg-[#151519] border-white/10 text-gray-400 hover:border-white/25 hover:text-gray-200'
                                        }`}
                                >
                                    <ChevronDown className={`w-4 h-4 transition-transform ${filterOpen ? 'rotate-180' : ''}`} />
                                    Otros filtros
                                    {(filterStock !== 'all' || filterVisibility !== 'all') && (
                                        <span className="w-2 h-2 rounded-full bg-indigo-400 shrink-0" />
                                    )}
                                </button>
                                {filterOpen && (
                                    <div className="absolute left-0 top-full mt-2 w-52 bg-[#151519] backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden p-3 space-y-4">
                                        {/* Stock */}
                                        <div>
                                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Stock</p>
                                            <div className="space-y-1">
                                                {([['all', 'Todo'], ['ok', 'Con stock'], ['low', 'Poco stock'], ['out', 'Sin stock']] as const).map(([val, lbl]) => (
                                                    <button key={val} onClick={() => setFilterStock(val)}
                                                        className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${filterStock === val ? 'bg-indigo-500/20 text-indigo-300' : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
                                                            }`}>
                                                        {lbl}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        {/* Visibilidad */}
                                        <div>
                                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Visibilidad</p>
                                            <div className="space-y-1">
                                                {([['all', 'Todos'], ['visible', 'Visibles'], ['hidden', 'Ocultos']] as const).map(([val, lbl]) => (
                                                    <button key={val} onClick={() => setFilterVisibility(val)}
                                                        className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${filterVisibility === val ? 'bg-violet-500/20 text-violet-300' : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
                                                            }`}>
                                                        {lbl}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        {(filterStock !== 'all' || filterVisibility !== 'all') && (
                                            <button onClick={() => { setFilterStock('all'); setFilterVisibility('all'); }}
                                                className="w-full text-center text-[10px] text-rose-400/70 hover:text-rose-400 transition-colors cursor-pointer pt-1 border-t border-white/5">
                                                Limpiar
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Botón LIMPIAR FILTROS (Global) */}
                            {hasActiveFilters && (
                                <button
                                    onClick={resetFilters}
                                    className="h-11 flex items-center gap-2 px-4 rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-400 text-xs font-medium transition-all hover:bg-rose-500/20 hover:border-rose-500/40 active:scale-95 cursor-pointer"
                                    title="Limpiar todos los filtros"
                                >
                                    <X className="w-4 h-4" />
                                    <span className="hidden xl:inline">Limpiar filtros</span>
                                </button>
                            )}

                            {/* Dropdown PARÁMETROS - Siempre al final a la derecha */}
                            <div ref={paramsRef} className="relative shrink-0 ml-auto">
                                <button
                                    onClick={() => { setParamsOpen(o => !o); setFilterOpen(false); }}
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
                                            ['unit', 'Unidad'],
                                            ['brand', 'Marca'],
                                            ['category', 'Categoría'],
                                            ['subCategory', 'Subcategoría'],
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
                                            <button onClick={() => setVisibleColumns(new Set(ALL_PRODUCT_COLS))}
                                                className="w-full text-center text-[10px] text-gray-500 hover:text-gray-300 transition-colors cursor-pointer py-1">
                                                Mostrar todas
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
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


