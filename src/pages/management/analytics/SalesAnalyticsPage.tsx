import { useEffect, useState } from "react";
import {
    BarChart3,
    DollarSign,
    Receipt,
    ShoppingBag,
    Package,
} from "lucide-react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { ReportTabs } from "./reports/ReportTabs";
import GrowthIndicator from "@/components/GrowthIndicator";
import { reportApi } from "@/services/ReportService";
import type { KpiGroupBy, SalesKpisResult } from "@/types/report.types";
import { DATE_PRESETS, formatDisplayDate, getPresetRange } from "@/helpers/dateRange.helper";

const formatCurrency = (value: number) =>
    new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency: "ARS",
        maximumFractionDigits: 2,
    }).format(value);

const GROUP_BY_OPTIONS: { value: KpiGroupBy; label: string }[] = [
    { value: "day", label: "Por día" },
    { value: "week", label: "Por semana" },
    { value: "month", label: "Por mes" },
];

export default function SalesAnalyticsPage() {
    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");
    const [groupBy, setGroupBy] = useState<KpiGroupBy>("day");
    const [data, setData] = useState<SalesKpisResult | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const controller = new AbortController();
        setLoading(true);
        setError(null);

        reportApi
            .getSalesKpis(
                {
                    from: from || undefined,
                    to: to || undefined,
                    groupBy,
                },
                controller.signal,
            )
            .then((res) => setData(res))
            .catch((err) => {
                if (err instanceof DOMException && err.name === "AbortError") return;
                setError(err instanceof Error ? err.message : "Error al cargar KPIs");
            })
            .finally(() => {
                if (!controller.signal.aborted) setLoading(false);
            });

        return () => controller.abort();
    }, [from, to, groupBy]);

    const growth = data?.salesGrowthPercentage ?? null;
    const maxPeriodSales = Math.max(
        ...(data?.transactionsByPeriod.map((p) => p.totalSales) ?? [0]),
        1,
    );

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
            title="Analíticas · Ventas"
            subtitle="Indicadores de desempeño comercial y acceso al reporte de ventas."
            backUrl="/management/analytics"
        >
            <div className="space-y-6">
                {error && (
                    <div className="mgmt-surface rounded-2xl p-4 border border-red-500/30 text-sm text-red-400">
                        {error}
                    </div>
                )}

                {/* Contenedor unificado de KPIs + filtro de rango de fechas */}
                <section
                    aria-label="KPIs de ventas"
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
                                className="report-filter-input text-xs rounded-xl h-9 px-3 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
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
                                className="report-filter-input text-xs rounded-xl h-9 px-3 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
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
                        {/* 1. Ventas totales + Crecimiento */}
                        <div className="py-3 lg:py-0 lg:pr-5">
                            <div className="flex items-center justify-between">
                                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                                    Ventas totales
                                </p>
                                <DollarSign className="w-4 h-4 text-indigo-400" />
                            </div>
                            <p className="mt-3 text-2xl font-bold text-[var(--text-primary)]">
                                {loading ? "..." : formatCurrency(data?.totalSales ?? 0)}
                            </p>
                            <GrowthIndicator value={growth} />
                        </div>

                        {/* 2. Ticket promedio */}
                        <div className="py-3 lg:py-0 lg:px-5">
                            <div className="flex items-center justify-between">
                                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                                    Ticket promedio
                                </p>
                                <Receipt className="w-4 h-4 text-indigo-400" />
                            </div>
                            <p className="mt-3 text-2xl font-bold text-[var(--text-primary)]">
                                {loading ? "..." : formatCurrency(data?.averageTicket ?? 0)}
                            </p>
                            <GrowthIndicator value={data?.ticketGrowthPercentage ?? null} />
                            <p className="mt-1 text-xs text-[var(--text-muted)]">
                                Ventas ÷ transacciones
                            </p>
                        </div>

                        {/* 3. Cantidad de transacciones */}
                        <div className="py-3 lg:py-0 lg:px-5">
                            <div className="flex items-center justify-between">
                                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                                    Transacciones
                                </p>
                                <ShoppingBag className="w-4 h-4 text-indigo-400" />
                            </div>
                            <p className="mt-3 text-2xl font-bold text-[var(--text-primary)]">
                                {loading ? "..." : (data?.transactionsCount ?? 0)}
                            </p>
                            <GrowthIndicator value={data?.transactionsGrowthPercentage ?? null} />
                            <p className="mt-1 text-xs text-[var(--text-muted)]">
                                Ventas cerradas en el período
                            </p>
                        </div>

                        {/* 4. Unidades por transacción */}
                        <div className="py-3 lg:py-0 lg:pl-5">
                            <div className="flex items-center justify-between">
                                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                                    Unidades / transacción
                                </p>
                                <Package className="w-4 h-4 text-indigo-400" />
                            </div>
                            <p className="mt-3 text-2xl font-bold text-[var(--text-primary)]">
                                {loading ? "..." : (data?.unitsPerTransaction ?? 0)}
                            </p>
                            <GrowthIndicator value={data?.unitsPerTransactionGrowthPercentage ?? null} />
                            <p className="mt-1 text-xs text-[var(--text-muted)]">
                                {loading ? "..." : `${data?.unitsSold ?? 0} unidades vendidas`}
                            </p>
                        </div>
                    </div>
                    </div>
                </section>

                {/* Panel de reportes (ancho completo) */}
                <ReportTabs variant="menu" />

                {/* Transacciones por período (tabla, mismo estilo que Productos y Reporte de ventas) */}
                <div className="management-table-container rounded-2xl overflow-hidden">
                    <div className="report-topbar flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                        <div className="flex items-center gap-2.5">
                            <BarChart3 className="w-4 h-4 text-indigo-400" />
                            <div>
                                <h2 className="text-sm font-semibold text-[var(--text-primary)]">
                                    Transacciones por período
                                </h2>
                                <p className="text-xs text-[var(--text-muted)]">
                                    Cantidad de ventas cerradas y facturación agrupada
                                </p>
                            </div>
                        </div>

                        {/* Selector de agrupación */}
                        <div className="flex items-center gap-1.5">
                            <span className="text-xs text-[var(--text-muted)] hidden sm:inline mr-1">
                                Agrupar:
                            </span>
                            {GROUP_BY_OPTIONS.map((opt) => (
                                <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => setGroupBy(opt.value)}
                                    className={`btn btn-sm ${
                                        groupBy === opt.value ? "btn-primary" : "btn-subtle"
                                    }`}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-xs text-left text-[var(--text-secondary)] management-table report-table">
                            <thead className="border-b border-[var(--border-subtle)]">
                                <tr>
                                    <th className="px-4 py-3">Período</th>
                                    <th className="w-32 px-4 py-3 text-center">Transacciones</th>
                                    <th className="w-44 px-4 py-3 text-right whitespace-nowrap">Facturación</th>
                                    <th className="hidden sm:table-cell w-1/3 px-4 py-3">Distribución</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={4} className="px-4 py-10 text-center text-slate-500">
                                            Cargando métricas...
                                        </td>
                                    </tr>
                                ) : !data?.transactionsByPeriod.length ? (
                                    <tr>
                                        <td colSpan={4} className="px-4 py-10 text-center text-slate-500">
                                            No hay transacciones registradas en el período seleccionado.
                                        </td>
                                    </tr>
                                ) : (
                                    data.transactionsByPeriod.map((point) => {
                                        const widthPct = Math.max(
                                            Math.round((point.totalSales / maxPeriodSales) * 100),
                                            2,
                                        );
                                        return (
                                            <tr key={point.period} className="report-row transition-colors">
                                                <td className="px-4 py-3 font-semibold text-[var(--text-primary)]">
                                                    {point.period}
                                                </td>
                                                <td className="px-4 py-3 text-center tabular-nums">
                                                    {point.count}
                                                </td>
                                                <td className="px-4 py-3 text-right whitespace-nowrap font-semibold text-[var(--text-primary)] tabular-nums">
                                                    {formatCurrency(point.totalSales)}
                                                </td>
                                                <td className="hidden sm:table-cell px-4 py-3">
                                                    <div className="h-2 rounded-full bg-[var(--border-subtle)] overflow-hidden">
                                                        <div
                                                            className="h-full rounded-full bg-indigo-500"
                                                            style={{ width: `${widthPct}%` }}
                                                        />
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
