import { Link } from "react-router-dom";
import {
    DollarSign,
    Receipt,
    ShoppingBag,
    Package,
    TrendingUp,
    ArrowRight,
    BarChart3,
    PieChart,
} from "lucide-react";
import DashboardLayout from "@/layouts/DashboardLayout";

const kpis = [
    {
        title: "Ventas totales",
        value: "—",
        description: "Suma de lo facturado en el período.",
        icon: DollarSign,
        accent: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    },
    {
        title: "Ticket promedio",
        value: "—",
        description: "Ventas ÷ cantidad de transacciones.",
        icon: Receipt,
        accent: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
    },
    {
        title: "Cantidad de transacciones",
        value: "—",
        description: "Ventas cerradas por día, semana o mes.",
        icon: ShoppingBag,
        accent: "text-sky-400 bg-sky-500/10 border-sky-500/20",
    },
    {
        title: "Unidades por transacción",
        value: "—",
        description: "Unidades vendidas ÷ transacciones.",
        icon: Package,
        accent: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    },
    {
        title: "Crecimiento de ventas",
        value: "—",
        description: "(Período actual − anterior) ÷ anterior × 100.",
        icon: TrendingUp,
        accent: "text-violet-400 bg-violet-500/10 border-violet-500/20",
    },
];

const sections = [
    {
        title: "Ventas",
        description: "Indicadores detallados de ventas y acceso a reportes de ventas.",
        to: "/management/analytics/sales",
        icon: BarChart3,
        accent: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
    },
    {
        title: "Rentabilidad",
        description: "Indicadores de márgenes, costos y acceso a reportes.",
        to: "/management/analytics/profitability",
        icon: PieChart,
        accent: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    },
];

export default function AnalyticsPage() {
    return (
        <DashboardLayout
            title="Analytics"
            subtitle="Indicadores clave de rendimiento y acceso a módulos analíticos."
        >
            <div className="space-y-8">
                {/* 5 KPIs principales */}
                <section aria-label="KPIs principales">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                        {kpis.map((kpi) => {
                            const Icon = kpi.icon;
                            return (
                                <div
                                    key={kpi.title}
                                    className="mgmt-surface rounded-2xl p-5 flex flex-col justify-between gap-4 shadow-sm"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                                            {kpi.title}
                                        </p>
                                        <div
                                            className={`p-2 rounded-xl border shrink-0 ${kpi.accent}`}
                                        >
                                            <Icon className="w-4 h-4" />
                                        </div>
                                    </div>

                                    <div>
                                        <p className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">
                                            {kpi.value}
                                        </p>
                                        <p className="mt-1.5 text-xs text-[var(--text-muted)] leading-relaxed">
                                            {kpi.description}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* Navegación a submódulos */}
                <section aria-label="Módulos de Analytics">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {sections.map((section) => {
                            const Icon = section.icon;
                            return (
                                <Link
                                    key={section.to}
                                    to={section.to}
                                    className="group mgmt-surface rounded-2xl p-6 flex items-center justify-between gap-4 hover:border-indigo-500/40 transition-all shadow-sm"
                                >
                                    <div className="flex items-center gap-4 min-w-0">
                                        <div
                                            className={`p-3.5 rounded-2xl border shrink-0 ${section.accent}`}
                                        >
                                            <Icon className="w-6 h-6" />
                                        </div>
                                        <div className="min-w-0">
                                            <h2 className="text-lg font-bold text-[var(--text-primary)] group-hover:text-indigo-400 transition-colors">
                                                {section.title}
                                            </h2>
                                            <p className="text-xs text-[var(--text-muted)] mt-1">
                                                {section.description}
                                            </p>
                                        </div>
                                    </div>
                                    <ArrowRight className="w-5 h-5 text-[var(--text-muted)] group-hover:text-indigo-400 group-hover:translate-x-1 transition-all shrink-0" />
                                </Link>
                            );
                        })}
                    </div>
                </section>
            </div>
        </DashboardLayout>
    );
}
