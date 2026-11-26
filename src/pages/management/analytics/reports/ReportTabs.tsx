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

export function ReportTabs() {
    const { pathname } = useLocation();

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
