import { Fragment, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { ChevronDown, ChevronRight, ChevronsDownUp, ChevronsUpDown, DownloadIcon, Filter, XIcon } from "lucide-react";
import DashboardLayout from "@/layouts/DashboardLayout";
import SearchBar from "@/components/SearchBar";
import Pagination from "@/components/PaginationManagement";
import { useItemsPerpage } from "@/hooks/useItemsPerpage";
import { reportApi } from "@/services/ReportService";
import { productApi } from "@/services/ProductService";
import { exportExcel } from "@/helpers/excelExport";
import { buildSalesReportSheets } from "@/helpers/reportExport";
import type { SalesReportItem, SalesReportResult } from "@/types/report.types";

interface Option {
    id: number;
    name: string;
}

interface GroupedSale {
    saleId: number;
    date: string;
    paymentMethod: string;
    products: SalesReportItem[];
    totalUnits: number;
    totalCost: number;
    totalMargin: number | null;
    total: number;
}

const money = (n: number) =>
    new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency: "ARS",
        maximumFractionDigits: 2,
    }).format(n || 0);

const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("es-AR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });

const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString("es-AR", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    });

const fieldClass =
    "bg-[#151519] border border-white/10 text-slate-200 text-xs rounded-xl h-9 px-3 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none";

export default function ReportsPage() {
    const itemsPerPage = useItemsPerpage();

    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [providerId, setProviderId] = useState("");
    const [brandId, setBrandId] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("");
    const [searchInput, setSearchInput] = useState("");
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [filtersOpen, setFiltersOpen] = useState(false);

    const [categories, setCategories] = useState<Option[]>([]);
    const [providers, setProviders] = useState<Option[]>([]);
    const [brands, setBrands] = useState<Option[]>([]);

    const [report, setReport] = useState<SalesReportResult | null>(null);
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);
    const [collapsedSales, setCollapsedSales] = useState<Set<number>>(new Set());

    // Opciones de los selects
    useEffect(() => {
        Promise.all([
            productApi.getAllCategories(),
            productApi.getAllProviders(),
            productApi.getAllBrands(),
        ])
            .then(([cats, provs, brs]) => {
                setCategories(cats.map((c: any) => ({ id: c.id, name: c.name })));
                setProviders(
                    provs.map((p: any) => ({
                        id: p.id,
                        name: p.name || p.businessName || `Proveedor #${p.id}`,
                    })),
                );
                setBrands(brs.map((b: any) => ({ id: b.id, name: b.name })));
            })
            .catch(() => toast.error("No se pudieron cargar los filtros"));
    }, []);

    // Debounce de la búsqueda de texto
    useEffect(() => {
        const t = setTimeout(() => setSearch(searchInput.trim()), 350);
        return () => clearTimeout(t);
    }, [searchInput]);

    // Cualquier cambio de filtro vuelve a la página 1
    useEffect(() => {
        setPage(1);
    }, [from, to, categoryId, providerId, brandId, paymentMethod, search]);

    const filters = useMemo(
        () => ({
            from: from || undefined,
            to: to || undefined,
            categoryId: categoryId ? Number(categoryId) : undefined,
            providerId: providerId ? Number(providerId) : undefined,
            brandId: brandId ? Number(brandId) : undefined,
            paymentMethod: paymentMethod || undefined,
            search: search || undefined,
        }),
        [from, to, categoryId, providerId, brandId, paymentMethod, search],
    );

    useEffect(() => {
        const controller = new AbortController();
        setLoading(true);
        reportApi
            .getSalesReport(filters, controller.signal)
            .then((data) => {
                setReport(data);
                setCollapsedSales(new Set());
            })
            .catch((err) => {
                if (err?.name !== "AbortError") toast.error("No se pudo cargar el reporte");
            })
            .finally(() => {
                if (!controller.signal.aborted) setLoading(false);
            });
        return () => controller.abort();
    }, [filters]);

    // Agrupación por saleId en el front
    const groupedSales = useMemo<GroupedSale[]>(() => {
        if (!report?.items?.length) return [];
        const map = new Map<number, GroupedSale>();

        for (const item of report.items) {
            const existing = map.get(item.saleId);
            const lineCost = (item.costPrice || 0) * (item.quantity || 0);

            if (!existing) {
                map.set(item.saleId, {
                    saleId: item.saleId,
                    date: item.date,
                    paymentMethod: item.paymentMethod,
                    products: [item],
                    totalUnits: item.quantity || 0,
                    totalCost: lineCost,
                    totalMargin: item.margin != null ? item.margin : null,
                    total: item.subtotal || 0,
                });
            } else {
                existing.products.push(item);
                existing.totalUnits += item.quantity || 0;
                existing.totalCost += lineCost;
                if (item.margin != null) {
                    existing.totalMargin = (existing.totalMargin ?? 0) + item.margin;
                }
                existing.total += item.subtotal || 0;
            }
        }

        return Array.from(map.values());
    }, [report]);

    // Paginación en el front sobre ventas agrupadas (evita partir tickets entre páginas)
    const currentSales = useMemo(() => {
        const start = (page - 1) * itemsPerPage;
        return groupedSales.slice(start, start + itemsPerPage);
    }, [groupedSales, page, itemsPerPage]);

    // Totales generales sobre todas las ventas filtradas
    const grandTotals = useMemo(() => {
        let units = 0;
        let cost = 0;
        let margin: number | null = null;
        let total = 0;

        for (const s of groupedSales) {
            units += s.totalUnits;
            cost += s.totalCost;
            if (s.totalMargin != null) margin = (margin ?? 0) + s.totalMargin;
            total += s.total;
        }
        return { units, cost, margin, total };
    }, [groupedSales]);

    const toggleSale = (saleId: number) => {
        setCollapsedSales((prev) => {
            const next = new Set(prev);
            if (next.has(saleId)) next.delete(saleId);
            else next.add(saleId);
            return next;
        });
    };

    const allVisibleCollapsed =
        currentSales.length > 0 &&
        currentSales.every((s) => collapsedSales.has(s.saleId));

    const showProductColumns = !allVisibleCollapsed;
    const totalColCount = showProductColumns ? 8 : 5;

    const toggleAllVisible = () => {
        setCollapsedSales((prev) => {
            const next = new Set(prev);
            if (allVisibleCollapsed) {
                currentSales.forEach((s) => next.delete(s.saleId));
            } else {
                currentSales.forEach((s) => next.add(s.saleId));
            }
            return next;
        });
    };

    const activeFiltersCount = [
        from,
        to,
        categoryId,
        providerId,
        brandId,
        paymentMethod,
    ].filter(Boolean).length;

    const hasFilters = Object.values(filters).some((v) => v !== undefined);

    const clearFilters = () => {
        setFrom("");
        setTo("");
        setCategoryId("");
        setProviderId("");
        setBrandId("");
        setPaymentMethod("");
        setSearchInput("");
        setSearch("");
    };

    const handleExport = async () => {
        setExporting(true);
        try {
            const full = await reportApi.getSalesReport(filters);
            if (full.items.length === 0) {
                toast.error("No hay datos para exportar con los filtros actuales");
                return;
            }
            exportExcel({
                fileName: `reporte-ventas-${new Date().toISOString().slice(0, 10)}`,
                sheets: buildSalesReportSheets(full.items, full.kpis),
            });
        } catch {
            toast.error("No se pudo exportar el reporte");
        } finally {
            setExporting(false);
        }
    };

    const kpis = report?.kpis;
    const kpiCards = [
        { label: "Total vendido", value: kpis ? money(kpis.totalSold) : "-" },
        { label: "Ventas", value: kpis ? String(kpis.salesCount) : "-" },
        { label: "Ticket promedio", value: kpis ? money(kpis.averageTicket) : "-" },
        { label: "Unidades", value: kpis ? String(kpis.unitsSold) : "-" },
        { label: "Margen", value: kpis ? money(kpis.totalMargin) : "-" },
    ];

    return (
        <DashboardLayout
            title="Reporte de ventas"
            subtitle="Ventas completadas, filtrables por fecha, categoría, proveedor y más."
            backUrl="/management/analytics/sales"
            actions={
                <div className="flex items-center gap-2">
                    {/* Búsqueda en el header */}
                    <div className="w-56 lg:w-72">
                        <SearchBar
                            value={searchInput}
                            onChange={setSearchInput}
                            placeholder="Buscar cliente, DNI..."
                            containerClassName="w-full"
                            inputClassName="bg-[#151519] text-white text-xs border-white/10 placeholder:text-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all rounded-xl h-9"
                        />
                    </div>

                    {/* Botón selector de filtros */}
                    <button
                        type="button"
                        onClick={() => setFiltersOpen((prev) => !prev)}
                        className={`btn btn-sm ${filtersOpen || activeFiltersCount > 0
                            ? "btn-primary"
                            : "btn-subtle"
                            }`}
                        title="Filtrar por fecha, categoría, marca..."
                    >
                        <Filter className="w-4 h-4" />
                        <span className="hidden sm:inline">Filtros</span>
                        {activeFiltersCount > 0 && (
                            <span className="ml-0.5 px-1.5 py-0.2 rounded-full bg-indigo-500 text-white text-[10px] font-bold">
                                {activeFiltersCount}
                            </span>
                        )}
                    </button>

                    {/* Botón exportar Excel */}
                    <button
                        onClick={handleExport}
                        disabled={exporting || loading || !report?.totalItems}
                        className="btn btn-sm btn-primary"
                    >
                        <DownloadIcon className="w-4 h-4" />
                        <span className="hidden sm:inline">
                            {exporting ? "Exportando..." : "Exportar Excel"}
                        </span>
                    </button>
                </div>
            }
        >
            <div className="space-y-6">
                {/* Panel de filtros desplegable o toggle desde el botón de arriba */}
                {filtersOpen && (
                    <div className="bg-[#151519] border border-white/10 rounded-2xl p-4 space-y-3 animate-in fade-in duration-200">
                        <div className="flex items-center justify-between border-b border-white/10 pb-2">
                            <span className="text-xs font-semibold text-slate-300">
                                Filtrar resultados
                            </span>
                            {hasFilters && (
                                <button
                                    onClick={clearFilters}
                                    className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors"
                                >
                                    <XIcon className="w-3.5 h-3.5" />
                                    Limpiar filtros
                                </button>
                            )}
                        </div>
                        <div className="flex flex-wrap gap-3 items-end">
                            <label className="flex flex-col gap-1 text-[11px] text-slate-400">
                                Desde
                                <input
                                    type="date"
                                    value={from}
                                    max={to || undefined}
                                    onChange={(e) => setFrom(e.target.value)}
                                    className={fieldClass}
                                />
                            </label>
                            <label className="flex flex-col gap-1 text-[11px] text-slate-400">
                                Hasta
                                <input
                                    type="date"
                                    value={to}
                                    min={from || undefined}
                                    onChange={(e) => setTo(e.target.value)}
                                    className={fieldClass}
                                />
                            </label>
                            <label className="flex flex-col gap-1 text-[11px] text-slate-400">
                                Categoría
                                <select
                                    value={categoryId}
                                    onChange={(e) => setCategoryId(e.target.value)}
                                    className={fieldClass}
                                >
                                    <option value="">Todas</option>
                                    {categories.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.name}
                                        </option>
                                    ))}
                                </select>
                            </label>
                            <label className="flex flex-col gap-1 text-[11px] text-slate-400">
                                Proveedor
                                <select
                                    value={providerId}
                                    onChange={(e) => setProviderId(e.target.value)}
                                    className={fieldClass}
                                >
                                    <option value="">Todos</option>
                                    {providers.map((p) => (
                                        <option key={p.id} value={p.id}>
                                            {p.name}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <label className="flex flex-col gap-1 text-[11px] text-slate-400">
                                Medio de pago
                                <select
                                    value={paymentMethod}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                    className={fieldClass}
                                >
                                    <option value="">Todos</option>
                                    {(report?.paymentMethods ?? []).map((m) => (
                                        <option key={m} value={m}>
                                            {m}
                                        </option>
                                    ))}
                                </select>
                            </label>
                        </div>
                    </div>
                )}


                {/* Tabla única agrupada por venta (estilo Excel con cabeceras de grupo) */}
                <div className="management-table-container rounded-2xl overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 bg-[#151519] border-b border-white/10">
                        <span className="text-xs font-medium text-slate-400">
                            {groupedSales.length}{" "}
                            {groupedSales.length === 1 ? "venta" : "ventas"}
                            {report?.items.length ? ` · ${report.items.length} ítems` : ""}
                        </span>
                        {currentSales.length > 0 && (
                            <button
                                type="button"
                                onClick={toggleAllVisible}
                                className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-gray-200 transition-colors cursor-pointer"
                            >
                                {allVisibleCollapsed ? (
                                    <>
                                        <ChevronsUpDown className="w-3.5 h-3.5" />
                                        <span>Expandir todo</span>
                                    </>
                                ) : (
                                    <>
                                        <ChevronsDownUp className="w-3.5 h-3.5" />
                                        <span>Contraer todo</span>
                                    </>
                                )}
                            </button>
                        )}
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-xs text-left text-slate-300 management-table">
                            <thead className="border-b border-white/10">
                                <tr>
                                    {showProductColumns ? (
                                        <>
                                            <th className="!bg-[#131317] px-4 py-3 text-slate-400">Venta / Producto</th>
                                            <th className="!bg-[#131317] px-4 py-3 text-slate-400">Categoría</th>
                                            <th className="!bg-[#131317] px-4 py-3 text-slate-400">Proveedor</th>
                                            <th className="!bg-[#131317] px-4 py-3 text-center text-slate-400">Cant.</th>
                                            <th className="!bg-[#131317] px-4 py-3 text-right text-slate-400">P. costo</th>
                                            <th className="!bg-[#131317] px-4 py-3 text-right text-slate-400">Ganancia</th>
                                            <th className="!bg-[#131317] px-4 py-3 text-right text-slate-400">P. venta</th>
                                            <th className="!bg-[#131317] px-4 py-3 text-right text-slate-400">Subtotal</th>
                                        </>
                                    ) : (
                                        <>
                                            <th className="!bg-[#131317] px-4 py-3 text-slate-400">Venta</th>
                                            <th className="!bg-[#131317] px-4 py-3 text-center text-slate-400">Unidades</th>
                                            <th className="!bg-[#131317] px-4 py-3 text-right text-slate-400">Costo total</th>
                                            <th className="!bg-[#131317] px-4 py-3 text-right text-slate-400">Ganancia</th>
                                            <th className="!bg-[#131317] px-4 py-3 text-right text-slate-400">Total</th>
                                        </>
                                    )}
                                </tr>
                            </thead>
                            <tbody>
                                {loading && !report ? (
                                    <tr>
                                        <td colSpan={totalColCount} className="px-4 py-10 text-center text-slate-500">
                                            Cargando reporte...
                                        </td>
                                    </tr>
                                ) : groupedSales.length === 0 ? (
                                    <tr>
                                        <td colSpan={totalColCount} className="px-4 py-10 text-center text-slate-500">
                                            No hay ventas completadas con los filtros seleccionados.
                                        </td>
                                    </tr>
                                ) : (
                                    currentSales.map((sale, idx) => {
                                        const isCollapsed = collapsedSales.has(sale.saleId);
                                        const isLastSale = idx === currentSales.length - 1;
                                        return (
                                            <Fragment key={sale.saleId}>
                                                {/* Nivel 2: Fila cabecera de la venta */}
                                                <tr
                                                    onClick={() => toggleSale(sale.saleId)}
                                                    className={`!bg-[#1c1c22] hover:!bg-[#24242d] border-t border-white/10 border-b ${
                                                        isCollapsed
                                                            ? "border-b-white/5 border-l-2 border-l-transparent"
                                                            : "border-b-white/10 border-l-2 border-l-indigo-400/70"
                                                    } cursor-pointer transition-colors ${
                                                        loading ? "opacity-60" : ""
                                                    }`}
                                                >
                                                    <td colSpan={showProductColumns ? 3 : 1} className="px-4 py-3">
                                                        <div className="flex items-center flex-wrap gap-x-3 gap-y-1">
                                                            <span className="inline-flex items-center gap-1.5 font-semibold text-white">
                                                                {isCollapsed ? (
                                                                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                                                                ) : (
                                                                    <ChevronDown className="w-3.5 h-3.5 text-indigo-400" />
                                                                )}
                                                                Venta #{sale.saleId}
                                                            </span>
                                                            <span className="text-slate-400">
                                                                {formatDate(sale.date)} · {formatTime(sale.date)} hs
                                                            </span>
                                                            <span className="px-2 py-0.5 rounded-md bg-white/[0.06] border border-white/10 text-slate-200 text-[11px] font-medium">
                                                                {sale.paymentMethod}
                                                            </span>
                                                            <span className="text-[11px] text-slate-500">
                                                                {sale.products.length}{" "}
                                                                {sale.products.length === 1 ? "producto" : "productos"}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-center font-semibold text-white">
                                                        {sale.totalUnits}
                                                    </td>
                                                    <td className="px-4 py-3 text-right whitespace-nowrap font-medium text-slate-200">
                                                        {money(sale.totalCost)}
                                                    </td>
                                                    <td className="px-4 py-3 text-right whitespace-nowrap font-semibold text-emerald-400">
                                                        {sale.totalMargin != null ? money(sale.totalMargin) : "-"}
                                                    </td>
                                                    {showProductColumns && (
                                                        <td className="px-4 py-3 text-right text-slate-600">
                                                            —
                                                        </td>
                                                    )}
                                                    <td className="px-4 py-3 text-right whitespace-nowrap font-bold text-white">
                                                        {money(sale.total)}
                                                    </td>
                                                </tr>

                                                {/* Nivel 4: Filas de productos de la venta (más hundidas y sutiles) */}
                                                {!isCollapsed &&
                                                    sale.products.map((item) => (
                                                        <tr
                                                            key={item.id}
                                                            className={`!bg-[#111115] hover:!bg-[#18181f] border-b border-white/[0.04] border-l-2 border-l-indigo-400/20 transition-colors ${
                                                                loading ? "opacity-60" : ""
                                                            }`}
                                                        >
                                                            <td className="py-2.5 pl-9 pr-4 text-slate-300">
                                                                {item.productName}
                                                            </td>
                                                            <td className="px-4 py-2.5 text-slate-500 whitespace-nowrap">
                                                                {item.categoryName}
                                                            </td>
                                                            <td className="px-4 py-2.5 text-slate-500 whitespace-nowrap">
                                                                {item.providerName}
                                                            </td>
                                                            <td className="px-4 py-2.5 text-center text-slate-400">
                                                                {item.quantity}
                                                            </td>
                                                            <td className="px-4 py-2.5 text-right whitespace-nowrap text-slate-500">
                                                                {money(item.costPrice)}
                                                            </td>
                                                            <td className="px-4 py-2.5 text-right whitespace-nowrap text-emerald-400/65">
                                                                {item.margin != null ? money(item.margin) : "-"}
                                                            </td>
                                                            <td className="px-4 py-2.5 text-right whitespace-nowrap text-slate-400">
                                                                {money(item.unitaryPrice)}
                                                            </td>
                                                            <td className="px-4 py-2.5 text-right whitespace-nowrap font-medium text-slate-200">
                                                                {money(item.subtotal)}
                                                            </td>
                                                        </tr>
                                                    ))}

                                                {/* Espaciador visual entre el último producto expandido y la siguiente venta */}
                                                {!isCollapsed && !isLastSale && (
                                                    <tr className="h-3 !bg-[#0c0c0f] hover:!bg-[#0c0c0f] border-none">
                                                        <td colSpan={totalColCount} className="p-0" />
                                                    </tr>
                                                )}
                                            </Fragment>
                                        );
                                    })
                                )}
                            </tbody>

                            {/* Nivel 1: Fila de Total General del período filtrado */}
                            {groupedSales.length > 0 && (
                                <tfoot>
                                    <tr className="!bg-[#22222a] border-t-2 border-white/20 font-bold text-white">
                                        <td colSpan={showProductColumns ? 3 : 1} className="px-4 py-3.5 text-xs uppercase tracking-wider text-slate-200">
                                            Total general ({groupedSales.length}{" "}
                                            {groupedSales.length === 1 ? "venta" : "ventas"})
                                        </td>
                                        <td className="px-4 py-3.5 text-center text-white">
                                            {grandTotals.units}
                                        </td>
                                        <td className="px-4 py-3.5 text-right whitespace-nowrap text-slate-200">
                                            {money(grandTotals.cost)}
                                        </td>
                                        <td className="px-4 py-3.5 text-right whitespace-nowrap text-emerald-300">
                                            {grandTotals.margin != null ? money(grandTotals.margin) : "-"}
                                        </td>
                                        {showProductColumns && (
                                            <td className="px-4 py-3.5 text-right text-slate-600">
                                                —
                                            </td>
                                        )}
                                        <td className="px-4 py-3.5 text-right whitespace-nowrap text-white">
                                            {money(grandTotals.total)}
                                        </td>
                                    </tr>
                                </tfoot>
                            )}
                        </table>
                    </div>
                </div>

                {groupedSales.length > itemsPerPage && (
                    <Pagination
                        totalItems={groupedSales.length}
                        itemsPerPage={itemsPerPage}
                        currentPage={page}
                        onPageChange={setPage}
                    />
                )}
            </div>
        </DashboardLayout>
    );
}
