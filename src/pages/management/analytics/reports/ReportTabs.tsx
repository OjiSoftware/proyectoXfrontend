import { Link, useLocation } from "react-router-dom";
import { Receipt, Package, Blocks } from "lucide-react";

const TABS = [
    {
        label: "Por ventas",
        to: "/management/analytics/sales/reports",
        icon: Receipt,
    },
    {
        label: "Por productos",
        to: "/management/analytics/sales/reports/products",
        icon: Package,
    },
    {
        label: "Por categorías",
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
                className="mgmt-surface rounded-2xl p-4 space-y-2"
            >
                <p className="px-2 text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                    Reportes
                </p>
                <div className="flex flex-col gap-1">
                    {TABS.map((tab) => {
                        const isActive = pathname === tab.to;
                        const Icon = tab.icon;
                        return (
                            <Link
                                key={tab.to}
                                to={tab.to}
                                className={`flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                                    isActive
                                        ? "bg-indigo-500/15 text-indigo-400 border border-indigo-500/35 shadow-sm"
                                        : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] border border-transparent"
                                }`}
                            >
                                <Icon className="w-4 h-4 shrink-0" />
                                <span>{tab.label}</span>
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
