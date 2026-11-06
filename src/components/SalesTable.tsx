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
  PencilIcon,
  TrashIcon,
  ArrowUpIcon,
  EyeIcon,
  ExclamationTriangleIcon,
  ChatBubbleBottomCenterTextIcon,
} from '@heroicons/react/20/solid';
import { Sale } from '@/types/sale.types';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { SaleDetailsModal } from '@/components/SaleDetailsModal';
import { SaleNotesModal } from '@/components/SaleNotesModal'; // <-- Importamos el modal de notas

type SortColumn = keyof Sale | 'client.name' | 'rowNum';

interface SalesTableProps {
  sales: Sale[];
  onDelete: (Sale: Sale) => void;
  currentPage: number;
  itemsPerPage: number;
  onSort: (column: string) => void;
  currentSortColumn: string | null;
  currentSortDirection: 'asc' | 'desc' | null;
}

const SALE_STATUS_MAP: Record<string, { label: string; style: string }> = {
  PENDING: {
    label: 'Pendiente',
    style: 'bg-amber-400/15 text-amber-300 border-amber-400/30',
  },
  IN_PROGRESS: {
    label: 'En curso',
    style: 'bg-slate-400/15 text-slate-200 border-slate-400/30',
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
  currentPage,
  itemsPerPage,
  onSort,
  currentSortColumn,
  currentSortDirection,
  visibleColumns,
}: SalesTableProps & { visibleColumns?: Set<string> }) {
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

  const isCriticalNote = (note: string) => {
    if (!note) return false;
    const content = note.toLowerCase();
    return (
      content.includes('fuera de término') ||
      content.includes('reembolsar') ||
      content.includes('revisar stock') ||
      content.includes('pago mp') ||
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

  const handleSort = (column: SortColumn) => {
    onSort(column as string);
  };

  const renderSortArrow = (column: SortColumn) => {
    const isActive = currentSortColumn === column;
    return (
      <ArrowUpIcon
        className={`w-3 h-3 ms-1 transition-all duration-150 ${isActive && currentSortDirection
          ? currentSortDirection === 'desc'
            ? 'rotate-180 opacity-100'
            : 'opacity-100'
          : 'opacity-0'
          }`}
      />
    );
  };

  const displaySales = useMemo(() => {
    return sales;
  }, [sales]);

  return (
    <div className="overflow-x-auto rounded-2xl management-table-container relative w-full">
      <Table hoverable className="w-full management-table">
        <TableHead className="bg-[#151124] border-b border-white/10 text-slate-300 [&_th]:!bg-transparent [&_th]:transition-all [&_th:hover]:!bg-white/5 [&_th]:font-semibold [&_th]:text-xs [&_th]:uppercase [&_th]:tracking-wider">
          <TableRow className="hover:bg-transparent border-none">
            <TableHeadCell
              className="px-4 w-14 cursor-pointer select-none"
              onClick={() => handleSort('rowNum')}
            >
              <div className="flex items-center">
                # {renderSortArrow('rowNum')}
              </div>
            </TableHeadCell>

            {isVisible('createdAt') && (
              <TableHeadCell
                className="hidden md:table-cell! cursor-pointer select-none text-center"
                onClick={() => handleSort('createdAt')}
              >
                <div className="relative inline-flex items-center justify-center">
                  <span>Fecha</span>
                  <div className="absolute -right-6">{renderSortArrow('createdAt')}</div>
                </div>
              </TableHeadCell>
            )}

            {isVisible('status') && (
              <TableHeadCell
                className="cursor-pointer select-none text-center"
                onClick={() => handleSort('status')}
              >
                <div className="relative inline-flex items-center justify-center">
                  <span>Estado</span>
                  <div className="absolute -right-6">{renderSortArrow('status')}</div>
                </div>
              </TableHeadCell>
            )}

            {isVisible('total') && (
              <TableHeadCell
                className="hidden md:table-cell! cursor-pointer select-none text-center"
                onClick={() => handleSort('total')}
              >
                <div className="relative inline-flex items-center justify-center">
                  <span>Monto</span>
                  <div className="absolute -right-6">{renderSortArrow('total')}</div>
                </div>
              </TableHeadCell>
            )}

            {isVisible('client') && (
              <TableHeadCell
                className="hidden md:table-cell! cursor-pointer select-none text-center"
                onClick={() => handleSort('client.name')}
              >
                <div className="relative inline-flex items-center justify-center">
                  <span>Cliente</span>
                  <div className="absolute -right-6">{renderSortArrow('client.name')}</div>
                </div>
              </TableHeadCell>
            )}

            <TableHeadCell className="select-none text-center">Acciones</TableHeadCell>
          </TableRow>
        </TableHead>

        <TableBody className="divide-y divide-white/5">
          {displaySales.map((sale) => (
            <TableRow
              key={sale.id}
              className={`bg-transparent transition-colors text-sm border-white/5 group ${(sale as any).notes
                ? 'hover:bg-amber-500/15 bg-amber-500/5'
                : 'hover:bg-white/5'
                }`}
            >
              <TableCell className="px-4 font-bold align-top py-3 lg:align-middle">
                <div className="flex flex-col">
                  <span className="text-slate-300 group-hover:text-indigo-400 transition-colors">{(sale as any).originalIndex}</span>
                  <span className="sm:hidden font-mono text-emerald-400 mt-0.5">
                    {formatARS.format(Number(sale.total) ?? 0)}
                  </span>
                </div>
              </TableCell>

              {isVisible('createdAt') && (
                <TableCell className="hidden md:table-cell! text-center text-slate-300 align-top py-4 lg:align-middle">
                  {sale.createdAt ? new Date(sale.createdAt).toLocaleDateString('es-AR') : '---'}
                </TableCell>
              )}

              {isVisible('status') && (
                <TableCell className="text-center align-middle md:align-top py-4 lg:align-middle">
                  <div className="relative inline-flex items-center justify-center">
                    {(() => {
                      const statusInfo = SALE_STATUS_MAP[sale.status] || { label: sale.status, style: 'bg-gray-500/10 text-gray-400 border-gray-500/20' };
                      return (
                        <span className={`px-2 py-0.5 rounded-md text-xs font-bold border inline-block uppercase tracking-wider ${statusInfo.style}`}>
                          {statusInfo.label}
                        </span>
                      );
                    })()}
                    {(sale as any).notes && (
                      <div className="absolute -right-8 top-1/2 -translate-y-1/2">
                        <Tooltip content={(sale as any).notes} placement="top" className="max-w-xs text-center">
                          {isCriticalNote((sale as any).notes) ? (
                            <ExclamationTriangleIcon className="w-5 h-5 text-amber-500 animate-pulse cursor-help" />
                          ) : (
                            <ChatBubbleBottomCenterTextIcon className="w-5 h-5 text-gray-300 cursor-help opacity-80" />
                          )}
                        </Tooltip>
                      </div>
                    )}
                  </div>
                </TableCell>
              )}

              {isVisible('total') && (
                <TableCell className="hidden md:table-cell! text-center font-mono text-emerald-400 font-semibold align-top py-4 lg:align-middle">
                  {formatARS.format(Number(sale.total) ?? 0)}
                </TableCell>
              )}

              {isVisible('client') && (
                <TableCell className="hidden md:table-cell! text-slate-200 font-medium align-top py-4 lg:align-middle">
                  {sale.client ? `${sale.client.surname}, ${sale.client.name}` : (
                    <span className="text-slate-400 italic text-sm font-normal">Sin cliente</span>
                  )}
                </TableCell>
              )}

              <TableCell>
                <div className="flex items-center justify-center gap-3">
                  <button
                    title="Ver detalles"
                    className="text-slate-400 hover:text-indigo-400 transition-colors active:scale-95 cursor-pointer"
                    onClick={() => handleOpenDetails(sale)}
                  >
                    <EyeIcon className="w-5 h-5" />
                  </button>

                  {sale.status === 'COMPLETED' ? (
                    <button
                      title="Agregar / Ver notas"
                      type="button"
                      onClick={() => handleOpenNotes(sale)}
                      className="text-slate-400 hover:text-amber-400 transition-colors active:scale-95 cursor-pointer"
                    >
                      <ChatBubbleBottomCenterTextIcon className="w-5 h-5" />
                    </button>
                  ) : (
                    <div
                      className={
                        sale.status === 'CANCELLED' ? 'cursor-not-allowed' : ''
                      }
                      title={
                        sale.status === 'CANCELLED'
                          ? 'Venta cancelada'
                          : 'Editar venta'
                      }
                    >
                      <Link
                        to={
                          sale.status === 'CANCELLED'
                            ? '#'
                            : ROUTES.sales.edit(sale.id)
                        }
                        className={
                          sale.status === 'CANCELLED'
                            ? 'text-slate-500 pointer-events-none opacity-40'
                            : 'text-slate-400 hover:text-amber-400 transition-colors active:scale-95'
                        }
                        onClick={(e) =>
                          sale.status === 'CANCELLED' && e.preventDefault()
                        }
                      >
                        <PencilIcon className="w-5 h-5" />
                      </Link>
                    </div>
                  )}

                  {/* Botón Borrar */}
                  <button
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
          ))}
        </TableBody>
      </Table>

      {/* Modal de Detalles Original */}
      <SaleDetailsModal
        isOpen={isDetailsModalOpen}
        sale={selectedSale}
        onClose={handleCloseDetails}
      />

      {/* Nuevo Modal de Notas */}
      <SaleNotesModal
        isOpen={isNotesModalOpen}
        sale={saleForNotes}
        onClose={handleCloseNotes}
        onSuccess={() => {
          // Opción rápida para recargar la tabla al guardar la nota.
          // (Si tenés una prop "onUpdate" o "refreshSales", es mejor usarla acá en vez del reload).
          window.location.reload();
        }}
      />
    </div>
  );
}

