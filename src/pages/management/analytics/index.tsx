import { Link } from "react-router-dom";
import { ArrowRight, BarChart3, PieChart } from "lucide-react";
import DashboardLayout from "@/layouts/DashboardLayout";

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
            title="Analíticas"
            subtitle="Indicadores clave de rendimiento y acceso a módulos analíticos."
        >
            <div className="space-y-8">
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
