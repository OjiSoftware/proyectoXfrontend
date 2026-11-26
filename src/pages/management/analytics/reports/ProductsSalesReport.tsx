import { Fragment, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
    ChevronDown,
    ChevronRight,
    ChevronsDownUp,
    ChevronsUpDown,
    DownloadIcon,
    Filter,
    XIcon,
} from "lucide-react";
import DashboardLayout from "@/layouts/DashboardLayout";
import SearchBar from "@/components/SearchBar";
import Pagination from "@/components/PaginationManagement";
import { useItemsPerpage } from "@/hooks/useItemsPerpage";
import { reportApi } from "@/services/ReportService";
import { productApi } from "@/services/ProductService";
import { exportExcel, type ExcelCell } from "@/helpers/excelExport";
import type { SalesReportItem, SalesReportResult } from "@/types/report.types";
import { ReportTabs } from "./ReportTabs";

interface Option {
    id: number;
    name: string;
}

interface GroupedProduct {
    productName: string;
    categoryName: string;
    providerName: string;
    entries: SalesReportItem[];
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

export default function ProductsSalesReport() {
    const itemsPerPage = useItemsPerpage();

    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [providerId, setProviderId] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("");
    const [searchInput, setSearchInput] = useState("");
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [filtersOpen, setFiltersOpen] = useState(false);

    const [categories, setCategories] = useState<Option[]>([]);
    const [providers, setProviders] = useState<Option[]>([]);

    const [report, setReport] = useState<SalesReportResult | null>(null);
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);
    const [collapsedProducts, setCollapsedProducts] = useState<Set<string>>(new Set());

    useEffect(() => {
        Promise.all([
            productApi.getAllCategories(),
            productApi.getAllProviders(),
        ])
            .then(([cats, provs]) => {
                setCategories(cats.map((c: any) => ({ id: c.id, name: c.name })));
                setProviders(
                    provs.map((p: any) => ({
                        id: p.id,
                        name: p.name || p.businessName || `Proveedor #${p.id}`,
                    })),
                );
            })
            .catch(() => toast.error("No se pudieron cargar los filtros"));
    }, []);

    useEffect(() => {
        const t = setTimeout(() => setSearch(searchInput.trim()), 350);
        return () => clearTimeout(t);
    }, [searchInput]);

    useEffect(() => {
        setPage(1);
    }, [from, to, categoryId, providerId, paymentMethod, search]);

    const filters = useMemo(
        () => ({
            from: from || undefined,
            to: to || undefined,
            categoryId: categoryId ? Number(categoryId) : undefined,
            providerId: providerId ? Number(providerId) : undefined,
            paymentMethod: paymentMethod || undefined,
            search: search || undefined,
        }),
        [from, to, categoryId, providerId, paymentMethod, search],
    );

    useEffect(() => {
        const controller = new AbortController();
        setLoading(true);
        reportApi
            .getSalesReport(filters, controller.signal)
            .then((data) => {
                setReport(data);
                setCollapsedProducts(new Set());
            })
            .catch((err) => {
                if (err?.name !== "AbortError") toast.error("No se pudo cargar el reporte");
            })
            .finally(() => {
                if (!controller.signal.aborted) setLoading(false);
            });
        return () => controller.abort();
    }, [filters]);

    // Agrupación por producto
    const groupedProducts = useMemo<GroupedProduct[]>(() => {
        if (!report?.items?.length) return [];
        const map = new Map<string, GroupedProduct>();

        for (const item of report.items) {
            const key = item.productName || "Sin nombre";
            const lineCost = (item.costPrice || 0) * (item.quantity || 0);
            const existing = map.get(key);

            if (!existing) {
                map.set(key, {
                    productName: key,
                    categoryName: item.categoryName,
                    providerName: item.providerName,
                    entries: [item],
                    totalUnits: item.quantity || 0,
                    totalCost: lineCost,
                    totalMargin: item.margin != null ? item.margin : null,
                    total: item.subtotal || 0,
                });
            } else {
                existing.entries.push(item);
                existing.totalUnits += item.quantity || 0;
                existing.totalCost += lineCost;
                if (item.margin != null) {
                    existing.totalMargin = (existing.totalMargin ?? 0) + item.margin;
                }
                existing.total += item.subtotal || 0;
            }
        }

        return Array.from(map.values()).sort((a, b) => b.total - a.total);
    }, [report]);

    const currentProducts = useMemo(() => {
        const start = (page - 1) * itemsPerPage;
        return groupedProducts.slice(start, start + itemsPerPage);
    }, [groupedProducts, page, itemsPerPage]);

    const grandTotals = useMemo(() => {
        let units = 0;
        let cost = 0;
        let margin: number | null = null;
        let total = 0;

        for (const p of groupedProducts) {
            units += p.totalUnits;
            cost += p.totalCost;
            if (p.totalMargin != null) margin = (margin ?? 0) + p.totalMargin;
            total += p.total;
        }
        return { units, cost, margin, total };
    }, [groupedProducts]);

    const toggleProduct = (productName: string) => {
        setCollapsedProducts((prev) => {
            const next = new Set(prev);
            if (next.has(productName)) next.delete(productName);
            else next.add(productName);
            return next;
        });
    };

    const allVisibleCollapsed =
        currentProducts.length > 0 &&
        currentProducts.every((p) => collapsedProducts.has(p.productName));

    const showDetailColumns = !allVisibleCollapsed;
    const totalColCount = showDetailColumns ? 8 : 5;

    const selectedCategoryLabel =
        categories.find((c) => String(c.id) === categoryId)?.name ?? "Todas";
    const selectedProviderLabel =
        providers.find((p) => String(p.id) === providerId)?.name ?? "Todos";

    const toggleAllVisible = () => {
        setCollapsedProducts((prev) => {
            const next = new Set(prev);
            if (allVisibleCollapsed) {
                currentProducts.forEach((p) => next.delete(p.productName));
            } else {
                currentProducts.forEach((p) => next.add(p.productName));
            }
            return next;
        });
    };

    const activeFiltersCount = [
        from,
        to,
        categoryId,
        providerId,
        paymentMethod,
    ].filter(Boolean).length;

    const hasFilters = Object.values(filters).some((v) => v !== undefined);

    const clearFilters = () => {
        setFrom("");
        setTo("");
        setCategoryId("");
        setProviderId("");
        setPaymentMethod("");
        setSearchInput("");
        setSearch("");
    };

    const handleExport = async () => {
        if (!groupedProducts.length) {
            toast.error("No hay datos para exportar con los filtros actuales");
            return;
        }
        setExporting(true);
        try {
            const rows: Record<string, ExcelCell>[] = [];
            for (const prod of groupedProducts) {
                prod.entries.forEach((entry, idx) => {
                    rows.push({
                        Nombre: idx === 0 ? prod.productName : "",
                        Venta: `#${entry.saleId}`,
                        Cantidad: entry.quantity,
                        Fecha: formatDate(entry.date),
                        Hora: formatTime(entry.date),
                        Costo: entry.costPrice,
                        Ganancia: entry.margin ?? 0,
                        "Precio unitario": entry.unitaryPrice,
                        Subtotal: entry.subtotal,
                    });
                });
                rows.push({
                    Nombre: `TOTAL ${prod.productName}`,
                    Venta: "",
                    Cantidad: prod.totalUnits,
                    Fecha: "",
                    Hora: "",
                    Costo: prod.totalCost,
                    Ganancia: prod.totalMargin ?? 0,
                    "Precio unitario": "",
                    Subtotal: prod.total,
                });
            }
            rows.push({
                Nombre: "TOTAL GENERAL",
                Venta: "",
                Cantidad: grandTotals.units,
                Fecha: "",
                Hora: "",
                Costo: grandTotals.cost,
                Ganancia: grandTotals.margin ?? 0,
                "Precio unitario": "",
                Subtotal: grandTotals.total,
            });

            exportExcel({
                fileName: `reporte-ventas-por-producto-${new Date().toISOString().slice(0, 10)}`,
                sheets: [
                    {
                        name: "Ventas por producto",
                        headers: [
                            "Nombre",
                            "Venta",
                            "Cantidad",
                            "Fecha",
                            "Hora",
                            "Costo",
                            "Ganancia",
                            "Precio unitario",
                            "Subtotal",
                        ],
                        rows,
                    },
                ],
            });
            toast.success("Reporte por productos exportado a Excel.");
        } catch {
            toast.error("No se pudo exportar el reporte");
        } finally {
            setExporting(false);
        }
    };

    return (
        <DashboardLayout
            title="Ventas por producto"
            subtitle="Historial de ventas agrupado por producto, con fecha, hora, costos y ganancias."
            backUrl="/management/analytics/sales"
            actions={
                <div className="flex items-center gap-2">
                    <div className="w-56 lg:w-72">
                        <SearchBar
                            value={searchInput}
                            onChange={setSearchInput}
                            placeholder="Buscar producto..."
                            containerClassName="w-full"
                            inputClassName="bg-[#151519] text-white text-xs border-white/10 placeholder:text-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all rounded-xl h-9"
                        />
                    </div>

                    <button
                        type="button"
                        onClick={() => setFiltersOpen((prev) => !prev)}
                        className={`btn btn-sm ${
                            filtersOpen || activeFiltersCount > 0
                                ? "btn-primary"
                                : "btn-subtle"
                        }`}
                        title="Filtrar por fecha, categoría, proveedor..."
                    >
                        <Filter className="w-4 h-4" />
                        <span className="hidden sm:inline">Filtros</span>
                        {activeFiltersCount > 0 && (
                            <span className="ml-0.5 px-1.5 py-0.2 rounded-full bg-indigo-500 text-white text-[10px] font-bold">
                                {activeFiltersCount}
                            </span>
                        )}
                    </button>

                    <button
                        onClick={handleExport}
                        disabled={exporting || loading || groupedProducts.length === 0}
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
            <div className="space-y-5">
                <ReportTabs />

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

                {/* Tabla agrupada por producto */}
                <div className="management-table-container rounded-2xl overflow-hidden">
                    <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 bg-[#151519] border-b border-white/10">
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
                            <span className="font-medium">
                                {groupedProducts.length}{" "}
                                {groupedProducts.length === 1 ? "producto" : "productos"}
                                {report?.items.length ? ` · ${report.items.length} registros` : ""}
                            </span>
                            <span className="text-white/15 hidden sm:inline">|</span>
                            <span>
                                Categoría:{" "}
                                <strong className="text-slate-200 font-medium">
                                    {selectedCategoryLabel}
                                </strong>
                            </span>
                            <span>
                                Proveedor:{" "}
                                <strong className="text-slate-200 font-medium">
                                    {selectedProviderLabel}
                                </strong>
                            </span>
                        </div>
                        {currentProducts.length > 0 && (
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
                                <tr className="border-l-2 border-l-transparent">
                                    {showDetailColumns ? (
                                        <>
                                            <th className="!bg-[#131317] pl-4 pr-6 py-3 text-slate-400">
                                                <div className="flex items-center justify-between gap-4">
                                                    <span className="pl-5">Producto</span>
                                                    <span>Venta</span>
                                                </div>
                                            </th>
                                            <th className="!bg-[#131317] w-24 px-4 py-3 text-center text-slate-400">Cant.</th>
                                            <th className="!bg-[#131317] w-28 px-4 py-3 text-center text-slate-400">Fecha</th>
                                            <th className="!bg-[#131317] w-24 px-4 py-3 text-center text-slate-400">Hora</th>
                                            <th className="!bg-[#131317] w-32 px-4 py-3 text-right text-slate-400 whitespace-nowrap">Costo</th>
                                            <th className="!bg-[#131317] w-32 px-4 py-3 text-right text-slate-400 whitespace-nowrap">Ganancia</th>
                                            <th className="!bg-[#131317] w-32 px-4 py-3 text-right text-slate-400 whitespace-nowrap">P. unitario</th>
                                            <th className="!bg-[#131317] w-36 px-4 py-3 text-right text-slate-400 whitespace-nowrap">Subtotal</th>
                                        </>
                                    ) : (
                                        <>
                                            <th className="!bg-[#131317] pl-9 pr-4 py-3 text-slate-400">Producto</th>
                                            <th className="!bg-[#131317] w-28 px-4 py-3 text-center text-slate-400">Cantidad</th>
                                            <th className="!bg-[#131317] w-36 px-4 py-3 text-right text-slate-400 whitespace-nowrap">Costo total</th>
                                            <th className="!bg-[#131317] w-36 px-4 py-3 text-right text-slate-400 whitespace-nowrap">Ganancia</th>
                                            <th className="!bg-[#131317] w-36 px-4 py-3 text-right text-slate-400 whitespace-nowrap">Total</th>
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
                                ) : groupedProducts.length === 0 ? (
                                    <tr>
                                        <td colSpan={totalColCount} className="px-4 py-10 text-center text-slate-500">
                                            No hay ventas completadas con los filtros seleccionados.
                                        </td>
                                    </tr>
                                ) : (
                                    currentProducts.map((prod, idx) => {
                                        const isCollapsed = collapsedProducts.has(prod.productName);
                                        const isLast = idx === currentProducts.length - 1;
                                        return (
                                            <Fragment key={prod.productName}>
                                                {/* Cabecera del producto (con sus totales) */}
                                                <tr
                                                    onClick={() => toggleProduct(prod.productName)}
                                                    className={`!bg-[#1c1c22] hover:!bg-[#24242d] border-t border-white/10 border-b ${
                                                        isCollapsed
                                                            ? "border-b-white/5 border-l-2 border-l-transparent"
                                                            : "border-b-white/10 border-l-2 border-l-indigo-400/70"
                                                    } cursor-pointer transition-colors ${
                                                        loading ? "opacity-60" : ""
                                                    }`}
                                                >
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center flex-wrap gap-x-3 gap-y-1">
                                                            <span className="inline-flex items-center gap-1.5 font-semibold text-white">
                                                                {isCollapsed ? (
                                                                    <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                                                ) : (
                                                                    <ChevronDown className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                                                                )}
                                                                {prod.productName}
                                                            </span>
                                                            <span className="text-[11px] text-slate-500">
                                                                {prod.entries.length}{" "}
                                                                {prod.entries.length === 1 ? "venta" : "ventas"}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-center font-semibold text-white tabular-nums">
                                                        {prod.totalUnits}
                                                    </td>
                                                    {showDetailColumns && (
                                                        <>
                                                            <td className="px-4 py-3 text-center text-slate-600">—</td>
                                                            <td className="px-4 py-3 text-center text-slate-600">—</td>
                                                        </>
                                                    )}
                                                    <td className="px-4 py-3 text-right whitespace-nowrap font-medium text-slate-200 tabular-nums">
                                                        {money(prod.totalCost)}
                                                    </td>
                                                    <td className="px-4 py-3 text-right whitespace-nowrap font-semibold text-emerald-400 tabular-nums">
                                                        {prod.totalMargin != null ? money(prod.totalMargin) : "-"}
                                                    </td>
                                                    {showDetailColumns && (
                                                        <td className="px-4 py-3 text-right text-slate-600 tabular-nums">
                                                            —
                                                        </td>
                                                    )}
                                                    <td className="px-4 py-3 text-right whitespace-nowrap font-bold text-white tabular-nums">
                                                        {money(prod.total)}
                                                    </td>
                                                </tr>

                                                {/* Movimientos (fechas/horas de venta del producto) */}
                                                {!isCollapsed &&
                                                    prod.entries.map((entry) => (
                                                        <tr
                                                            key={entry.id}
                                                            className={`!bg-[#111115] hover:!bg-[#18181f] border-b border-white/[0.04] border-l-2 border-l-indigo-400/20 transition-colors ${
                                                                loading ? "opacity-60" : ""
                                                            }`}
                                                        >
                                                            <td className="py-2.5 pl-9 pr-6 text-right text-slate-400">
                                                                <span className="text-slate-300 font-medium">
                                                                    Venta #{entry.saleId}
                                                                </span>
                                                                <span className="ml-2 text-[11px] text-slate-500">
                                                                    · {entry.paymentMethod}
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-2.5 text-center text-slate-400 tabular-nums">
                                                                {entry.quantity}
                                                            </td>
                                                            <td className="px-4 py-2.5 text-center text-slate-400 whitespace-nowrap tabular-nums">
                                                                {formatDate(entry.date)}
                                                            </td>
                                                            <td className="px-4 py-2.5 text-center text-slate-500 whitespace-nowrap tabular-nums">
                                                                {formatTime(entry.date)} hs
                                                            </td>
                                                            <td className="px-4 py-2.5 text-right whitespace-nowrap text-slate-500 tabular-nums">
                                                                {money(entry.costPrice)}
                                                            </td>
                                                            <td className="px-4 py-2.5 text-right whitespace-nowrap text-emerald-400/65 tabular-nums">
                                                                {entry.margin != null ? money(entry.margin) : "-"}
                                                            </td>
                                                            <td className="px-4 py-2.5 text-right whitespace-nowrap text-slate-400 tabular-nums">
                                                                {money(entry.unitaryPrice)}
                                                            </td>
                                                            <td className="px-4 py-2.5 text-right whitespace-nowrap font-medium text-slate-200 tabular-nums">
                                                                {money(entry.subtotal)}
                                                            </td>
                                                        </tr>
                                                    ))}

                                                {!isCollapsed && !isLast && (
                                                    <tr className="h-3 !bg-[#0c0c0f] hover:!bg-[#0c0c0f] border-none">
                                                        <td colSpan={totalColCount} className="p-0" />
                                                    </tr>
                                                )}
                                            </Fragment>
                                        );
                                    })
                                )}
                            </tbody>

                            {groupedProducts.length > 0 && (
                                <tfoot>
                                    <tr className="!bg-[#22222a] border-t-2 border-white/20 border-l-2 border-l-transparent font-bold text-white">
                                        <td className="pl-9 pr-4 py-3.5 text-xs uppercase tracking-wider text-slate-200">
                                            Total general ({groupedProducts.length}{" "}
                                            {groupedProducts.length === 1 ? "producto" : "productos"})
                                        </td>
                                        <td className="px-4 py-3.5 text-center text-white tabular-nums">
                                            {grandTotals.units}
                                        </td>
                                        {showDetailColumns && (
                                            <>
                                                <td className="px-4 py-3.5 text-center text-slate-600">—</td>
                                                <td className="px-4 py-3.5 text-center text-slate-600">—</td>
                                            </>
                                        )}
                                        <td className="px-4 py-3.5 text-right whitespace-nowrap text-slate-200 tabular-nums">
                                            {money(grandTotals.cost)}
                                        </td>
                                        <td className="px-4 py-3.5 text-right whitespace-nowrap text-emerald-300 tabular-nums">
                                            {grandTotals.margin != null ? money(grandTotals.margin) : "-"}
                                        </td>
                                        {showDetailColumns && (
                                            <td className="px-4 py-3.5 text-right text-slate-600 tabular-nums">
                                                —
                                            </td>
                                        )}
                                        <td className="px-4 py-3.5 text-right whitespace-nowrap text-white tabular-nums">
                                            {money(grandTotals.total)}
                                        </td>
                                    </tr>
                                </tfoot>
                            )}
                        </table>
                    </div>
                </div>

                {groupedProducts.length > itemsPerPage && (
                    <Pagination
                        totalItems={groupedProducts.length}
                        itemsPerPage={itemsPerPage}
                        currentPage={page}
                        onPageChange={setPage}
                    />
                )}
            </div>
        </DashboardLayout>
    );
}
