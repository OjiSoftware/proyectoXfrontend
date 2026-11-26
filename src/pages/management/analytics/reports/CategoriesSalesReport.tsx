import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { DownloadIcon, Filter, XIcon } from "lucide-react";
import DashboardLayout from "@/layouts/DashboardLayout";
import SearchBar from "@/components/SearchBar";
import { reportApi } from "@/services/ReportService";
import { productApi } from "@/services/ProductService";
import { exportExcel, type ExcelCell } from "@/helpers/excelExport";
import type { SalesReportResult } from "@/types/report.types";

interface Option {
    id: number;
    name: string;
}

interface GroupedCategory {
    categoryName: string;
    productsCount: number;
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

const fieldClass =
    "mgmt-input text-xs rounded-xl h-9 px-3 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none";

export default function CategoriesSalesReport() {
    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");
    const [providerId, setProviderId] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("");
    const [searchInput, setSearchInput] = useState("");
    const [search, setSearch] = useState("");
    const [filtersOpen, setFiltersOpen] = useState(false);

    const [providers, setProviders] = useState<Option[]>([]);

    const [report, setReport] = useState<SalesReportResult | null>(null);
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);

    useEffect(() => {
        productApi
            .getAllProviders()
            .then((provs) => {
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
        const t = setTimeout(() => setSearch(searchInput.trim().toLowerCase()), 300);
        return () => clearTimeout(t);
    }, [searchInput]);

    const filters = useMemo(
        () => ({
            from: from || undefined,
            to: to || undefined,
            providerId: providerId ? Number(providerId) : undefined,
            paymentMethod: paymentMethod || undefined,
        }),
        [from, to, providerId, paymentMethod],
    );

    useEffect(() => {
        const controller = new AbortController();
        setLoading(true);
        reportApi
            .getSalesReport(filters, controller.signal)
            .then(setReport)
            .catch((err) => {
                if (err?.name !== "AbortError") toast.error("No se pudo cargar el reporte");
            })
            .finally(() => {
                if (!controller.signal.aborted) setLoading(false);
            });
        return () => controller.abort();
    }, [filters]);

    // Agrupación por categoría
    const groupedCategories = useMemo<GroupedCategory[]>(() => {
        if (!report?.items?.length) return [];
        const map = new Map<
            string,
            GroupedCategory & { productSet: Set<string> }
        >();

        for (const item of report.items) {
            const key = item.categoryName || "Sin categoría";
            const lineCost = (item.costPrice || 0) * (item.quantity || 0);
            const existing = map.get(key);

            if (!existing) {
                map.set(key, {
                    categoryName: key,
                    productsCount: 1,
                    productSet: new Set([item.productName]),
                    totalUnits: item.quantity || 0,
                    totalCost: lineCost,
                    totalMargin: item.margin != null ? item.margin : null,
                    total: item.subtotal || 0,
                });
            } else {
                existing.productSet.add(item.productName);
                existing.productsCount = existing.productSet.size;
                existing.totalUnits += item.quantity || 0;
                existing.totalCost += lineCost;
                if (item.margin != null) {
                    existing.totalMargin = (existing.totalMargin ?? 0) + item.margin;
                }
                existing.total += item.subtotal || 0;
            }
        }

        const list = Array.from(map.values())
            .map(({ productSet: _ps, ...rest }) => rest)
            .sort((a, b) => b.total - a.total);

        if (!search) return list;
        return list.filter((c) => c.categoryName.toLowerCase().includes(search));
    }, [report, search]);

    const grandTotals = useMemo(() => {
        let units = 0;
        let cost = 0;
        let margin: number | null = null;
        let total = 0;

        for (const c of groupedCategories) {
            units += c.totalUnits;
            cost += c.totalCost;
            if (c.totalMargin != null) margin = (margin ?? 0) + c.totalMargin;
            total += c.total;
        }
        return { units, cost, margin, total };
    }, [groupedCategories]);

    const selectedProviderLabel =
        providers.find((p) => String(p.id) === providerId)?.name ?? "Todos";

    const activeFiltersCount = [
        from,
        to,
        providerId,
        paymentMethod,
    ].filter(Boolean).length;

    const hasFilters = activeFiltersCount > 0 || search !== "";

    const clearFilters = () => {
        setFrom("");
        setTo("");
        setProviderId("");
        setPaymentMethod("");
        setSearchInput("");
        setSearch("");
    };

    const handleExport = async () => {
        if (!groupedCategories.length) {
            toast.error("No hay datos para exportar con los filtros actuales");
            return;
        }
        setExporting(true);
        try {
            const rows: Record<string, ExcelCell>[] = groupedCategories.map((c) => ({
                Nombre: c.categoryName,
                Cantidad: c.totalUnits,
                Costo: c.totalCost,
                Ganancia: c.totalMargin ?? 0,
                Total: c.total,
            }));

            rows.push({
                Nombre: "SUPER TOTAL",
                Cantidad: grandTotals.units,
                Costo: grandTotals.cost,
                Ganancia: grandTotals.margin ?? 0,
                Total: grandTotals.total,
            });

            exportExcel({
                fileName: `reporte-ventas-por-categoria-${new Date().toISOString().slice(0, 10)}`,
                sheets: [
                    {
                        name: "Ventas por categoría",
                        headers: ["Nombre", "Cantidad", "Costo", "Ganancia", "Total"],
                        rows,
                    },
                ],
            });
            toast.success("Reporte por categorías exportado a Excel.");
        } catch {
            toast.error("No se pudo exportar el reporte");
        } finally {
            setExporting(false);
        }
    };

    return (
        <DashboardLayout
            title="Ventas por categoría"
            subtitle="Resumen acumulado de unidades, costos, ganancias y facturación por categoría."
            backUrl="/management/analytics/sales"
            actions={
                <div className="flex items-center gap-2">
                    <div className="w-56 lg:w-72">
                        <SearchBar
                            value={searchInput}
                            onChange={setSearchInput}
                            placeholder="Buscar categoría..."
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
                        title="Filtrar por fecha, proveedor o medio de pago"
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
                        disabled={exporting || loading || groupedCategories.length === 0}
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
                {filtersOpen && (
                    <div className="mgmt-surface rounded-2xl p-4 space-y-3 animate-in fade-in duration-200">
                        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2">
                            <span className="text-xs font-semibold text-[var(--text-primary)]">
                                Filtrar resultados
                            </span>
                            {hasFilters && (
                                <button
                                    onClick={clearFilters}
                                    className="flex items-center gap-1 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                                >
                                    <XIcon className="w-3.5 h-3.5" />
                                    Limpiar filtros
                                </button>
                            )}
                        </div>
                        <div className="flex flex-wrap gap-3 items-end">
                            <label className="flex flex-col gap-1 text-[11px] text-[var(--text-muted)]">
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

                {/* Tabla resumen por categoría */}
                <div className="management-table-container rounded-2xl overflow-hidden">
                    <div className="report-topbar flex flex-wrap items-center justify-between gap-2 px-4 py-3">
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[var(--text-muted)]">
                            <span className="font-medium">
                                {groupedCategories.length}{" "}
                                {groupedCategories.length === 1 ? "categoría" : "categorías"}
                            </span>
                            <span className="text-[var(--border-strong)] hidden sm:inline">|</span>
                            <span>
                                Proveedor:{" "}
                                <strong className="text-[var(--text-primary)] font-medium">
                                    {selectedProviderLabel}
                                </strong>
                            </span>
                            <span>
                                Pago:{" "}
                                <strong className="text-[var(--text-primary)] font-medium">
                                    {paymentMethod || "Todos"}
                                </strong>
                            </span>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-xs text-left text-[var(--text-secondary)] management-table report-table">
                            <thead className="border-b border-[var(--border-subtle)]">
                                <tr>
                                    <th className="px-4 py-3">Nombre</th>
                                    <th className="w-28 px-4 py-3 text-center">Cantidad</th>
                                    <th className="w-36 px-4 py-3 text-right whitespace-nowrap">Costo</th>
                                    <th className="w-36 px-4 py-3 text-right whitespace-nowrap">Ganancia</th>
                                    <th className="w-36 px-4 py-3 text-right whitespace-nowrap">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading && !report ? (
                                    <tr>
                                        <td colSpan={5} className="px-4 py-10 text-center text-[var(--text-muted)]">
                                            Cargando reporte...
                                        </td>
                                    </tr>
                                ) : groupedCategories.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-4 py-10 text-center text-[var(--text-muted)]">
                                            No hay ventas completadas con los filtros seleccionados.
                                        </td>
                                    </tr>
                                ) : (
                                    groupedCategories.map((cat) => (
                                        <tr
                                            key={cat.categoryName}
                                            className={`report-row transition-colors ${
                                                loading ? "opacity-60" : ""
                                            }`}
                                        >
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2.5">
                                                    <span className="font-semibold text-[var(--text-primary)]">
                                                        {cat.categoryName}
                                                    </span>
                                                    <span className="text-[11px] text-[var(--text-muted)]">
                                                        {cat.productsCount}{" "}
                                                        {cat.productsCount === 1 ? "producto" : "productos"}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-center font-medium text-[var(--text-primary)] tabular-nums">
                                                {cat.totalUnits}
                                            </td>
                                            <td className="px-4 py-3 text-right whitespace-nowrap text-[var(--text-secondary)] tabular-nums">
                                                {money(cat.totalCost)}
                                            </td>
                                            <td className="px-4 py-3 text-right whitespace-nowrap font-semibold text-[var(--report-profit)] tabular-nums">
                                                {cat.totalMargin != null ? money(cat.totalMargin) : "-"}
                                            </td>
                                            <td className="px-4 py-3 text-right whitespace-nowrap font-bold text-[var(--text-primary)] tabular-nums">
                                                {money(cat.total)}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>

                            {groupedCategories.length > 0 && (
                                <tfoot>
                                    <tr className="report-tfoot-row font-bold text-[var(--text-primary)]">
                                        <td className="px-4 py-3.5 text-xs uppercase tracking-wider text-[var(--text-primary)]">
                                            Super total ({groupedCategories.length}{" "}
                                            {groupedCategories.length === 1 ? "categoría" : "categorías"})
                                        </td>
                                        <td className="px-4 py-3.5 text-center text-[var(--text-primary)] tabular-nums">
                                            {grandTotals.units}
                                        </td>
                                        <td className="px-4 py-3.5 text-right whitespace-nowrap text-[var(--text-secondary)] tabular-nums">
                                            {money(grandTotals.cost)}
                                        </td>
                                        <td className="px-4 py-3.5 text-right whitespace-nowrap text-[var(--report-profit-strong)] tabular-nums">
                                            {grandTotals.margin != null ? money(grandTotals.margin) : "-"}
                                        </td>
                                        <td className="px-4 py-3.5 text-right whitespace-nowrap text-[var(--text-primary)] tabular-nums">
                                            {money(grandTotals.total)}
                                        </td>
                                    </tr>
                                </tfoot>
                            )}
                        </table>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
