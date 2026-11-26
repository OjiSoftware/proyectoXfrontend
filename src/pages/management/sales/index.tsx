import { useEffect, useState, useMemo, useRef } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { SalesTable } from '@/components/SalesTable';
import Pagination from '@/components/PaginationManagement';
import { Sale } from '@/types/sale.types';
import { useItemsPerpage } from '@/hooks/useItemsPerpage';
import SearchBar from '../../../components/SearchBar';
import { saleApi } from '@/services/SaleService';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { useDisableSale } from '@/hooks/useDisableSale';
import {
  PlusIcon,
  ChevronDown,
  X,
  SlidersHorizontal,
} from 'lucide-react';
import { ExportDropdown } from '@/components/ExportDropdown';
import { ConfirmModal } from '@/components/ConfirmModal';
import toast from 'react-hot-toast';
import {
  buildSaleExportSheet,
  getSaleChannelLabel,
  getSalePaymentLabel,
  getSaleUnitsCount,
  isPosGenericClient,
} from '@/helpers/saleExport';

export default function SalesPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [query, setQuery] = useState('');
  const [sales, setSales] = useState<Sale[]>([]);
  const [saleToDelete, setSaleToDelete] = useState<Sale | null>(null);
  const [isSilentCancel, setIsSilentCancel] = useState(true);

  // ---------------- Filtros ----------------
  const [filterStatus, setFilterStatus] = useState<
    'all' | 'COMPLETED' | 'CANCELLED'
  >('all');
  const [filterPayment, setFilterPayment] = useState<'all' | 'Efectivo' | 'Tarjeta' | 'Mercado Pago'>('all');
  const [filterNotes, setFilterNotes] = useState<'all' | 'withNotes' | 'withoutNotes'>('all');

  // ---------------- Columnas visibles ----------------
  const ALL_SALE_COLS = new Set([
    'saleId',
    'createdAt',
    'time',
    'client',
    'items',
    'payment',
    'status',
    'total',
  ]);
  const DEFAULT_SALE_COLS = new Set([
    'saleId',
    'createdAt',
    'time',
    'items',
    'payment',
    'status',
    'total',
  ]);
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(
    new Set(DEFAULT_SALE_COLS),
  );
  const toggleColumn = (col: string) => {
    setVisibleColumns((prev) => {
      const next = new Set(prev);
      if (next.has(col)) {
        next.delete(col);
      } else {
        next.add(col);
      }
      return next;
    });
  };

  // ---------------- Dropdown refs ----------------
  const [filterOpen, setFilterOpen] = useState(false);
  const [paramsOpen, setParamsOpen] = useState(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const filterRef = useRef<HTMLDivElement>(null);
  const paramsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node))
        setFilterOpen(false);
      if (paramsRef.current && !paramsRef.current.contains(e.target as Node))
        setParamsOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc' | null>(
    null,
  );

  const navigate = useNavigate();
  const itemsPerPage = useItemsPerpage();

  const { disableSale, loading } = useDisableSale(setSales);

  // --- CONTADORES PARA CHIPS Y ALERTAS ---
  const pendingSales = useMemo(
    () =>
      sales.filter(
        (s) => s.status === 'PENDING' || s.status === 'IN_PROGRESS',
      ),
    [sales],
  );
  const pendingSalesCount = pendingSales.length;
  const completedCount = useMemo(
    () => sales.filter((s) => s.status === 'COMPLETED').length,
    [sales],
  );
  const cancelledCount = useMemo(
    () => sales.filter((s) => s.status === 'CANCELLED').length,
    [sales],
  );
  const withNotesCount = useMemo(
    () => sales.filter((s) => Boolean(s.notes && s.notes.trim() !== '')).length,
    [sales],
  );

  // --- ESTADO DROPDOWN HEADER ---
  const [pendingDropdownOpen, setPendingDropdownOpen] = useState(false);
  const pendingDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        pendingDropdownRef.current &&
        !pendingDropdownRef.current.contains(e.target as Node)
      ) {
        setPendingDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleUpdateSaleNotes = (saleId: number, updatedNotes: string) => {
    setSales((prev) =>
      prev.map((s) => (s.id === saleId ? { ...s, notes: updatedNotes } : s)),
    );
  };

  const filteredSales = useMemo(() => {
    const searchTerm = query.trim().toLowerCase();

    // 1. Filtrar
    const filtered = sales.filter((s) => {
      const clientFull = `${s.client?.name || ''} ${s.client?.surname || ''}`
        .trim()
        .toLowerCase();
      const clientDni = (s.client?.dni || '').toLowerCase();
      const noteText = (s.notes || '').toLowerCase();
      const paymentText = getSalePaymentLabel(s).toLowerCase();

      const matchesQuery =
        !searchTerm ||
        s.id.toString().includes(searchTerm) ||
        `#${s.id}`.includes(searchTerm) ||
        clientFull.includes(searchTerm) ||
        clientDni.includes(searchTerm) ||
        noteText.includes(searchTerm) ||
        paymentText.includes(searchTerm);

      if (!matchesQuery) return false;

      if (filterStatus !== 'all' && s.status !== filterStatus) return false;

      if (filterPayment !== 'all') {
        if (getSalePaymentLabel(s) !== filterPayment) return false;
      }

      if (filterNotes !== 'all') {
        const hasNotes = Boolean(s.notes && s.notes.trim() !== '');
        if (filterNotes === 'withNotes' && !hasNotes) return false;
        if (filterNotes === 'withoutNotes' && hasNotes) return false;
      }

      return s.status !== undefined;
    });

    // 2. Asignar posición original
    const salesWithIndex = filtered.map((sale, index) => ({
      ...sale,
      originalIndex: index + 1,
    }));

    if (!sortColumn || !sortDirection) {
      return salesWithIndex;
    }

    // 3. Ordenar
    return [...salesWithIndex].sort((a, b) => {
      let aVal: any;
      let bVal: any;

      if (sortColumn === 'rowNum') {
        aVal = a.originalIndex;
        bVal = b.originalIndex;
      } else if (sortColumn === 'client.name') {
        aVal = isPosGenericClient(a.client)
          ? 'Consumidor Final'
          : `${a.client?.surname || ''} ${a.client?.name || ''}`.trim();
        bVal = isPosGenericClient(b.client)
          ? 'Consumidor Final'
          : `${b.client?.surname || ''} ${b.client?.name || ''}`.trim();
      } else if (sortColumn === 'items') {
        aVal = getSaleUnitsCount(a);
        bVal = getSaleUnitsCount(b);
      } else if (sortColumn === 'payment') {
        aVal = getSalePaymentLabel(a);
        bVal = getSalePaymentLabel(b);
      } else {
        aVal = a[sortColumn as keyof Sale];
        bVal = b[sortColumn as keyof Sale];
      }

      if (
        sortColumn === 'total' ||
        sortColumn === 'id' ||
        sortColumn === 'rowNum' ||
        sortColumn === 'items'
      ) {
        return sortDirection === 'asc'
          ? Number(aVal) - Number(bVal)
          : Number(bVal) - Number(aVal);
      }

      if (sortColumn === 'createdAt') {
        const dateA = new Date(aVal).getTime();
        const dateB = new Date(bVal).getTime();
        return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
      }

      return sortDirection === 'asc'
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });
  }, [
    sales,
    query,
    sortColumn,
    sortDirection,
    filterStatus,
    filterPayment,
    filterNotes,
  ]);

  // ---------------- Exportación Excel ----------------
  const handleExportSales = async () => {
    try {
      const sheet = buildSaleExportSheet(filteredSales);
      const { exportExcel } = await import('@/helpers/excelExport');

      exportExcel({
        fileName: 'ventas.xlsx',
        sheets: [sheet],
      });

      toast.success('Ventas exportadas a planilla Excel.');
    } catch (error) {
      console.error('Error al exportar ventas:', error);
      toast.error('No se pudieron exportar las ventas.');
    }
  };

  // ---------------- Paginación ----------------
  const lastIndex = currentPage * itemsPerPage;
  const firstIndex = lastIndex - itemsPerPage;
  const currentSales = filteredSales.slice(firstIndex, lastIndex);

  // ---------------- Función Handle Sort ----------------
  const handleSort = (col: string) => {
    if (sortColumn === col) {
      if (sortDirection === 'asc') setSortDirection('desc');
      else {
        setSortColumn(null);
        setSortDirection(null);
      }
    } else {
      setSortColumn(col);
      setSortDirection('asc');
    }
  };

  // ---------------- Fetch Ventas ----------------
  useEffect(() => {
    const fetchSales = async () => {
      try {
        const data = await saleApi.getAllSales();
        setSales(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error al cargar ventas:', error);
      }
    };
    fetchSales();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [
    itemsPerPage,
    query,
    filterStatus,
    filterPayment,
    filterNotes,
  ]);

  const activeFiltersCount = [
    filterStatus !== 'all',
    filterPayment !== 'all',
    filterNotes !== 'all',
  ].filter(Boolean).length;

  const hasActiveFilters = query !== '' || activeFiltersCount > 0;

  const resetFilters = () => {
    setQuery('');
    setFilterStatus('all');
    setFilterPayment('all');
    setFilterNotes('all');
  };

  return (
    <DashboardLayout
      title="Lista de ventas"
      subtitle="Gestión de ventas generadas en el sistema."
    >
      <div className="space-y-3">
        {/* BUSCADOR + FILTROS + PARÁMETROS (ESTILO UNIFICADO CON PRODUCTOS) */}
        {/* BUSCADOR MÓVIL (< md) */}
        <div className="md:hidden flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <SearchBar
                value={query}
                onChange={setQuery}
                placeholder="Buscar por #ID, cliente, pago o nota..."
                containerClassName="max-w-full"
                inputClassName="bg-[#151519] text-white text-xs border-white/10 placeholder:text-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all rounded-xl h-9"
                iconClassName="text-slate-500 group-focus-within:text-indigo-400"
              />
            </div>
            <button
              type="button"
              onClick={() => setMobileFilterOpen(true)}
              className={`relative h-9 w-9 shrink-0 flex items-center justify-center rounded-xl border transition-all active:scale-95 ${
                filterStatus !== 'all' ||
                filterPayment !== 'all' ||
                filterNotes !== 'all'
                  ? 'bg-indigo-500/15 border-indigo-500/40 text-indigo-300'
                  : 'bg-[#151519] border-white/10 text-slate-300'
              }`}
              title="Filtros"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              {(filterStatus !== 'all' ||
                filterPayment !== 'all' ||
                filterNotes !== 'all') && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-indigo-500 rounded-full border-2 border-[#07050C]" />
              )}
            </button>
          </div>

          {/* CHIPS RÁPIDOS MOBILE (< md) */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5 text-xs">
            <button
              type="button"
              onClick={() => {
                setFilterStatus('all');
                setFilterNotes('all');
              }}
              className={`shrink-0 px-3 py-1.5 rounded-full border font-medium transition-colors ${
                filterStatus === 'all' && filterNotes === 'all'
                  ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300'
                  : 'bg-white/5 border-white/10 text-slate-400'
              }`}
            >
              Todas ({sales.length})
            </button>
            <button
              type="button"
              onClick={() => {
                setFilterStatus(
                  filterStatus === 'COMPLETED' ? 'all' : 'COMPLETED',
                );
                setFilterNotes('all');
              }}
              className={`shrink-0 px-3 py-1.5 rounded-full border font-medium flex items-center gap-1.5 transition-colors ${
                filterStatus === 'COMPLETED'
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                  : 'bg-white/5 border-white/10 text-slate-400'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              Completadas ({completedCount})
            </button>
            <button
              type="button"
              onClick={() => {
                setFilterStatus(
                  filterStatus === 'CANCELLED' ? 'all' : 'CANCELLED',
                );
                setFilterNotes('all');
              }}
              className={`shrink-0 px-3 py-1.5 rounded-full border font-medium flex items-center gap-1.5 transition-colors ${
                filterStatus === 'CANCELLED'
                  ? 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                  : 'bg-white/5 border-white/10 text-slate-400'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-rose-400" />
              Canceladas ({cancelledCount})
            </button>
            <button
              type="button"
              onClick={() => {
                setFilterNotes(
                  filterNotes === 'withNotes' ? 'all' : 'withNotes',
                );
                setFilterStatus('all');
              }}
              className={`shrink-0 px-3 py-1.5 rounded-full border font-medium transition-colors ${
                filterNotes === 'withNotes'
                  ? 'bg-violet-500/20 border-violet-500/40 text-violet-300'
                  : 'bg-white/5 border-white/10 text-slate-400'
              }`}
            >
              Con nota ({withNotesCount})
            </button>
          </div>
        </div>

        {/* BUSCADOR Y COMANDOS ESCRITORIO (md+): IDÉNTICO EN ESTILO A PRODUCTOS */}
        <div className="hidden md:flex items-center justify-between gap-3 w-full">
          {/* Buscador */}
          <div className="flex-1">
            <SearchBar
              value={query}
              onChange={setQuery}
              placeholder="Buscar por comprobante (#ID), cliente, medio de pago o comentario..."
              containerClassName="!max-w-none w-full"
              inputClassName="bg-[#151519] text-white text-sm border-white/10 placeholder:text-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all rounded-xl h-11 w-full"
              iconClassName="text-slate-500 group-focus-within:text-indigo-400"
            />
          </div>

          {/* Contenedor de Filtros y Acciones */}
          <div className="flex items-center gap-2 lg:gap-2.5 shrink-0">
            {/* Dropdown FILTROS unificado (Estado, Medio de Pago y Comentarios) */}
            <div ref={filterRef} className="relative shrink-0">
              <button
                type="button"
                onClick={() => {
                  setFilterOpen((o) => !o);
                  setParamsOpen(false);
                }}
                className={`h-11 flex items-center gap-2 px-4 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                  filterOpen || activeFiltersCount > 0
                    ? 'bg-indigo-500/15 border-indigo-500/40 text-indigo-300'
                    : 'bg-[#151519] border-white/10 text-gray-400 hover:border-white/25 hover:text-gray-200'
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5 shrink-0" />
                <span>Filtros</span>
                {activeFiltersCount > 0 && (
                  <span className="text-[10px] font-bold bg-indigo-500/20 text-indigo-300 px-1.5 rounded-full">
                    {activeFiltersCount}
                  </span>
                )}
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${
                    filterOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {filterOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 max-h-[75vh] overflow-y-auto bg-[#151519] backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl z-50 p-3.5 space-y-4">
                  {/* Estado */}
                  <div>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                      Estado
                    </p>
                    <div className="space-y-1">
                      {(
                        [
                          ['all', 'Todos los estados'],
                          ['COMPLETED', 'Completadas'],
                          ['CANCELLED', 'Canceladas'],
                        ] as const
                      ).map(([val, lbl]) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setFilterStatus(val)}
                          className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                            filterStatus === val
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
                          }`}
                        >
                          {lbl}
                        </button>
                      ))}
                    </div>
                  </div>
                  {/* Medio de pago */}
                  <div>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                      Medio de Pago
                    </p>
                    <div className="space-y-1">
                      {(
                        [
                          ['all', 'Todos'],
                          ['Efectivo', 'Efectivo'],
                          ['Tarjeta', 'Tarjeta'],
                          ['Mercado Pago', 'Mercado Pago'],
                        ] as const
                      ).map(([val, lbl]) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setFilterPayment(val)}
                          className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                            filterPayment === val
                              ? 'bg-indigo-500/20 text-indigo-300'
                              : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
                          }`}
                        >
                          {lbl}
                        </button>
                      ))}
                    </div>
                  </div>
                  {/* Notas / Comentarios */}
                  <div>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                      Comentarios
                    </p>
                    <div className="space-y-1">
                      {(
                        [
                          ['all', 'Todas'],
                          ['withNotes', 'Con comentarios'],
                          ['withoutNotes', 'Sin comentarios'],
                        ] as const
                      ).map(([val, lbl]) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setFilterNotes(val)}
                          className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                            filterNotes === val
                              ? 'bg-violet-500/20 text-violet-300'
                              : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
                          }`}
                        >
                          {lbl}
                        </button>
                      ))}
                    </div>
                  </div>
                  {activeFiltersCount > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setFilterStatus('all');
                        setFilterPayment('all');
                        setFilterNotes('all');
                      }}
                      className="w-full text-center text-[11px] font-medium text-rose-400/80 hover:text-rose-400 transition-colors cursor-pointer pt-2 border-t border-white/5"
                    >
                      Limpiar filtros
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Botón LIMPIAR FILTROS (Global) */}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="btn btn-md btn-danger text-xs font-medium"
                title="Limpiar todos los filtros"
              >
                <X className="w-4 h-4" />
                <span className="hidden xl:inline">Limpiar filtros</span>
              </button>
            )}

            {/* Dropdown PARÁMETROS (Ver columnas) */}
            <div ref={paramsRef} className="relative shrink-0">
              <button
                type="button"
                onClick={() => {
                  setParamsOpen((o) => !o);
                  setFilterOpen(false);
                }}
                className={`h-11 flex items-center gap-2 px-4 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                  paramsOpen || visibleColumns.size < ALL_SALE_COLS.size
                    ? 'bg-indigo-500/15 border-indigo-500/40 text-indigo-300'
                    : 'bg-[#151519] border-white/10 text-gray-400 hover:border-white/25 hover:text-gray-200'
                }`}
              >
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${
                    paramsOpen ? 'rotate-180' : ''
                  }`}
                />
                Ver columnas
                {visibleColumns.size < ALL_SALE_COLS.size && (
                  <span className="text-[10px] font-bold bg-indigo-500/20 text-indigo-300 px-1.5 rounded-full">
                    {ALL_SALE_COLS.size - visibleColumns.size} ocultas
                  </span>
                )}
              </button>
              {paramsOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 bg-[#151519] backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden p-3 space-y-1">
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2 px-1">
                    Columnas visibles
                  </p>
                  {(
                    [
                      ['saleId', 'Comprobante'],
                      ['createdAt', 'Fecha'],
                      ['time', 'Hora'],
                      ['client', 'Cliente / Canal'],
                      ['items', 'Artículos'],
                      ['payment', 'Pago'],
                      ['status', 'Estado'],
                      ['total', 'Monto'],
                    ] as const
                  ).map(([col, lbl]) => (
                    <label
                      key={col}
                      className="flex items-center gap-3 px-2 py-1.5 rounded-lg hover:bg-white/5 cursor-pointer group"
                    >
                      <input
                        type="checkbox"
                        checked={visibleColumns.has(col)}
                        onChange={() => toggleColumn(col)}
                        className="w-3.5 h-3.5 rounded text-indigo-500 focus:ring-indigo-500 bg-gray-800 border-gray-600 cursor-pointer"
                      />
                      <span
                        className={`text-xs font-medium transition-colors ${
                          visibleColumns.has(col)
                            ? 'text-gray-200'
                            : 'text-gray-500'
                        }`}
                      >
                        {lbl}
                      </span>
                    </label>
                  ))}
                  <div className="pt-1 border-t border-white/5">
                    <button
                      type="button"
                      onClick={() =>
                        setVisibleColumns(new Set(ALL_SALE_COLS))
                      }
                      className="w-full text-center text-[10px] text-gray-500 hover:text-gray-300 transition-colors cursor-pointer py-1"
                    >
                      Mostrar todas
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Dropdown Exportar */}
            <ExportDropdown onExportExcel={handleExportSales} />

            {/* Botón Nueva venta */}
            <button
              type="button"
              title="Nueva venta"
              onClick={() => navigate(ROUTES.sales.create)}
              className="group h-11 inline-flex items-center gap-2 px-4 rounded-xl bg-indigo-600 text-white text-xs font-semibold transition-all duration-200 cursor-pointer shadow-[0_0_20px_rgba(79,70,229,0.35)] hover:bg-indigo-500 hover:shadow-[0_0_25px_rgba(79,70,229,0.55)] border border-indigo-400/30 active:scale-95 shrink-0"
            >
              <PlusIcon
                size={16}
                className="group-hover:rotate-90 transition-transform duration-300"
              />
              <span>Nueva venta</span>
            </button>
          </div>
        </div>

        <SalesTable
          sales={currentSales}
          onDelete={(sale) => setSaleToDelete(sale)}
          onUpdateNotes={handleUpdateSaleNotes}
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          onSort={handleSort}
          currentSortColumn={sortColumn}
          currentSortDirection={sortDirection}
          visibleColumns={visibleColumns}
        />

        <Pagination
          totalItems={filteredSales.length}
          itemsPerPage={itemsPerPage}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
        />

        {/* BOTTOM SHEET FILTROS MOBILE (< md) */}
        {mobileFilterOpen && (
          <div
            className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex flex-col justify-end"
            onClick={() => setMobileFilterOpen(false)}
          >
            <div
              className="bg-[#12101F] border-t border-white/10 rounded-t-[28px] p-5 space-y-4 max-h-[85vh] overflow-y-auto shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-10 h-1 bg-white/20 rounded-full mx-auto -mt-1 mb-2" />

              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white">
                  Filtros de ventas
                </h3>
                <button
                  type="button"
                  onClick={() => setMobileFilterOpen(false)}
                  className="p-1 text-slate-400 hover:text-white rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Estado */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Estado de la Venta
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(
                    [
                      ['all', 'Todas'],
                      ['COMPLETED', 'Completadas'],
                      ['CANCELLED', 'Canceladas'],
                    ] as const
                  ).map(([val, lbl]) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setFilterStatus(val)}
                      className={`py-2 px-3 rounded-xl text-xs font-medium border transition-colors ${
                        filterStatus === val
                          ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                          : 'bg-white/5 text-slate-400 border-white/10'
                      }`}
                    >
                      {lbl}
                    </button>
                  ))}
                </div>
              </div>

              {/* Medio de Pago */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Medio de Pago
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(
                    [
                      ['all', 'Todos'],
                      ['Efectivo', 'Efectivo'],
                      ['Tarjeta', 'Tarjeta'],
                      ['Mercado Pago', 'Mercado Pago'],
                    ] as const
                  ).map(([val, lbl]) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setFilterPayment(val)}
                      className={`py-2 px-3 rounded-xl text-xs font-medium border transition-colors ${
                        filterPayment === val
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : 'bg-white/5 text-slate-400 border-white/10'
                      }`}
                    >
                      {lbl}
                    </button>
                  ))}
                </div>
              </div>

              {/* Comentarios */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Comentarios Administrativos
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(
                    [
                      ['all', 'Todas'],
                      ['withNotes', 'Con nota'],
                      ['withoutNotes', 'Sin nota'],
                    ] as const
                  ).map(([val, lbl]) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setFilterNotes(val)}
                      className={`py-2 px-3 rounded-xl text-xs font-medium border transition-colors ${
                        filterNotes === val
                          ? 'bg-violet-500/20 text-violet-300 border-violet-500/40'
                          : 'bg-white/5 text-slate-400 border-white/10'
                      }`}
                    >
                      {lbl}
                    </button>
                  ))}
                </div>
              </div>

              {/* Botones de Acción */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    resetFilters();
                    setMobileFilterOpen(false);
                  }}
                  className="btn btn-sm btn-subtle flex-1"
                >
                  Limpiar
                </button>
                <button
                  type="button"
                  onClick={() => setMobileFilterOpen(false)}
                  className="btn btn-sm btn-primary flex-1"
                >
                  Aplicar Filtros
                </button>
              </div>
            </div>
          </div>
        )}

        {saleToDelete && (
          <ConfirmModal
            isOpen={true}
            title="Confirmar cancelación"
            variant="danger"
            message={
              <div className="space-y-4">
                <p>
                  ¿Estás seguro de que querés cancelar la{' '}
                  <b>Venta #{saleToDelete.id}</b>? Esta acción no se puede
                  deshacer.
                </p>

                <div className="flex items-center justify-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <input
                    type="checkbox"
                    id="silent-trash"
                    checked={isSilentCancel}
                    onChange={(e) => setIsSilentCancel(e.target.checked)}
                    className="w-4 h-4 rounded border-red-500/50 text-red-500 focus:ring-red-500 bg-slate-800 cursor-pointer"
                  />
                  <label
                    htmlFor="silent-trash"
                    className="text-xs text-red-200 cursor-pointer select-none"
                  >
                    Cancelación silenciosa (No enviar email)
                  </label>
                </div>
              </div>
            }
            isLoading={loading}
            onCancel={() => setSaleToDelete(null)}
            onConfirm={async () => {
              await disableSale(saleToDelete.id, { silent: isSilentCancel });

              if (currentSales.length === 1 && currentPage > 1) {
                setCurrentPage((prev) => prev - 1);
              }
              setSaleToDelete(null);
            }}
            confirmText="Confirmar"
            cancelText="Volver"
          />
        )}
      </div>
    </DashboardLayout>
  );
}
