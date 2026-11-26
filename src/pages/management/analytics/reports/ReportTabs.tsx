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
        <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-[#151519] border border-white/10">
            {TABS.map((tab) => {
                const isActive = pathname === tab.to;
                const Icon = tab.icon;
                return (
                    <Link
                        key={tab.to}
                        to={tab.to}
                        className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium transition-all ${
                            isActive
                                ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/35 shadow-sm"
                                : "text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent"
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
