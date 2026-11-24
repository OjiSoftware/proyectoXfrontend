import { useEffect, useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { productApi } from '@/services/ProductService';
import { saleApi } from '@/services/SaleService';
import { Sale } from '@/types/sale.types';
import { Product } from '@/types/product.types';
import {
  ShoppingCart,
  AlertTriangle,
  MessageSquareText,
  Store,
  Globe,
  CreditCard,
  Banknote,
  Calendar,
  Package,
  User,
  MapPin,
  Receipt,
  Barcode,
} from 'lucide-react';
import { PencilIcon } from '@heroicons/react/20/solid';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import {
  isPosGenericClient,
  getSaleChannelLabel,
  getSalePaymentLabel,
} from '@/helpers/saleExport';

interface SaleDetailsModalProps {
  isOpen: boolean;
  sale: Sale | null;
  onClose: () => void;
  onOpenNotes?: (sale: Sale) => void;
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

const isCriticalNote = (note: string) => {
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

interface EnrichedSaleLine {
  productId: number;
  code: string;
  name: string;
  categoryName?: string;
  price: number;
  quantity: number;
}

export function SaleDetailsModal({
  isOpen,
  sale,
  onClose,
  onOpenNotes,
}: SaleDetailsModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [enrichedDetails, setEnrichedDetails] = useState<EnrichedSaleLine[]>([]);
  const [fullSale, setFullSale] = useState<Sale | null>(null);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  useEffect(() => {
    let active = true;
    const fetchDetails = async () => {
      if (!isOpen || !sale) return;
      setIsLoading(true);
      try {
        const [productsData, saleData] = await Promise.all([
          productApi.getAllProducts().catch(() => [] as Product[]),
          saleApi.getById(sale.id.toString()).catch(() => null),
        ]);

        if (!active) return;

        const targetSale: Sale = saleData || sale;
        setFullSale(targetSale);

        const details = targetSale?.details || sale.details || [];

        const mappedDetails: EnrichedSaleLine[] = details.map((d: any) => {
          const product = Array.isArray(productsData)
            ? productsData.find((p: Product) => p.id === d.productId)
            : undefined;
          const price =
            d.unitaryPrice != null
              ? Number(d.unitaryPrice)
              : Number(d.product?.price ?? product?.price ?? 0);

          return {
            productId: d.productId,
            code: product?.barcode || d.product?.barcode || String(d.productId),
            name: product?.name || d.product?.name || `Artículo #${d.productId}`,
            categoryName: product?.category?.name,
            price: Number.isFinite(price) ? price : 0,
            quantity: Number(d.quantity) || 0,
          };
        });

        setEnrichedDetails(mappedDetails);
      } catch (error) {
        console.error('Error al cargar los detalles de la venta', error);
      } finally {
        if (active) setIsLoading(false);
      }
    };

    fetchDetails();
    return () => {
      active = false;
    };
  }, [isOpen, sale]);

  const formatARS = useMemo(
    () =>
      new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
        minimumFractionDigits: 2,
      }),
    [],
  );

  if (!isOpen || !sale) return null;

  const activeSale = fullSale || sale;
  const client = activeSale.client || sale.client;
  const isGenericPos = isPosGenericClient(client);
  const address = (client as any)?.addresses?.[0];
  const notes = activeSale.notes ?? sale.notes;
  const currentStatus = activeSale.status || sale.status;

  const statusInfo = SALE_STATUS_MAP[currentStatus] || {
    label: currentStatus,
    style: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  };

  const channelLabel = getSaleChannelLabel(activeSale);
  const isPosChannel = channelLabel.includes('POS');
  const paymentLabel = getSalePaymentLabel(activeSale);

  const itemsSubtotal = enrichedDetails.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  );
  const totalAmount = Number(activeSale.total) || itemsSubtotal;
  const surchargeDiff = Math.round((totalAmount - itemsSubtotal) * 100) / 100;
  const totalUnits = enrichedDetails.reduce((acc, item) => acc + item.quantity, 0);

  const formattedDate = activeSale.createdAt
    ? new Date(activeSale.createdAt).toLocaleString('es-AR', {
        timeZone: 'America/Argentina/Buenos_Aires',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }) + ' hs'
    : 'Sin fecha';

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-end md:items-center justify-center bg-black/70 backdrop-blur-md p-0 md:p-4 font-poppins"
      onClick={onClose}
    >
      <div
        className="bg-[#0C0A15]/95 backdrop-blur-3xl border-t md:border border-white/10 rounded-t-[32px] md:rounded-3xl p-5 md:p-6 w-full max-w-3xl shadow-[0_0_60px_rgba(0,0,0,0.7)] text-left transform transition-all animate-fade-in max-h-[90dvh] overflow-hidden flex flex-col ring-1 ring-white/5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera */}
        <div className="flex justify-between items-center mb-4 pb-3 border-b border-white/5 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
              <ShoppingCart size={20} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base md:text-lg font-bold text-slate-100">
                  Venta <span className="font-mono text-indigo-400">#{sale.id}</span>
                </h2>
                <span
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold border uppercase tracking-wider ${statusInfo.style}`}
                >
                  {statusInfo.label}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                <Calendar size={11} className="text-slate-500" />
                <span>{formattedDate}</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-slate-500 hover:text-rose-400 hover:bg-white/5 w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer text-2xl leading-none shrink-0"
          >
            &times;
          </button>
        </div>

        {isLoading ? (
          <div className="flex-1 flex justify-center items-center py-14">
            <span className="text-slate-400 text-sm animate-pulse">
              Cargando detalles del comprobante...
            </span>
          </div>
        ) : (
          <div className="space-y-4 flex-1 overflow-y-auto min-h-0 pr-1 custom-scrollbar">
            {/* Banner de Comentario / Nota Administrativa */}
            {notes ? (
              <div
                className={`border p-3.5 rounded-2xl flex items-start justify-between gap-3 ${
                  isCriticalNote(notes)
                    ? 'bg-amber-500/10 border-amber-500/40'
                    : 'bg-indigo-500/10 border-indigo-500/30'
                }`}
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div
                    className={`p-2 rounded-xl mt-0.5 shrink-0 ${
                      isCriticalNote(notes)
                        ? 'bg-amber-500/20 text-amber-400'
                        : 'bg-indigo-500/20 text-indigo-400'
                    }`}
                  >
                    {isCriticalNote(notes) ? (
                      <AlertTriangle className="w-4 h-4" />
                    ) : (
                      <MessageSquareText className="w-4 h-4" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h4
                      className={`font-bold text-[11px] uppercase tracking-wider mb-0.5 ${
                        isCriticalNote(notes) ? 'text-amber-400' : 'text-indigo-300'
                      }`}
                    >
                      {isCriticalNote(notes)
                        ? 'Atención Requerida / Observación'
                        : 'Comentario Administrativo'}
                    </h4>
                    <p className="text-xs md:text-sm text-slate-200 leading-relaxed break-words">
                      {notes}
                    </p>
                  </div>
                </div>

                {onOpenNotes && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenNotes(activeSale);
                    }}
                    className="shrink-0 px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] font-semibold text-slate-200 transition cursor-pointer"
                  >
                    Editar nota
                  </button>
                )}
              </div>
            ) : null}

            {/* BLOQUE RESUMEN OPERATIVO (3 KPI Cards como en ProductDetailsModal) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Canal y Cliente */}
              <div className="bg-white/[0.02] border border-white/5 p-3.5 rounded-2xl flex flex-col justify-between">
                <div className="flex items-center justify-between text-slate-400 mb-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider">
                    Canal y Cliente
                  </span>
                  <div className="w-6 h-6 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                    {isPosChannel ? <Store size={13} /> : <Globe size={13} />}
                  </div>
                </div>
                <div>
                  <span className="text-sm font-bold text-slate-100 block truncate">
                    {isGenericPos
                      ? 'Consumidor Final'
                      : `${client?.name || ''} ${client?.surname || ''}`.trim() ||
                        'Consumidor Final'}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] text-indigo-300 font-medium mt-0.5">
                    {channelLabel}
                    {!isGenericPos && client?.dni ? ` · DNI ${client.dni}` : ''}
                  </span>
                </div>
              </div>

              {/* Medio de Pago */}
              <div className="bg-white/[0.02] border border-white/5 p-3.5 rounded-2xl flex flex-col justify-between">
                <div className="flex items-center justify-between text-slate-400 mb-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider">
                    Medio de Pago
                  </span>
                  <div className="w-6 h-6 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
                    {paymentLabel.toLowerCase().includes('efectivo') ? (
                      <Banknote size={13} />
                    ) : (
                      <CreditCard size={13} />
                    )}
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-sm font-bold text-slate-100 capitalize">
                      {paymentLabel}
                    </span>
                    {activeSale.transaction?.cardLastFour && (
                      <span className="text-[10px] font-mono text-slate-400 bg-white/5 px-1.5 py-0.5 rounded border border-white/10">
                        *** {activeSale.transaction.cardLastFour}
                      </span>
                    )}
                  </div>
                  <span className="block text-[11px] text-slate-400 mt-0.5">
                    {totalUnits} {totalUnits === 1 ? 'unidad' : 'unidades'} ({enrichedDetails.length}{' '}
                    {enrichedDetails.length === 1 ? 'ítem' : 'ítems'})
                  </span>
                </div>
              </div>

              {/* Total Cobrado */}
              <div className="bg-emerald-500/[0.04] border border-emerald-500/20 p-3.5 rounded-2xl flex flex-col justify-between shadow-[0_0_20px_rgba(16,185,129,0.05)]">
                <div className="flex items-center justify-between text-emerald-400 mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider">
                    Monto Total
                  </span>
                  <div className="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                    <Receipt size={13} />
                  </div>
                </div>
                <div>
                  <span className="text-xl md:text-2xl font-black font-mono text-emerald-400 block">
                    {formatARS.format(totalAmount)}
                  </span>
                  {surchargeDiff > 0.01 && (
                    <span className="block text-[10px] text-amber-300 font-medium mt-0.5">
                      Incluye +{formatARS.format(surchargeDiff)} recargo
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Datos de Cliente Nominado (Solo si NO es el Consumidor Final genérico de Mostrador) */}
            {!isGenericPos && client && (
              <div className="bg-white/[0.02] p-4 rounded-2xl border border-white/5 shadow-inner">
                <h3 className="text-[10px] font-bold text-indigo-400 mb-2.5 uppercase tracking-widest border-b border-white/5 pb-2 flex items-center gap-1.5">
                  <User size={13} />
                  Datos de Contacto y Envío del Cliente
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-300">
                  <div className="space-y-1">
                    <p>
                      <span className="text-slate-500 font-medium">Cliente:</span>{' '}
                      <span className="font-semibold text-slate-100">
                        {client.name} {client.surname}
                      </span>
                    </p>
                    <p>
                      <span className="text-slate-500 font-medium">DNI / CUIT:</span>{' '}
                      <span className="font-mono">{client.dni || 'N/A'}</span>
                    </p>
                    <p className="truncate" title={client.email}>
                      <span className="text-slate-500 font-medium">Email:</span>{' '}
                      {client.email || 'N/A'}
                    </p>
                    <p>
                      <span className="text-slate-500 font-medium">Teléfono:</span>{' '}
                      <span className="font-mono">{client.phoneNumber || 'N/A'}</span>
                    </p>
                  </div>

                  {address && (
                    <div className="space-y-1 sm:border-l sm:border-white/5 sm:pl-3">
                      <p className="flex items-center gap-1 text-slate-400 font-semibold text-[11px] uppercase">
                        <MapPin size={12} className="text-indigo-400" />
                        Dirección registrada
                      </p>
                      <p>
                        {address.street} {address.streetNum}
                        {address.floor ? `, Piso ${address.floor}` : ''}
                        {address.apartment ? ` Dpto ${address.apartment}` : ''}
                      </p>
                      <p className="text-slate-400">
                        {address.locality}, {address.province} (CP:{' '}
                        {address.postalCode || address.zipCode || 'N/A'})
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tabla de Artículos de la Venta */}
            <div>
              <div className="flex items-center justify-between mb-2 px-1">
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Package size={13} className="text-indigo-400" />
                  Detalle de Artículos ({enrichedDetails.length})
                </h3>
                <span className="text-[11px] text-slate-400 font-mono">
                  Total unidades: <strong className="text-slate-200">{totalUnits}</strong>
                </span>
              </div>

              <div className="overflow-x-auto bg-white/[0.01] rounded-2xl border border-white/5">
                <table className="w-full text-left text-slate-300 text-xs border-collapse">
                  <thead className="text-[10px] uppercase bg-[#151124] text-slate-400 font-semibold tracking-wider border-b border-white/10">
                    <tr>
                      <th className="px-3.5 py-2.5 w-28">Código</th>
                      <th className="px-3.5 py-2.5">Artículo</th>
                      <th className="px-3.5 py-2.5 text-center w-20">Cant.</th>
                      <th className="px-3.5 py-2.5 text-right w-28">P. Unit.</th>
                      <th className="px-3.5 py-2.5 text-right w-32">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {enrichedDetails.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-4 py-6 text-center text-slate-500 italic"
                        >
                          Sin artículos registrados en este comprobante.
                        </td>
                      </tr>
                    ) : (
                      enrichedDetails.map((item, index) => (
                        <tr
                          key={`${item.productId}-${index}`}
                          className="hover:bg-white/5 transition-colors"
                        >
                          <td className="px-3.5 py-2.5 font-mono text-[11px] text-slate-400">
                            <span className="inline-flex items-center gap-1">
                              <Barcode size={12} className="text-slate-500 shrink-0" />
                              {item.code}
                            </span>
                          </td>
                          <td className="px-3.5 py-2.5">
                            <span className="font-semibold text-slate-100 block truncate max-w-[220px] sm:max-w-none">
                              {item.name}
                            </span>
                            {item.categoryName && (
                              <span className="text-[10px] text-slate-500">
                                {item.categoryName}
                              </span>
                            )}
                          </td>
                          <td className="px-3.5 py-2.5 text-center font-mono font-bold text-slate-200">
                            {item.quantity}
                          </td>
                          <td className="px-3.5 py-2.5 text-right font-mono text-slate-300">
                            {formatARS.format(item.price)}
                          </td>
                          <td className="px-3.5 py-2.5 text-right font-mono font-bold text-emerald-400">
                            {formatARS.format(item.price * item.quantity)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                  {enrichedDetails.length > 0 && (
                    <tfoot className="bg-[#151124]/60 border-t border-white/10 text-xs">
                      {surchargeDiff > 0.01 && (
                        <>
                          <tr>
                            <td colSpan={4} className="px-3.5 py-2 text-right text-slate-400">
                              Subtotal artículos
                            </td>
                            <td className="px-3.5 py-2 text-right font-mono text-slate-300">
                              {formatARS.format(itemsSubtotal)}
                            </td>
                          </tr>
                          <tr>
                            <td colSpan={4} className="px-3.5 py-2 text-right text-amber-300">
                              Recargo Tarjeta
                            </td>
                            <td className="px-3.5 py-2 text-right font-mono font-semibold text-amber-300">
                              + {formatARS.format(surchargeDiff)}
                            </td>
                          </tr>
                        </>
                      )}
                      <tr>
                        <td
                          colSpan={4}
                          className="px-3.5 py-2.5 text-right font-bold uppercase tracking-wider text-slate-300"
                        >
                          Total del Comprobante
                        </td>
                        <td className="px-3.5 py-2.5 text-right font-mono text-sm font-black text-emerald-400">
                          {formatARS.format(totalAmount)}
                        </td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-4 flex flex-wrap justify-end border-t border-white/5 pt-4 gap-2.5 shrink-0">
          <button
            type="button"
            className="btn btn-md btn-ghost rounded-xl flex-1 sm:flex-none"
            onClick={onClose}
          >
            Cerrar
          </button>

          {onOpenNotes && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenNotes(activeSale);
              }}
              className="btn btn-md btn-subtle rounded-xl flex-1 sm:flex-none"
            >
              <MessageSquareText className="w-4 h-4 text-amber-400" />
              {notes ? 'Editar comentario' : 'Agregar comentario'}
            </button>
          )}

          {currentStatus !== 'CANCELLED' && currentStatus !== 'COMPLETED' && (
            <Link
              title="Editar venta"
              to={ROUTES.sales.edit(Number(sale.id))}
              className="btn btn-md btn-primary rounded-xl flex-1 sm:flex-none"
            >
              <PencilIcon className="w-4 h-4" />
              Editar venta
            </Link>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
