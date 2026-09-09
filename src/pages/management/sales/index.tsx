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
import { PlusIcon, Clock, ChevronDown } from 'lucide-react';
import { ConfirmModal } from '@/components/ConfirmModal';

export default function SalesPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [query, setQuery] = useState('');
  const [sales, setSales] = useState<Sale[]>([]);
  const [saleToDelete, setSaleToDelete] = useState<Sale | null>(null);

  // NUEVO ESTADO: Para el Checkbox de "Cancelaci�n Silenciosa" (Por defecto true)
  const [isSilentCancel, setIsSilentCancel] = useState(true);

  // ---------------- Filtros ----------------
  const [filterStatus, setFilterStatus] = useState<'all' | 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'>('all');

  // ---------------- Columnas visibles ----------------
  const ALL_SALE_COLS = new Set(['createdAt','status','total','client']);
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(new Set(ALL_SALE_COLS));
  const toggleColumn = (col: string) => {
    setVisibleColumns(prev => {
      const next = new Set(prev);
      if (next.has(col)) { next.delete(col); } else { next.add(col); }
      return next;
    });
  };

  // ---------------- Dropdown refs ----------------
  const [filterOpen, setFilterOpen] = useState(false);
  const [paramsOpen, setParamsOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);
  const paramsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) setFilterOpen(false);
      if (paramsRef.current && !paramsRef.current.contains(e.target as Node)) setParamsOpen(false);
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

  // Modificamos c�mo se usa el hook para poder pasarle el 'silent' a la API
  const { disableSale, loading } = useDisableSale(setSales);

  // --- ALERTA SOLICITADA ---
  const pendingSales = useMemo(() => sales.filter(s => s.status === 'PENDING' || s.status === 'IN_PROGRESS'), [sales]);
  const pendingSalesCount = pendingSales.length;

  // --- ESTADO DROPDOWN ---
  const [pendingDropdownOpen, setPendingDropdownOpen] = useState(false);
  const pendingDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (pendingDropdownRef.current && !pendingDropdownRef.current.contains(e.target as Node)) {
        setPendingDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  // ... (todo el memo de filteredSales y los useEffect quedan IGUAL) ...
  const filteredSales = useMemo(() => {
    const searchTerm = query.trim().toLowerCase();

    // 1. Filtrar
    const filtered = sales.filter((s) => {
      const matchesQuery =
        s.id.toString().includes(searchTerm) ||
        s.client?.name?.toLowerCase().includes(searchTerm);
      if (!matchesQuery) return false;

      // Filtro de status
      if (filterStatus !== 'all' && s.status !== filterStatus) return false;

      return s.status !== undefined;
    });

    // 2. ASIGNAR POSICI�N ORIGINAL
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
        aVal = a.client?.name || '';
        bVal = b.client?.name || '';
      } else {
        aVal = a[sortColumn as keyof Sale] ?? '';
        bVal = b[sortColumn as keyof Sale] ?? '';
      }

      // Comparaci�n
      if (
        sortColumn === 'rowNum' ||
        sortColumn === 'total' ||
        typeof aVal === 'number'
      ) {
        return sortDirection === 'asc'
          ? Number(aVal) - Number(bVal)
          : Number(bVal) - Number(aVal);
      }

      return sortDirection === 'asc'
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });
  }, [sales, query, sortColumn, sortDirection, filterStatus]);

  const lastIndex = currentPage * itemsPerPage;
  const firstIndex = lastIndex - itemsPerPage;
  const currentSales = filteredSales.slice(firstIndex, lastIndex);

  useEffect(() => {
    const fetchSales = async () => {
      try {
        const data = await saleApi.getAllSales();
        setSales(data);
      } catch (error) {
        console.error('Error cargando ventas', error);
      }
    };
    fetchSales();
  }, []);

  useEffect(() => setCurrentPage(1), [itemsPerPage, query, filterStatus]);

  const handleSort = (col: string) => {
    if (sortColumn === col) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortColumn(null);
        setSortDirection(null);
      }
    } else {
      setSortColumn(col);
      setSortDirection('asc');
    }
  };

  return (
    <DashboardLayout
      title="Lista de ventas"
      subtitle="Gesti�n de ventas generadas en el sistema."
      actions={
        <button
          onClick={() => navigate(ROUTES.sales.create)}
          className="flex items-center gap-2 px-4 py-2 text-xs rounded-lg bg-accent-500 text-[#00001A] font-extrabold transition-all duration-300 cursor-pointer shadow-[0_0_15px_rgba(0,240,255,0.4)] hover:bg-accent-400 hover:shadow-[0_0_20px_rgba(0,240,255,0.6)] active:scale-95"
        >
          <PlusIcon size={18} />
          <span className="hidden md:inline">Nueva venta</span>
        </button>
      }
      headerWidgets={
        <div ref={pendingDropdownRef} className="flex items-center gap-2">
          <div className="relative">
            <button
              onClick={() => setPendingDropdownOpen(!pendingDropdownOpen)}
              className={`relative flex items-center justify-center w-9 h-9 rounded-xl border transition-all duration-200 cursor-pointer ${
                pendingDropdownOpen
                  ? 'bg-amber-500/25 border-amber-400/50 shadow-[0_0_12px_rgba(251,191,36,0.3)]'
                  : 'bg-amber-900/30 border-amber-500/20 hover:bg-amber-500/20 hover:border-amber-400/40'
              }`}
              title="Ventas pendientes"
            >
              <Clock className="w-4 h-4 text-amber-400" />
              {pendingSalesCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-0.5 bg-amber-400 text-gray-900 text-[9px] font-black rounded-full flex items-center justify-center leading-none">
                  {pendingSalesCount}
                </span>
              )}
            </button>
            {pendingDropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-gray-900/95 backdrop-blur-xl border border-amber-500/20 rounded-2xl shadow-2xl shadow-amber-900/20 z-50 overflow-hidden">
                <div className="px-4 py-3 border-b border-amber-500/15 bg-amber-900/20">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-400" />
                    <p className="text-xs font-bold text-amber-300 uppercase tracking-wider">Pendientes / En curso</p>
                  </div>
                  <p className="text-2xl font-black text-amber-400 mt-1">{pendingSalesCount} <span className="text-xs font-normal text-amber-200/60">ventas</span></p>
                </div>
                <div className="max-h-52 overflow-y-auto py-1">
                  {pendingSales.length === 0 ? (
                    <p className="text-xs text-gray-500 px-4 py-3 text-center">Sin ventas pendientes</p>
                  ) : pendingSales.map(s => (
                    <div key={s.id} className="flex items-center justify-between px-4 py-2 hover:bg-white/5 transition-colors">
                      <div className="flex-1 min-w-0 mr-2">
                        <span className="text-xs font-bold text-gray-200 block">Venta #{s.id}</span>
                        <span className="text-[10px] text-gray-500 truncate block">{s.client?.name || 'Sin cliente'}</span>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                        s.status === 'PENDING'
                          ? 'bg-amber-500/15 text-amber-400'
                          : 'bg-blue-500/15 text-blue-400'
                      }`}>
                        {s.status === 'PENDING' ? 'Pendiente' : 'En curso'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        {/* BUSCADOR + FILTROS + PAR�METROS */}
        <div className="flex gap-3">
          {/* Buscador */}
          <div className="flex-1">
            <SearchBar
              value={query}
              onChange={setQuery}
              placeholder="Buscar por ID o nombre del cliente..."
              containerClassName="max-w-full"
              inputClassName="bg-gray-800/60 text-white border-white/10 placeholder:text-slate-500 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all rounded-xl h-11"
              iconClassName="text-slate-500 group-focus-within:text-brand-400"
            />
          </div>

          {/* Dropdown FILTROS */}
          <div ref={filterRef} className="relative shrink-0">
            <button
              onClick={() => { setFilterOpen(o => !o); setParamsOpen(false); }}
              className={`h-11 flex items-center gap-2 px-4 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                filterOpen || filterStatus !== 'all'
                  ? 'bg-brand-500/15 border-brand-500/40 text-brand-300'
                  : 'bg-gray-800/60 border-white/10 text-gray-400 hover:border-white/25 hover:text-gray-200'
              }`}
            >
              <ChevronDown className={`w-4 h-4 transition-transform ${filterOpen ? 'rotate-180' : ''}`} />
              Filtros
              {filterStatus !== 'all' && <span className="w-2 h-2 rounded-full bg-brand-400 shrink-0" />}
            </button>
            {filterOpen && (
              <div className="absolute right-0 top-full mt-2 w-52 bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl z-50 p-3 space-y-1">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Estado</p>
                {([
                  ['all',         'Todos'],
                  ['PENDING',     'Pendiente'],
                  ['IN_PROGRESS', 'En curso'],
                  ['COMPLETED',   'Completado'],
                  ['CANCELLED',   'Cancelado'],
                ] as const).map(([val, lbl]) => (
                  <button key={val} onClick={() => setFilterStatus(val)}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                      filterStatus === val ? 'bg-brand-500/20 text-brand-300' : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
                    }`}>
                    {lbl}
                  </button>
                ))}
                {filterStatus !== 'all' && (
                  <button onClick={() => setFilterStatus('all')}
                    className="w-full text-center text-[10px] text-rose-400/70 hover:text-rose-400 transition-colors cursor-pointer pt-1 border-t border-white/5">
                    Limpiar filtro
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Dropdown PAR�METROS */}
          <div ref={paramsRef} className="relative shrink-0">
            <button
              onClick={() => { setParamsOpen(o => !o); setFilterOpen(false); }}
              className={`h-11 flex items-center gap-2 px-4 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                paramsOpen || visibleColumns.size < ALL_SALE_COLS.size
                  ? 'bg-brand-500/15 border-brand-500/40 text-brand-300'
                  : 'bg-gray-800/60 border-white/10 text-gray-400 hover:border-white/25 hover:text-gray-200'
              }`}
            >
              <ChevronDown className={`w-4 h-4 transition-transform ${paramsOpen ? 'rotate-180' : ''}`} />
              Par�metros
              {visibleColumns.size < ALL_SALE_COLS.size && (
                <span className="text-[10px] font-bold bg-brand-500/20 text-brand-300 px-1.5 rounded-full">
                  {ALL_SALE_COLS.size - visibleColumns.size} ocultas
                </span>
              )}
            </button>
            {paramsOpen && (
              <div className="absolute right-0 top-full mt-2 w-52 bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl z-50 p-3 space-y-1">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2 px-1">Columnas visibles</p>
                {([
                  ['createdAt', 'Fecha'],
                  ['status',    'Estado'],
                  ['total',     'Monto'],
                  ['client',    'Cliente'],
                ] as const).map(([col, lbl]) => (
                  <label key={col} className="flex items-center gap-3 px-2 py-1.5 rounded-lg hover:bg-white/5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={visibleColumns.has(col)}
                      onChange={() => toggleColumn(col)}
                      className="w-3.5 h-3.5 rounded accent-brand-500 cursor-pointer"
                    />
                    <span className={`text-xs font-medium transition-colors ${visibleColumns.has(col) ? 'text-gray-200' : 'text-gray-500'}`}>{lbl}</span>
                  </label>
                ))}
                <div className="pt-1 border-t border-white/5">
                  <button onClick={() => setVisibleColumns(new Set(ALL_SALE_COLS))}
                    className="w-full text-center text-[10px] text-gray-500 hover:text-gray-300 transition-colors cursor-pointer py-1">
                    Mostrar todas
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <SalesTable
          sales={currentSales}
          onDelete={(sale) => setSaleToDelete(sale)}
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

        {saleToDelete && (
          <ConfirmModal
            isOpen={true}
            title="Confirmar cancelaci�n"
            variant="danger"
            message={
              <div className="space-y-4">
                <p>
                  �Est�s seguro de que quer�s cancelar la{' '}
                  <b>Venta #{saleToDelete.id}</b>? Esta acci�n no se puede
                  deshacer.
                </p>

                <div className="flex items-center justify-center gap-2 p-3 gap-3 bg-red-500/10 border border-red-500/20 rounded-lg">
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
                    Cancelaci�n silenciosa (No enviar email)
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


