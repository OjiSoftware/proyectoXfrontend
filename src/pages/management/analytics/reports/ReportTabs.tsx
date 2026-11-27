import { Link, useLocation } from "react-router-dom";
import { Receipt, Package, Blocks, ChevronRight } from "lucide-react";

const TABS = [
    {
        label: "Por ventas",
        description: "Cada venta con sus productos",
        to: "/management/analytics/sales/reports",
        icon: Receipt,
    },
    {
        label: "Por productos",
        description: "Ventas agrupadas por producto",
        to: "/management/analytics/sales/reports/products",
        icon: Package,
    },
    {
        label: "Por categorías",
        description: "Ventas agrupadas por categoría",
        to: "/management/analytics/sales/reports/categories",
        icon: Blocks,
    },
];

interface ReportTabsProps {
    variant?: "horizontal" | "menu";
}

export function ReportTabs({ variant = "horizontal" }: ReportTabsProps) {
    const { pathname } = useLocation();

    if (variant === "menu") {
        return (
            <nav
                aria-label="Reportes de ventas"
                className="management-table-container rounded-2xl overflow-hidden"
            >
                <div className="report-topbar flex flex-wrap items-center justify-between gap-2 px-4 py-3">
                    <h2 className="text-sm font-semibold text-[var(--text-primary)]">
                        Reportes
                    </h2>
                    <p className="text-xs text-[var(--text-muted)]">
                        Detalle completo de las ventas del período
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4">
                    {TABS.map((tab) => {
                        const isActive = pathname === tab.to;
                        const Icon = tab.icon;
                        return (
                            <Link
                                key={tab.to}
                                to={tab.to}
                                className={`group flex items-center gap-4 p-4 rounded-xl border transition-all ${
                                    isActive
                                        ? "bg-indigo-500/15 border-indigo-500/35 shadow-sm"
                                        : "border-[var(--border-subtle)] hover:border-indigo-500/35 hover:bg-[var(--bg-elevated)]"
                                }`}
                            >
                                <div className="flex items-center justify-center w-11 h-11 rounded-xl shrink-0 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                                    <Icon className="w-5 h-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p
                                        className={`text-sm font-semibold ${
                                            isActive
                                                ? "text-indigo-400"
                                                : "text-[var(--text-primary)]"
                                        }`}
                                    >
                                        {tab.label}
                                    </p>
                                    <p className="text-xs text-[var(--text-muted)] truncate">
                                        {tab.description}
                                    </p>
                                </div>
                                <ChevronRight className="w-4 h-4 shrink-0 text-[var(--text-muted)] transition-transform group-hover:translate-x-0.5 group-hover:text-indigo-400" />
                            </Link>
                        );
                    })}
                </div>
            </nav>
        );
    }

    return (
        <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-sm">
            {TABS.map((tab) => {
                const isActive = pathname === tab.to;
                const Icon = tab.icon;
                return (
                    <Link
                        key={tab.to}
                        to={tab.to}
                        className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium transition-all ${
                            isActive
                                ? "bg-indigo-500/15 text-indigo-400 border border-indigo-500/35 shadow-sm"
                                : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] border border-transparent"
                        }`}
                    >
                        <Icon className="w-3.5 h-3.5 shrink-0" />
                        <span>{tab.label}</span>
                    </Link>
                );
            })}
        </div>
    );
}
