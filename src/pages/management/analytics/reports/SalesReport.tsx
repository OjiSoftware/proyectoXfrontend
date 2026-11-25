import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowLeft, DownloadIcon, Filter, XIcon } from "lucide-react";
import DashboardLayout from "@/layouts/DashboardLayout";
import SearchBar from "@/components/SearchBar";
import Pagination from "@/components/PaginationManagement";
import { useItemsPerpage } from "@/hooks/useItemsPerpage";
import { reportApi } from "@/services/ReportService";
import { productApi } from "@/services/ProductService";
import { exportExcel } from "@/helpers/excelExport";
import { buildSalesReportSheets } from "@/helpers/reportExport";
import type { SalesReportResult } from "@/types/report.types";

interface Option {
    id: number;
    name: string;
}

const money = (n: number) =>
    new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency: "ARS",
        maximumFractionDigits: 2,
    }).format(n || 0);

const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("es-AR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });

const fieldClass =
    "bg-[#151519] border border-white/10 text-slate-200 text-xs rounded-xl h-9 px-3 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none";

export default function ReportsPage() {
    const itemsPerPage = useItemsPerpage();

    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [providerId, setProviderId] = useState("");
    const [brandId, setBrandId] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("");
    const [searchInput, setSearchInput] = useState("");
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [filtersOpen, setFiltersOpen] = useState(false);

    const [categories, setCategories] = useState<Option[]>([]);
    const [providers, setProviders] = useState<Option[]>([]);
    const [brands, setBrands] = useState<Option[]>([]);

    const [report, setReport] = useState<SalesReportResult | null>(null);
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);

    // Opciones de los selects
    useEffect(() => {
        Promise.all([
            productApi.getAllCategories(),
            productApi.getAllProviders(),
            productApi.getAllBrands(),
        ])
            .then(([cats, provs, brs]) => {
                setCategories(cats.map((c: any) => ({ id: c.id, name: c.name })));
                setProviders(
                    provs.map((p: any) => ({
                        id: p.id,
                        name: p.name || p.businessName || `Proveedor #${p.id}`,
                    })),
                );
                setBrands(brs.map((b: any) => ({ id: b.id, name: b.name })));
            })
            .catch(() => toast.error("No se pudieron cargar los filtros"));
    }, []);

    // Debounce de la búsqueda de texto
    useEffect(() => {
        const t = setTimeout(() => setSearch(searchInput.trim()), 350);
        return () => clearTimeout(t);
    }, [searchInput]);

    // Cualquier cambio de filtro vuelve a la página 1
    useEffect(() => {
        setPage(1);
    }, [from, to, categoryId, providerId, brandId, paymentMethod, search]);

    const filters = useMemo(
        () => ({
            from: from || undefined,
            to: to || undefined,
            categoryId: categoryId ? Number(categoryId) : undefined,
            providerId: providerId ? Number(providerId) : undefined,
            brandId: brandId ? Number(brandId) : undefined,
            paymentMethod: paymentMethod || undefined,
            search: search || undefined,
        }),
        [from, to, categoryId, providerId, brandId, paymentMethod, search],
    );

    useEffect(() => {
        const controller = new AbortController();
        setLoading(true);
        reportApi
            .getSalesReport({ ...filters, page, pageSize: itemsPerPage }, controller.signal)
            .then(setReport)
            .catch((err) => {
                if (err?.name !== "AbortError") toast.error("No se pudo cargar el reporte");
            })
            .finally(() => {
                if (!controller.signal.aborted) setLoading(false);
            });
        return () => controller.abort();
    }, [filters, page, itemsPerPage]);

    const activeFiltersCount = [
        from,
        to,
        categoryId,
        providerId,
        brandId,
        paymentMethod,
    ].filter(Boolean).length;

    const hasFilters = Object.values(filters).some((v) => v !== undefined);

    const clearFilters = () => {
        setFrom("");
        setTo("");
        setCategoryId("");
        setProviderId("");
        setBrandId("");
        setPaymentMethod("");
        setSearchInput("");
        setSearch("");
    };

    const handleExport = async () => {
        setExporting(true);
        try {
            const full = await reportApi.getSalesReport(filters);
            if (full.items.length === 0) {
                toast.error("No hay datos para exportar con los filtros actuales");
                return;
            }
            exportExcel({
                fileName: `reporte-ventas-${new Date().toISOString().slice(0, 10)}`,
                sheets: buildSalesReportSheets(full.items, full.kpis),
            });
        } catch {
            toast.error("No se pudo exportar el reporte");
        } finally {
            setExporting(false);
        }
    };

    const kpis = report?.kpis;
    const kpiCards = [
        { label: "Total vendido", value: kpis ? money(kpis.totalSold) : "-" },
        { label: "Ventas", value: kpis ? String(kpis.salesCount) : "-" },
        { label: "Ticket promedio", value: kpis ? money(kpis.averageTicket) : "-" },
        { label: "Unidades", value: kpis ? String(kpis.unitsSold) : "-" },
        { label: "Margen", value: kpis ? money(kpis.totalMargin) : "-" },
    ];

    return (
        <DashboardLayout
            title="Reporte de ventas"
            subtitle="Ventas completadas, filtrables por fecha, categoría, proveedor y más."
            backUrl="/management/analytics/sales"
            actions={
                <div className="flex items-center gap-2">
                    {/* Búsqueda en el header */}
                    <div className="w-56 lg:w-72">
                        <SearchBar
                            value={searchInput}
                            onChange={setSearchInput}
                            placeholder="Buscar cliente, DNI..."
                            containerClassName="w-full"
                            inputClassName="bg-[#151519] text-white text-xs border-white/10 placeholder:text-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all rounded-xl h-9"
                        />
                    </div>

                    {/* Botón selector de filtros */}
                    <button
                        type="button"
                        onClick={() => setFiltersOpen((prev) => !prev)}
                        className={`btn btn-sm ${filtersOpen || activeFiltersCount > 0
                            ? "btn-primary"
                            : "btn-subtle"
                            }`}
                        title="Filtrar por fecha, categoría, marca..."
                    >
                        <Filter className="w-4 h-4" />
                        <span className="hidden sm:inline">Filtros</span>
                        {activeFiltersCount > 0 && (
                            <span className="ml-0.5 px-1.5 py-0.2 rounded-full bg-indigo-500 text-white text-[10px] font-bold">
                                {activeFiltersCount}
                            </span>
                        )}
                    </button>

                    {/* Botón exportar Excel */}
                    <button
                        onClick={handleExport}
                        disabled={exporting || loading || !report?.totalItems}
                        className="btn btn-sm btn-primary"
                    >
                        <DownloadIcon className="w-4 h-4" />
                        <span className="hidden sm:inline">
                            {exporting ? "Exportando..." : "Exportar Excel"}
                        </span>
                    </button>
                </div>
            }
        >
            <div className="space-y-6">
                {/* Panel de filtros desplegable o toggle desde el botón de arriba */}
                {filtersOpen && (
                    <div className="bg-gray-800/50 border border-white/10 rounded-2xl p-4 space-y-3 animate-in fade-in duration-200">
                        <div className="flex items-center justify-between border-b border-white/10 pb-2">
                            <span className="text-xs font-semibold text-slate-300">
                                Filtrar resultados
                            </span>
                            {hasFilters && (
                                <button
                                    onClick={clearFilters}
                                    className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors"
                                >
                                    <XIcon className="w-3.5 h-3.5" />
                                    Limpiar filtros
                                </button>
                            )}
                        </div>
                        <div className="flex flex-wrap gap-3 items-end">
                            <label className="flex flex-col gap-1 text-[11px] text-slate-400">
                                Desde
                                <input
                                    type="date"
                                    value={from}
                                    max={to || undefined}
                                    onChange={(e) => setFrom(e.target.value)}
                                    className={fieldClass}
                                />
                            </label>
                            <label className="flex flex-col gap-1 text-[11px] text-slate-400">
                                Hasta
                                <input
                                    type="date"
                                    value={to}
                                    min={from || undefined}
                                    onChange={(e) => setTo(e.target.value)}
                                    className={fieldClass}
                                />
                            </label>
                            <label className="flex flex-col gap-1 text-[11px] text-slate-400">
                                Categoría
                                <select
                                    value={categoryId}
                                    onChange={(e) => setCategoryId(e.target.value)}
                                    className={fieldClass}
                                >
                                    <option value="">Todas</option>
                                    {categories.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.name}
                                        </option>
                                    ))}
                                </select>
                            </label>
                            <label className="flex flex-col gap-1 text-[11px] text-slate-400">
                                Proveedor
                                <select
                                    value={providerId}
                                    onChange={(e) => setProviderId(e.target.value)}
                                    className={fieldClass}
                                >
                                    <option value="">Todos</option>
                                    {providers.map((p) => (
                                        <option key={p.id} value={p.id}>
                                            {p.name}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <label className="flex flex-col gap-1 text-[11px] text-slate-400">
                                Medio de pago
                                <select
                                    value={paymentMethod}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                    className={fieldClass}
                                >
                                    <option value="">Todos</option>
                                    {(report?.paymentMethods ?? []).map((m) => (
                                        <option key={m} value={m}>
                                            {m}
                                        </option>
                                    ))}
                                </select>
                            </label>
                        </div>
                    </div>
                )}


                {/* Tabla detalle */}
                <div className="bg-gray-800/50 border border-white/10 rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs text-left text-slate-300">
                            <thead className="text-[11px] uppercase text-slate-400 border-b border-white/10">
                                <tr>
                                    <th className="px-4 py-3">Venta</th>
                                    <th className="px-4 py-3">Fecha</th>

                                    <th className="px-4 py-3">Producto</th>
                                    <th className="px-4 py-3">Categoría</th>
                                    <th className="px-4 py-3">Proveedor</th>

                                    <th className="px-4 py-3">Pago</th>
                                    <th className="px-4 py-3 text-right">Cant.</th>
                                    <th className="px-4 py-3 text-right">P. costo</th>
                                    <th className="px-4 py-3 text-right">Ganancia</th>
                                    <th className="px-4 py-3 text-right">P. venta</th>
                                    <th className="px-4 py-3 text-right">Subtotal</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading && !report ? (
                                    <tr>
                                        <td colSpan={11} className="px-4 py-10 text-center text-slate-500">
                                            Cargando reporte...
                                        </td>
                                    </tr>
                                ) : report && report.items.length === 0 ? (
                                    <tr>
                                        <td colSpan={11} className="px-4 py-10 text-center text-slate-500">
                                            No hay ventas completadas con los filtros seleccionados.
                                        </td>
                                    </tr>
                                ) : (
                                    report?.items.map((item) => (
                                        <tr
                                            key={item.id}
                                            className={`border-b border-white/5 hover:bg-white/5 ${loading ? "opacity-60" : ""}`}
                                        >
                                            <td className="px-4 py-3 font-medium text-white">
                                                #{item.saleId}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                {formatDate(item.date)}
                                            </td>

                                            {/* <td className="px-4 py-3">{item.clientName}</td> */}
                                            <td className="px-4 py-3">{item.productName}</td>
                                            <td className="px-4 py-3">{item.categoryName}</td>
                                            <td className="px-4 py-3">{item.providerName}</td>
                                            {/* <td className="px-4 py-3">{item.brandName}</td> */}
                                            <td className="px-4 py-3">{item.paymentMethod}</td>
                                            <td className="px-4 py-3 text-center">{item.quantity}</td>
                                            <td className="px-4 py-3 text-center whitespace-nowrap">
                                                {money(item.costPrice)}
                                            </td>
                                            <td className="px-4 py-3 text-center whitespace-nowrap">
                                                {item.margin != null ? money(item.margin) : "-"}
                                            </td>
                                            <td className="px-4 py-3 text-center whitespace-nowrap">
                                                {money(item.unitaryPrice)}
                                            </td>
                                            <td className="px-4 py-3 text-center font-semibold text-white whitespace-nowrap">
                                                {money(item.subtotal)}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {report && report.totalItems > itemsPerPage && (
                    <Pagination
                        totalItems={report.totalItems}
                        itemsPerPage={itemsPerPage}
                        currentPage={page}
                        onPageChange={setPage}
                    />
                )}
            </div>
        </DashboardLayout>
    );
}
