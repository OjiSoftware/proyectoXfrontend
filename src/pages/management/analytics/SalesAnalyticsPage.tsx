import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    FileSpreadsheet,
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

    return (
        <DashboardLayout
            title="Analíticas · Ventas"
            subtitle="Indicadores de desempeño comercial y acceso al reporte de ventas."
            backUrl="/management/analytics"
        >
            <div className="space-y-6">

                {/* Filtros de período y agrupación */}
                <div className="mgmt-surface rounded-2xl p-4 flex flex-wrap items-end justify-between gap-4">
                    <div className="flex flex-wrap items-end gap-3">
                        <div>
                            <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">
                                Desde
                            </label>
                            <input
                                type="date"
                                value={from}
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

                {error && (
                    <div className="mgmt-surface rounded-2xl p-4 border border-red-500/30 text-sm text-red-400">
                        {error}
                    </div>
                )}

                {/* 4 KPIs principales + Crecimiento */}
                <section aria-label="KPIs de ventas" className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* 1. Ventas totales + 5. Crecimiento */}
                        <div className="mgmt-surface rounded-2xl p-5">
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
                        <div className="mgmt-surface rounded-2xl p-5">
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
                        <div className="mgmt-surface rounded-2xl p-5">
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
                        <div className="mgmt-surface rounded-2xl p-5">
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

                    {/* Serie de transacciones por período + menú de reportes */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                        <div className="lg:col-span-9 mgmt-surface rounded-2xl p-6 space-y-4">
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

                            <Link
                                to="/management/analytics/sales/reports"
                                className="btn btn-sm btn-primary"
                            >
                                <FileSpreadsheet className="w-4 h-4" />
                                <span>Ir a reportes de ventas</span>
                            </Link>
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

                        <div className="lg:col-span-3">
                            <ReportTabs variant="menu" />
                        </div>
                    </div>
                </section>
            </div>
        </DashboardLayout>
    );
}
