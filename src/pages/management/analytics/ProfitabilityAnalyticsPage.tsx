import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
    Coins,
    DollarSign,
    FileSpreadsheet,
    PiggyBank,
    Percent,
    TrendingUp,
} from "lucide-react";
import DashboardLayout from "@/layouts/DashboardLayout";
import Pagination from "@/components/PaginationManagement";
import { useItemsPerpage } from "@/hooks/useItemsPerpage";
import { reportApi } from "@/services/ReportService";
import {
    DATE_PRESETS,
    formatDisplayDate,
    getPresetRange,
} from "@/helpers/dateRange.helper";
import type { ProfitabilityResult } from "@/types/report.types";

const formatCurrency = (value: number) =>
    new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency: "ARS",
        maximumFractionDigits: 2,
    }).format(value);

const formatPercent = (value: number | null) =>
    value === null ? "-" : `${value.toLocaleString("es-AR", { maximumFractionDigits: 2 })}%`;

const fieldClass =
    "report-filter-input text-xs rounded-xl h-9 px-3 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none";

export default function ProfitabilityAnalyticsPage() {
    const itemsPerPage = useItemsPerpage();

    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");
    const [page, setPage] = useState(1);
    const [data, setData] = useState<ProfitabilityResult | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const controller = new AbortController();
        setLoading(true);
        setError(null);

        reportApi
            .getProfitability(
                {
                    from: from || undefined,
                    to: to || undefined,
                },
                controller.signal,
            )
            .then((res) => setData(res))
            .catch((err) => {
                if (err instanceof DOMException && err.name === "AbortError") return;
                setError(err instanceof Error ? err.message : "Error al cargar la rentabilidad");
            })
            .finally(() => {
                if (!controller.signal.aborted) setLoading(false);
            });

        return () => controller.abort();
    }, [from, to]);

    // Cualquier cambio de rango vuelve a la página 1
    useEffect(() => {
        setPage(1);
    }, [from, to]);

    const products = data?.products ?? [];
    const currentProducts = useMemo(() => {
        const start = (page - 1) * itemsPerPage;
        return products.slice(start, start + itemsPerPage);
    }, [products, page, itemsPerPage]);

    const kpis = data?.kpis;

    const activeRangeLabel = (() => {
        if (!from && !to) return "Últimos 30 días";
        if (from && to) {
            return from === to
                ? formatDisplayDate(from)
                : `${formatDisplayDate(from)} al ${formatDisplayDate(to)}`;
        }
        if (from) return `Desde ${formatDisplayDate(from)}`;
        return `Hasta ${formatDisplayDate(to)}`;
    })();

    const isPresetActive = (presetId: "today" | "7d" | "30d" | "month") => {
        const range = getPresetRange(presetId);
        return from === range.from && to === range.to;
    };

    const applyPreset = (presetId: "today" | "7d" | "30d" | "month") => {
        const range = getPresetRange(presetId);
        setFrom(range.from);
        setTo(range.to);
    };

    return (
        <DashboardLayout
            title="Analíticas · Rentabilidad"
            subtitle="Márgenes, rentabilidad por producto y utilidad del período."
            backUrl="/management/analytics"
            actions={
                <div className="flex items-center gap-2">
                    <Link to="/management/analytics/sales/reports" className="btn btn-sm btn-primary">
                        <FileSpreadsheet className="w-4 h-4" />
                        <span>Reportes de ventas</span>
                    </Link>
                </div>
            }
        >
            <div className="space-y-6">
                {/* Acciones visibles también en mobile */}
                <div className="flex flex-wrap items-center gap-2 md:hidden">
                    <Link to="/management/analytics/sales/reports" className="btn btn-sm btn-primary">
                        <FileSpreadsheet className="w-4 h-4" />
                        <span>Reportes de ventas</span>
                    </Link>
                </div>

                {error && (
                    <div className="mgmt-surface rounded-2xl p-4 border border-red-500/30 text-sm text-red-400">
                        {error}
                    </div>
                )}

                {/* Contenedor unificado de KPIs + filtro de rango de fechas */}
                <section
                    aria-label="KPIs de rentabilidad"
                    className="management-table-container rounded-2xl overflow-hidden"
                >
                    <div className="report-topbar flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                        <div>
                            <h2 className="text-sm font-semibold text-[var(--text-primary)]">
                                KPIs
                            </h2>
                            <p className="text-xs text-[var(--text-muted)]">
                                Métricas del período · {activeRangeLabel}
                            </p>
                        </div>

                        {/* Atajos rápidos de rango de fechas */}
                        <div className="flex flex-wrap items-center gap-1.5">
                            {DATE_PRESETS.map((preset) => {
                                const active = isPresetActive(preset.id);
                                return (
                                    <button
                                        key={preset.id}
                                        type="button"
                                        onClick={() => applyPreset(preset.id)}
                                        className={`btn btn-sm ${
                                            active ? "btn-primary" : "btn-subtle"
                                        }`}
                                    >
                                        {preset.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="p-4 space-y-4">
                        {/* Selector manual de fechas */}
                        <div className="flex flex-wrap items-end gap-3">
                            <div>
                                <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">
                                    Desde
                                </label>
                                <input
                                    type="date"
                                    value={from}
                                    max={to || undefined}
                                    onChange={(e) => setFrom(e.target.value)}
                                    className={fieldClass}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">
                                    Hasta
                                </label>
                                <input
                                    type="date"
                                    value={to}
                                    min={from || undefined}
                                    onChange={(e) => setTo(e.target.value)}
                                    className={fieldClass}
                                />
                            </div>
                            {(from || to) && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setFrom("");
                                        setTo("");
                                    }}
                                    className="btn btn-sm btn-ghost"
                                >
                                    Limpiar fechas
                                </button>
                            )}
                        </div>

                        {/* 4 KPIs principales en una sola grilla con separadores */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 lg:divide-x divide-[var(--border-subtle)] pt-4 border-t border-[var(--border-subtle)]">
                            {/* 1. Margen bruto */}
                            <div className="py-3 lg:py-0 lg:pr-5">
                                <div className="flex items-center justify-between">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                                        Margen bruto
                                    </p>
                                    <Percent className="w-4 h-4 text-indigo-400" />
                                </div>
                                <p className="mt-3 text-2xl font-bold text-[var(--text-primary)]">
                                    {loading ? "..." : formatPercent(kpis?.grossMarginPercentage ?? 0)}
                                </p>
                                <p className="mt-2 text-xs text-[var(--text-muted)]">
                                    {loading
                                        ? "..."
                                        : `Ganancia bruta: ${formatCurrency(kpis?.grossProfit ?? 0)}`}
                                </p>
                            </div>

                            {/* 2. Ventas */}
                            <div className="py-3 lg:py-0 lg:px-5">
                                <div className="flex items-center justify-between">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                                        Ventas
                                    </p>
                                    <DollarSign className="w-4 h-4 text-indigo-400" />
                                </div>
                                <p className="mt-3 text-2xl font-bold text-[var(--text-primary)]">
                                    {loading ? "..." : formatCurrency(kpis?.totalSales ?? 0)}
                                </p>
                                <p className="mt-2 text-xs text-[var(--text-muted)]">
                                    Ventas completadas del período
                                </p>
                            </div>

                            {/* 3. Costos */}
                            <div className="py-3 lg:py-0 lg:px-5">
                                <div className="flex items-center justify-between">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                                        Costos
                                    </p>
                                    <Coins className="w-4 h-4 text-indigo-400" />
                                </div>
                                <p className="mt-3 text-2xl font-bold text-[var(--text-primary)]">
                                    {loading ? "..." : formatCurrency(kpis?.totalCost ?? 0)}
                                </p>
                                <p className="mt-2 text-xs text-[var(--text-muted)]">
                                    Costo de lo vendido
                                </p>
                            </div>

                            {/* 4. Utilidad neta */}
                            <div className="py-3 lg:py-0 lg:pl-5">
                                <div className="flex items-center justify-between">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                                        Utilidad neta
                                    </p>
                                    <PiggyBank className="w-4 h-4 text-indigo-400" />
                                </div>
                                <p className="mt-3 text-2xl font-bold text-[var(--text-primary)]">
                                    {loading ? "..." : formatCurrency(kpis?.netProfit ?? 0)}
                                </p>
                                <p className="mt-2 text-xs text-[var(--text-muted)]">
                                    {kpis && !kpis.expensesLoaded
                                        ? "Sin gastos cargados: ventas − costos"
                                        : "Ventas − costos − gastos"}
                                </p>
                            </div>
                        </div>

                        {kpis && kpis.productsWithoutCost > 0 && (
                            <p className="text-xs text-amber-400">
                                {kpis.productsWithoutCost}{" "}
                                {kpis.productsWithoutCost === 1
                                    ? "producto vendido no tiene costo cargado"
                                    : "productos vendidos no tienen costo cargado"}
                                : su margen figura más alto del real.
                            </p>
                        )}
                    </div>
                </section>

                {/* Margen por producto */}
                <div className="management-table-container rounded-2xl overflow-hidden">
                    <div className="report-topbar flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                        <div className="flex items-center gap-2.5">
                            <TrendingUp className="w-4 h-4 text-indigo-400" />
                            <div>
                                <h2 className="text-sm font-semibold text-[var(--text-primary)]">
                                    Margen por producto
                                </h2>
                                <p className="text-xs text-[var(--text-muted)]">
                                    Qué productos dejan ganancia en el período
                                </p>
                            </div>
                        </div>
                        <span className="text-xs font-medium text-[var(--text-muted)]">
                            {products.length} {products.length === 1 ? "producto" : "productos"}
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-xs text-left text-[var(--text-secondary)] management-table report-table">
                            <thead className="border-b border-[var(--border-subtle)]">
                                <tr>
                                    <th className="px-4 py-3">Producto</th>
                                    <th className="hidden md:table-cell px-4 py-3">Categoría</th>
                                    <th className="w-24 px-4 py-3 text-center">Unidades</th>
                                    <th className="hidden md:table-cell w-32 px-4 py-3 text-right whitespace-nowrap">Ventas</th>
                                    <th className="hidden md:table-cell w-32 px-4 py-3 text-right whitespace-nowrap">Costo</th>
                                    <th className="w-32 px-4 py-3 text-right whitespace-nowrap">Ganancia</th>
                                    <th className="w-24 px-4 py-3 text-right whitespace-nowrap">Margen</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading && !data ? (
                                    <tr>
                                        <td colSpan={7} className="px-4 py-10 text-center text-slate-500">
                                            Cargando rentabilidad...
                                        </td>
                                    </tr>
                                ) : products.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-4 py-10 text-center text-slate-500">
                                            No hay ventas completadas en el período seleccionado.
                                        </td>
                                    </tr>
                                ) : (
                                    currentProducts.map((product) => {
                                        const isLoss = product.profit < 0;
                                        return (
                                            <tr
                                                key={product.productId}
                                                className={`report-row transition-colors ${
                                                    loading ? "opacity-60" : ""
                                                }`}
                                            >
                                                <td className="px-4 py-3 font-semibold text-[var(--text-primary)]">
                                                    {product.productName}
                                                </td>
                                                <td className="hidden md:table-cell px-4 py-3">
                                                    {product.categoryName}
                                                </td>
                                                <td className="px-4 py-3 text-center tabular-nums">
                                                    {product.unitsSold}
                                                </td>
                                                <td className="hidden md:table-cell px-4 py-3 text-right whitespace-nowrap tabular-nums">
                                                    {formatCurrency(product.revenue)}
                                                </td>
                                                <td className="hidden md:table-cell px-4 py-3 text-right whitespace-nowrap text-[var(--text-muted)] tabular-nums">
                                                    {formatCurrency(product.cost)}
                                                </td>
                                                <td
                                                    className={`px-4 py-3 text-right whitespace-nowrap font-semibold tabular-nums ${
                                                        isLoss ? "text-rose-400" : "text-[var(--text-primary)]"
                                                    }`}
                                                >
                                                    {formatCurrency(product.profit)}
                                                </td>
                                                <td
                                                    className={`px-4 py-3 text-right whitespace-nowrap tabular-nums ${
                                                        isLoss ? "text-rose-400" : ""
                                                    }`}
                                                >
                                                    {formatPercent(product.marginPercentage)}
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {products.length > itemsPerPage && (
                    <Pagination
                        totalItems={products.length}
                        itemsPerPage={itemsPerPage}
                        currentPage={page}
                        onPageChange={setPage}
                    />
                )}
            </div>
        </DashboardLayout>
    );
}
