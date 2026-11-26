import { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
  Tooltip,
} from 'flowbite-react';
import {
  TrashIcon,
  ArrowUpIcon,
  EyeIcon,
  ExclamationTriangleIcon,
  ChatBubbleBottomCenterTextIcon,
} from '@heroicons/react/20/solid';
import { Store, Globe, CreditCard, Banknote, Package } from 'lucide-react';
import { Sale } from '@/types/sale.types';
import { SaleDetailsModal } from '@/components/SaleDetailsModal';
import { SaleNotesModal } from '@/components/SaleNotesModal';
import {
  isPosGenericClient,
  getSaleChannelLabel,
  getSalePaymentLabel,
  getSaleUnitsCount,
} from '@/helpers/saleExport';

type SaleWithIndex = Sale & { originalIndex?: number };

interface SalesTableProps {
  sales: SaleWithIndex[];
  onDelete: (sale: Sale) => void;
  onUpdateNotes?: (saleId: number, notes: string) => void;
  currentPage: number;
  itemsPerPage: number;
  onSort: (column: string) => void;
  currentSortColumn: string | null;
  currentSortDirection: 'asc' | 'desc' | null;
  visibleColumns?: Set<string>;
}

const SALE_STATUS_MAP: Record<string, { label: string; style: string }> = {
  PENDING: {
    label: 'Pendiente',
    style: 'bg-amber-400/15 text-amber-300 border-amber-400/30',
  },
  IN_PROGRESS: {
    label: 'En curso',
    style: 'bg-sky-400/15 text-sky-300 border-sky-400/30',
  },
  COMPLETED: {
    label: 'Completada',
    style: 'bg-emerald-400/15 text-emerald-300 border-emerald-400/30',
  },
  CANCELLED: {
    label: 'Cancelada',
    style: 'bg-rose-400/15 text-rose-300 border-rose-400/30',
  },
};

export function SalesTable({
  sales,
  onDelete,
  onUpdateNotes,
  onSort,
  currentSortColumn,
  currentSortDirection,
  visibleColumns,
}: SalesTableProps) {
  const isVisible = (col: string) => !visibleColumns || visibleColumns.has(col);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  const [saleForNotes, setSaleForNotes] = useState<Sale | null>(null);

  const formatARS = useMemo(
    () =>
      new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
        minimumFractionDigits: 2,
      }),
    [],
  );

  const isCriticalNote = (note?: string | null) => {
    if (!note) return false;
    const content = note.toLowerCase();
    return (
      content.includes('fuera de término') ||
      content.includes('reembolsar') ||
      content.includes('revisar stock') ||
      content.includes('error') ||
      content.includes('pago rechazado')
    );
  };

  const handleOpenDetails = (sale: Sale) => {
    setSelectedSale(sale);
    setIsDetailsModalOpen(true);
  };

  const handleCloseDetails = () => {
    setIsDetailsModalOpen(false);
    setSelectedSale(null);
  };

  const handleOpenNotes = (sale: Sale) => {
    setSaleForNotes(sale);
    setIsNotesModalOpen(true);
  };

  const handleCloseNotes = () => {
    setIsNotesModalOpen(false);
    setSaleForNotes(null);
  };

  const renderSortArrow = (column: string) => {
    const isActive = currentSortColumn === column;
    return (
      <ArrowUpIcon
        className={`w-3 h-3 ms-1 transition-all duration-150 ${
          isActive && currentSortDirection
            ? currentSortDirection === 'desc'
              ? 'rotate-180 opacity-100'
              : 'opacity-100'
            : 'opacity-0'
        }`}
      />
    );
  };

  const formatDateAndTime = (dateStr?: string) => {
    if (!dateStr) return { date: '---', time: '' };
    const d = new Date(dateStr);
    return {
      date: d.toLocaleDateString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }),
      time:
        d.toLocaleTimeString('es-AR', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        }) + ' hs',
    };
  };

  const hideOnTablet = 'hidden lg:table-cell!';
  const hideOnMobile = 'hidden md:table-cell!';

  return (
    <div className="w-full relative">
      {/* VISTA MÓVIL: CARDS TÁCTILES (< md) */}
      <div className="md:hidden space-y-2.5">
        {sales.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs bg-[#12101F]/60 rounded-2xl border border-white/5">
            No se encontraron ventas registradas.
          </div>
        ) : (
          sales.map((sale) => {
            const statusInfo = SALE_STATUS_MAP[sale.status] || {
              label: sale.status,
              style: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
            };
            const hasNotes = Boolean(sale.notes && sale.notes.trim() !== '');
            const isGeneric = isPosGenericClient(sale.client);
            const channelLabel = getSaleChannelLabel(sale);
            const isPos = channelLabel.includes('POS');
            const paymentLabel = getSalePaymentLabel(sale);
            const units = getSaleUnitsCount(sale);
            const itemsCount = Array.isArray(sale.details) ? sale.details.length : 0;
            const { date, time } = formatDateAndTime(sale.createdAt);

            return (
              <div
                key={sale.id}
                className={`bg-[#12101F]/90 border ${
                  hasNotes
                    ? 'border-amber-500/30 bg-amber-500/[0.03]'
                    : 'border-white/10 hover:border-indigo-500/30'
                } rounded-2xl p-3.5 shadow-md transition active:bg-[#171427]`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-white font-mono">
                        #{sale.id}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold border ${
                          isPos
                            ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20'
                            : 'bg-violet-500/10 text-violet-300 border-violet-500/20'
                        }`}
                      >
                        {isPos ? <Store className="w-3 h-3" /> : <Globe className="w-3 h-3" />}
                        {isPos ? 'Mostrador' : 'Web'}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {date} · {time}
                      </span>
                    </div>

                    <p className="text-xs font-medium text-slate-200 mt-1 truncate">
                      {isGeneric
                        ? 'Consumidor Final'
                        : sale.client
                          ? `${sale.client.surname}, ${sale.client.name}`
                          : 'Consumidor Final'}
                    </p>

                    <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                      <span>{paymentLabel}</span>
                      <span>·</span>
                      <span>
                        {units > 0 ? `${units} u.` : `${itemsCount} ítems`}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold border uppercase tracking-wider ${statusInfo.style}`}
                    >
                      {statusInfo.label}
                    </span>
                    {hasNotes && (
                      <button
                        type="button"
                        onClick={() => handleOpenNotes(sale)}
                        className="inline-flex items-center gap-1 text-[10px] text-amber-400 hover:underline"
                      >
                        {isCriticalNote(sale.notes) ? (
                          <ExclamationTriangleIcon className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                        ) : (
                          <ChatBubbleBottomCenterTextIcon className="w-3.5 h-3.5 text-amber-400" />
                        )}
                        Nota
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-white/5">
                  <span className="text-sm font-bold text-emerald-400 font-mono">
                    {formatARS.format(Number(sale.total) ?? 0)}
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleOpenDetails(sale)}
                      className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition active:scale-95"
                      title="Ver detalles"
                    >
                      <EyeIcon className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenNotes(sale)}
                      className={`p-1.5 rounded-lg transition active:scale-95 ${
                        hasNotes
                          ? 'text-amber-400 bg-amber-500/10 hover:bg-amber-500/20'
                          : 'text-slate-400 hover:text-amber-400 hover:bg-amber-500/10'
                      }`}
                      title={hasNotes ? 'Ver / Editar comentario' : 'Agregar comentario'}
                    >
                      <ChatBubbleBottomCenterTextIcon className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => sale.status !== 'CANCELLED' && onDelete(sale)}
                      disabled={sale.status === 'CANCELLED'}
                      className={`p-1.5 rounded-lg transition ${
                        sale.status === 'CANCELLED'
                          ? 'text-slate-600 cursor-not-allowed opacity-40'
                          : 'text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 active:scale-95'
                      }`}
                      title={
                        sale.status === 'CANCELLED'
                          ? 'Esta venta ya ha sido cancelada'
                          : 'Cancelar venta'
                      }
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* VISTA ESCRITORIO: TABLA ESTANDARIZADA CON PRODUCTOS (md+) */}
      <div className="hidden md:block overflow-x-auto rounded-2xl management-table-container relative w-full">
        <Table hoverable className="w-full management-table">
          <TableHead className="bg-[#1b1b21] border-b border-white/10 text-slate-300 [&_th]:!bg-transparent [&_th]:transition-all [&_th:hover]:!bg-white/5 [&_th]:font-semibold [&_th]:text-xs [&_th]:uppercase [&_th]:tracking-wider">
            <TableRow className="hover:bg-transparent border-none">
              <TableHeadCell
                className="px-4 w-14 cursor-pointer select-none"
                onClick={() => onSort('rowNum')}
              >
                <div className="flex items-center">
                  # {renderSortArrow('rowNum')}
                </div>
              </TableHeadCell>

              {isVisible('saleId') && (
                <TableHeadCell
                  className="cursor-pointer select-none text-left"
                  onClick={() => onSort('id')}
                >
                  <div className="relative inline-flex items-center">
                    <span>Comprobante</span>
                    <div className="absolute -right-5">{renderSortArrow('id')}</div>
                  </div>
                </TableHeadCell>
              )}

              {isVisible('createdAt') && (
                <TableHeadCell
                  className={`${hideOnMobile} cursor-pointer select-none text-center`}
                  onClick={() => onSort('createdAt')}
                >
                  <div className="relative inline-flex items-center justify-center">
                    <span>Fecha</span>
                    <div className="absolute -right-5">{renderSortArrow('createdAt')}</div>
                  </div>
                </TableHeadCell>
              )}

              {isVisible('time') && (
                <TableHeadCell
                  className={`${hideOnMobile} select-none text-center`}
                >
                  <span>Hora</span>
                </TableHeadCell>
              )}

              {isVisible('client') && (
                <TableHeadCell
                  className={`${hideOnMobile} cursor-pointer select-none text-left`}
                  onClick={() => onSort('client.name')}
                >
                  <div className="relative inline-flex items-center">
                    <span>Cliente / Canal</span>
                    <div className="absolute -right-5">{renderSortArrow('client.name')}</div>
                  </div>
                </TableHeadCell>
              )}

              {isVisible('items') && (
                <TableHeadCell
                  className={`${hideOnTablet} cursor-pointer select-none text-center`}
                  onClick={() => onSort('items')}
                >
                  <div className="relative inline-flex items-center justify-center">
                    <span>Artículos</span>
                    <div className="absolute -right-5">{renderSortArrow('items')}</div>
                  </div>
                </TableHeadCell>
              )}

              {isVisible('payment') && (
                <TableHeadCell
                  className={`${hideOnTablet} cursor-pointer select-none text-center`}
                  onClick={() => onSort('payment')}
                >
                  <div className="relative inline-flex items-center justify-center">
                    <span>Pago</span>
                    <div className="absolute -right-5">{renderSortArrow('payment')}</div>
                  </div>
                </TableHeadCell>
              )}

              {isVisible('status') && (
                <TableHeadCell
                  className="cursor-pointer select-none text-center"
                  onClick={() => onSort('status')}
                >
                  <div className="relative inline-flex items-center justify-center">
                    <span>Estado</span>
                    <div className="absolute -right-5">{renderSortArrow('status')}</div>
                  </div>
                </TableHeadCell>
              )}

              <TableHeadCell className="w-10 px-2 select-none text-center" />

              {isVisible('total') && (
                <TableHeadCell
                  className={`${hideOnMobile} cursor-pointer select-none text-center`}
                  onClick={() => onSort('total')}
                >
                  <div className="relative inline-flex items-center justify-center">
                    <span>Monto</span>
                    <div className="absolute -right-5">{renderSortArrow('total')}</div>
                  </div>
                </TableHeadCell>
              )}

              <TableHeadCell className="select-none text-center">
                Acciones
              </TableHeadCell>
            </TableRow>
          </TableHead>

          <TableBody className="divide-y divide-white/5">
            {sales.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell
                  colSpan={11}
                  className="text-center py-8 text-slate-400 text-sm"
                >
                  No se encontraron ventas registradas.
                </TableCell>
              </TableRow>
            ) : (
              sales.map((sale) => {
                const hasNotes = Boolean(sale.notes && sale.notes.trim() !== '');
                const isGeneric = isPosGenericClient(sale.client);
                const channelLabel = getSaleChannelLabel(sale);
                const isPos = channelLabel.includes('POS');
                const paymentLabel = getSalePaymentLabel(sale);
                const isCash = paymentLabel.toLowerCase().includes('efectivo');
                const units = getSaleUnitsCount(sale);
                const itemsCount = Array.isArray(sale.details) ? sale.details.length : 0;
                const { date, time } = formatDateAndTime(sale.createdAt);
                const statusInfo = SALE_STATUS_MAP[sale.status] || {
                  label: sale.status,
                  style: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
                };

                return (
                  <TableRow
                    key={sale.id}
                    className={`bg-transparent transition-colors text-sm border-white/5 group ${
                      hasNotes
                        ? 'hover:bg-amber-500/15 bg-amber-500/5'
                        : 'hover:bg-white/5'
                    }`}
                  >
                    {/* # Fila */}
                    <TableCell className="px-4 font-medium text-slate-500/70 group-hover:text-indigo-400 transition-colors">
                      {sale.originalIndex}
                    </TableCell>

                    {/* Comprobante */}
                    {isVisible('saleId') && (
                      <TableCell className="text-left py-3">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-100">
                            #{sale.id}
                          </span>
                          <span
                            className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-semibold border ${
                              isPos
                                ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20'
                                : 'bg-violet-500/10 text-violet-300 border-violet-500/20'
                            }`}
                          >
                            {isPos ? <Store className="w-3 h-3" /> : <Globe className="w-3 h-3" />}
                            {isPos ? 'POS' : 'Web'}
                          </span>
                        </div>
                      </TableCell>
                    )}

                    {/* Fecha */}
                    {isVisible('createdAt') && (
                      <TableCell className={`${hideOnMobile} text-center py-3 text-slate-200 font-medium`}>
                        {date}
                      </TableCell>
                    )}

                    {/* Hora */}
                    {isVisible('time') && (
                      <TableCell className={`${hideOnMobile} text-center py-3 text-slate-400 font-mono text-xs`}>
                        {time || '---'}
                      </TableCell>
                    )}

                    {/* Cliente / Canal */}
                    {isVisible('client') && (
                      <TableCell className={`${hideOnMobile} text-left py-3`}>
                        {isGeneric ? (
                          <div className="flex flex-col">
                            <span className="font-semibold text-slate-200">
                              Consumidor Final
                            </span>
                            <span className="text-[11px] text-slate-400">
                              Venta de mostrador
                            </span>
                          </div>
                        ) : sale.client ? (
                          <div className="flex flex-col">
                            <span className="font-semibold text-slate-100">
                              {sale.client.surname}, {sale.client.name}
                            </span>
                            <span className="text-[11px] text-slate-400 font-mono">
                              {sale.client.dni ? `DNI ${sale.client.dni}` : sale.client.email}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic text-xs">
                            Consumidor Final
                          </span>
                        )}
                      </TableCell>
                    )}

                    {/* Artículos / Unidades */}
                    {isVisible('items') && (
                      <TableCell className={`${hideOnTablet} text-center py-3`}>
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.03] border border-white/5 text-xs">
                          <Package className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                          <span className="font-mono font-bold text-slate-200">
                            {units > 0 ? `${units} u.` : `${itemsCount}`}
                          </span>
                          {units > 0 && itemsCount > 0 && (
                            <span className="text-[10px] text-slate-400">
                              ({itemsCount} {itemsCount === 1 ? 'ítem' : 'ítems'})
                            </span>
                          )}
                        </div>
                      </TableCell>
                    )}

                    {/* Medio de Pago */}
                    {isVisible('payment') && (
                      <TableCell className={`${hideOnTablet} text-center py-3`}>
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${
                            isCash
                              ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                              : 'bg-amber-500/10 text-amber-300 border-amber-500/20'
                          }`}
                        >
                          {isCash ? (
                            <Banknote className="w-3.5 h-3.5" />
                          ) : (
                            <CreditCard className="w-3.5 h-3.5" />
                          )}
                          <span className="capitalize">{paymentLabel}</span>
                        </span>
                      </TableCell>
                    )}

                    {/* Estado */}
                    {isVisible('status') && (
                      <TableCell className="text-center py-3">
                        <span
                          className={`px-2 py-0.5 rounded-md text-xs font-bold border inline-block uppercase tracking-wider ${statusInfo.style}`}
                        >
                          {statusInfo.label}
                        </span>
                      </TableCell>
                    )}

                    {/* Columna sin nombre para indicador de comentario */}
                    <TableCell className="w-10 px-2 text-center py-3">
                      {hasNotes && (
                        <Tooltip
                          content={sale.notes}
                          placement="top"
                          className="max-w-xs text-center"
                        >
                          <button
                            type="button"
                            onClick={() => handleOpenNotes(sale)}
                            className="inline-flex items-center justify-center cursor-pointer"
                          >
                            {isCriticalNote(sale.notes) ? (
                              <ExclamationTriangleIcon className="w-4 h-4 text-amber-500 animate-pulse" />
                            ) : (
                              <ChatBubbleBottomCenterTextIcon className="w-4 h-4 text-amber-400" />
                            )}
                          </button>
                        </Tooltip>
                      )}
                    </TableCell>

                    {/* Monto Total */}
                    {isVisible('total') && (
                      <TableCell
                        className={`${hideOnMobile} text-center font-mono text-emerald-400 font-semibold py-3 text-sm`}
                      >
                        {formatARS.format(Number(sale.total) ?? 0)}
                      </TableCell>
                    )}

                    {/* Acciones */}
                    <TableCell className="py-3">
                      <div className="flex items-center justify-center gap-3">
                        <button
                          type="button"
                          title="Ver detalles de la venta"
                          className="text-slate-400 hover:text-indigo-400 transition-colors active:scale-95 cursor-pointer"
                          onClick={() => handleOpenDetails(sale)}
                        >
                          <EyeIcon className="w-5 h-5" />
                        </button>

                        <button
                          type="button"
                          title={
                            hasNotes
                              ? 'Ver / Editar comentario administrativo'
                              : 'Agregar comentario administrativo'
                          }
                          onClick={() => handleOpenNotes(sale)}
                          className={`relative transition-colors active:scale-95 cursor-pointer ${
                            hasNotes
                              ? 'text-amber-400 hover:text-amber-300'
                              : 'text-slate-400 hover:text-amber-400'
                          }`}
                        >
                          <ChatBubbleBottomCenterTextIcon className="w-5 h-5" />
                          {hasNotes && (
                            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-400 ring-2 ring-[#0d0a18]" />
                          )}
                        </button>

                        <button
                          type="button"
                          title={
                            sale.status === 'CANCELLED'
                              ? 'Esta venta ya ha sido cancelada'
                              : 'Cancelar venta'
                          }
                          className={
                            sale.status === 'CANCELLED'
                              ? 'text-slate-500 cursor-not-allowed opacity-40'
                              : 'text-slate-400 hover:text-rose-400 transition-colors active:scale-95 cursor-pointer'
                          }
                          onClick={() =>
                            sale.status !== 'CANCELLED' && onDelete(sale)
                          }
                          disabled={sale.status === 'CANCELLED'}
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Modal de Detalles */}
      <SaleDetailsModal
        isOpen={isDetailsModalOpen}
        sale={selectedSale}
        onClose={handleCloseDetails}
        onOpenNotes={(sale) => handleOpenNotes(sale)}
      />

      {/* Modal de Notas / Comentarios */}
      <SaleNotesModal
        isOpen={isNotesModalOpen}
        sale={saleForNotes}
        onClose={handleCloseNotes}
        onSuccess={(updatedNotes) => {
          if (saleForNotes && onUpdateNotes) {
            onUpdateNotes(saleForNotes.id, updatedNotes);
          }
        }}
      />
    </div>
  );
}
