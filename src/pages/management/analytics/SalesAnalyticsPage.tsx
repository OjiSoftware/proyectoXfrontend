import { useEffect, useState } from "react";
import {
    BarChart3,
    TrendingUp,
    TrendingDown,
    DollarSign,
    Receipt,
    ShoppingBag,
    Package,
} from "lucide-react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { ReportTabs } from "./reports/ReportTabs";
import { reportApi } from "@/services/ReportService";
import type { KpiGroupBy, SalesKpisResult } from "@/types/report.types";

const formatCurrency = (value: number) =>
    new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency: "ARS",
        maximumFractionDigits: 2,
    }).format(value);

const toInputDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};

const formatDisplayDate = (isoDate: string) => {
    const [year, month, day] = isoDate.split("-");
    return `${day}/${month}/${year}`;
};

const getPresetRange = (preset: "today" | "7d" | "30d" | "month") => {
    const now = new Date();
    const today = toInputDate(now);

    if (preset === "today") return { from: today, to: today };
    if (preset === "7d") {
        const start = new Date(now);
        start.setDate(start.getDate() - 6);
        return { from: toInputDate(start), to: today };
    }
    if (preset === "30d") {
        const start = new Date(now);
        start.setDate(start.getDate() - 29);
        return { from: toInputDate(start), to: today };
    }
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    return { from: toInputDate(startOfMonth), to: today };
};

const DATE_PRESETS: { id: "today" | "7d" | "30d" | "month"; label: string }[] = [
    { id: "today", label: "Hoy" },
    { id: "7d", label: "7 días" },
    { id: "30d", label: "30 días" },
    { id: "month", label: "Este mes" },
];

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
                    className="mgmt-surface rounded-2xl p-6 space-y-5"
                >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                            <h2 className="text-lg font-semibold text-[var(--text-primary)]">
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
                                        className={`px-2.5 py-1 text-xs font-medium rounded-lg border transition-colors ${
                                            active
                                                ? "bg-indigo-600 text-white border-indigo-600"
                                                : "bg-[var(--bg-subtle)] text-[var(--text-muted)] border-transparent hover:text-[var(--text-primary)]"
                                        }`}
                                    >
                                        {preset.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

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
                                className="input input-sm"
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
                                className="input input-sm"
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
                            <div className="mt-2 flex items-center gap-1.5 text-xs">
                                {growth === null ? (
                                    <span className="text-[var(--text-muted)]">
                                        Sin período anterior para comparar
                                    </span>
                                ) : (
                                    <span
                                        className={`inline-flex items-center gap-1 font-medium ${
                                            growth >= 0 ? "text-emerald-400" : "text-red-400"
                                        }`}
                                    >
                                        {growth >= 0 ? (
                                            <TrendingUp className="w-3.5 h-3.5" />
                                        ) : (
                                            <TrendingDown className="w-3.5 h-3.5" />
                                        )}
                                        {growth >= 0 ? "+" : ""}
                                        {growth}% vs período anterior
                                    </span>
                                )}
                            </div>
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
                            <p className="mt-2 text-xs text-[var(--text-muted)]">
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
                            <p className="mt-2 text-xs text-[var(--text-muted)]">
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
                            <p className="mt-2 text-xs text-[var(--text-muted)]">
                                {loading ? "..." : `${data?.unitsSold ?? 0} unidades vendidas`}
                            </p>
                        </div>
                    </div>
                </section>

                {/* Serie de transacciones por período + menú de reportes */}
                <div className="flex flex-col md:flex-row gap-6 items-start">
                    <div className="w-full md:flex-1 min-w-0 mgmt-surface rounded-2xl p-6 space-y-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="flex items-center gap-2.5">
                                <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                                    <BarChart3 className="w-5 h-5" />
                                </div>
                                <div>
                                    <h2 className="text-base font-semibold text-[var(--text-primary)]">
                                        Transacciones por período
                                    </h2>
                                    <p className="text-xs text-[var(--text-muted)]">
                                        Cantidad de ventas cerradas y facturación agrupada
                                    </p>
                                </div>
                            </div>

                            {/* Selector de agrupación del gráfico */}
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-[var(--text-muted)] hidden sm:inline">
                                    Agrupar:
                                </span>
                                <div className="flex items-center gap-1 rounded-xl bg-[var(--bg-subtle)] p-1">
                                    {GROUP_BY_OPTIONS.map((opt) => (
                                        <button
                                            key={opt.value}
                                            type="button"
                                            onClick={() => setGroupBy(opt.value)}
                                            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                                                groupBy === opt.value
                                                    ? "bg-indigo-600 text-white"
                                                    : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                                            }`}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {loading ? (
                            <p className="text-sm text-[var(--text-muted)] py-6 text-center">
                                Cargando métricas...
                            </p>
                        ) : !data?.transactionsByPeriod.length ? (
                            <p className="text-sm text-[var(--text-muted)] py-6 text-center">
                                No hay transacciones registradas en el período seleccionado.
                            </p>
                        ) : (
                            <div className="space-y-2.5">
                                {data.transactionsByPeriod.map((point) => {
                                    const widthPct = Math.max(
                                        Math.round((point.totalSales / maxPeriodSales) * 100),
                                        2,
                                    );
                                    return (
                                        <div
                                            key={point.period}
                                            className="grid grid-cols-12 items-center gap-3 text-xs"
                                        >
                                            <span className="col-span-3 sm:col-span-2 font-medium text-[var(--text-primary)]">
                                                {point.period}
                                            </span>
                                            <div className="col-span-5 sm:col-span-7 h-2.5 rounded-full bg-[var(--bg-subtle)] overflow-hidden">
                                                <div
                                                    className="h-full rounded-full bg-indigo-500"
                                                    style={{ width: `${widthPct}%` }}
                                                />
                                            </div>
                                            <span className="col-span-4 sm:col-span-3 text-right text-[var(--text-muted)]">
                                                {point.count} tx · {formatCurrency(point.totalSales)}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    <div className="w-full md:w-64 shrink-0">
                        <ReportTabs variant="menu" />
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
