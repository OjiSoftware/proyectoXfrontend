import { Link } from "react-router-dom";
import { ArrowLeft, FileSpreadsheet, PieChart } from "lucide-react";
import DashboardLayout from "@/layouts/DashboardLayout";

const placeholderKpis = [
    "KPI de rentabilidad 1",
    "KPI de rentabilidad 2",
    "KPI de rentabilidad 3",
    "KPI de rentabilidad 4",
];

export default function ProfitabilityAnalyticsPage() {
    return (
        <DashboardLayout
            title="Analíticas · Rentabilidad"
            subtitle="Indicadores de márgenes y rentabilidad, con acceso a reportes."
            actions={
                <div className="flex items-center gap-2">
                    <Link to="/management/analytics" className="btn btn-sm btn-ghost">
                        <ArrowLeft className="w-4 h-4" />
                        <span>Volver</span>
                    </Link>
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
                    <Link to="/management/analytics" className="btn btn-sm btn-ghost">
                        <ArrowLeft className="w-4 h-4" />
                        <span>Volver</span>
                    </Link>
                    <Link to="/management/analytics/sales/reports" className="btn btn-sm btn-primary">
                        <FileSpreadsheet className="w-4 h-4" />
                        <span>Reportes de ventas</span>
                    </Link>
                </div>

                {/* Espacio reservado para KPIs futuras */}
                <section aria-label="KPIs futuras de rentabilidad" className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {placeholderKpis.map((label) => (
                            <div
                                key={label}
                                className="mgmt-surface rounded-2xl p-5 border-dashed opacity-75"
                            >
                                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                                    {label}
                                </p>
                                <p className="mt-3 text-2xl font-bold text-[var(--text-muted)]">
                                    —
                                </p>
                                <p className="mt-1 text-xs text-[var(--text-muted)]">
                                    Próximamente
                                </p>
                            </div>
                        ))}
                    </div>

                    <div className="mgmt-surface rounded-2xl p-8 flex flex-col items-center justify-center text-center gap-3">
                        <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                            <PieChart className="w-6 h-6" />
                        </div>
                        <h2 className="text-base font-semibold text-[var(--text-primary)]">
                            Métricas de rentabilidad en construcción
                        </h2>
                        <p className="text-xs text-[var(--text-muted)] max-w-md">
                            Acá se mostrarán las KPIs y análisis de rentabilidad. Mientras tanto,
                            podés consultar el detalle completo en el reporte de ventas.
                        </p>
                        <Link to="/management/analytics/sales/reports" className="btn btn-md btn-primary mt-2">
                            <FileSpreadsheet className="w-4 h-4" />
                            <span>Ir a reportes de ventas</span>
                        </Link>
                    </div>
                </section>
            </div>
        </DashboardLayout>
    );
}
