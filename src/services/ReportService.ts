import type {
    SalesKpiFilters,
    SalesKpisResult,
    SalesReportFilters,
    SalesReportResult,
} from "@/types/report.types";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export const reportApi = {
    getSalesReport: async (
        filters: SalesReportFilters,
        signal?: AbortSignal,
    ): Promise<SalesReportResult> => {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== "") {
                params.set(key, String(value));
            }
        });
        const response = await fetch(`${BASE_URL}/reports/sales?${params.toString()}`, {
            credentials: "include",
            signal,
        });
        if (!response.ok) throw new Error("Error al obtener el reporte de ventas");
        return response.json();
    },

    getSalesKpis: async (
        filters: SalesKpiFilters = {},
        signal?: AbortSignal,
    ): Promise<SalesKpisResult> => {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== "") {
                params.set(key, String(value));
            }
        });
        const response = await fetch(`${BASE_URL}/reports/kpis?${params.toString()}`, {
            credentials: "include",
            signal,
        });
        if (!response.ok) throw new Error("Error al obtener las KPIs de ventas");
        return response.json();
    },
};
