import { useEffect, useState, useMemo } from 'react';
import { productApi } from '@/services/ProductService';
import { saleApi } from '@/services/SaleService';
import { Sale } from '@/types/sale.types';
import { Product } from '@/types/product.types';
import { PencilIcon, ShoppingCart, AlertTriangle, MessageSquareText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';

interface SaleDetailsModalProps {
  isOpen: boolean;
  sale: Sale | null;
  onClose: () => void;
}

// Mantenemos la misma fuente de la verdad visual que en la tabla
const SALE_STATUS_MAP: Record<string, { label: string; style: string }> = {
  PENDING: {
    label: 'Pendiente',
    style: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  },
  IN_PROGRESS: {
    label: 'En curso',
    style: 'bg-slate-500/10 text-slate-500 border-slate-500/20',
  },
  COMPLETED: {
    label: 'Completada',
    style: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  },
  CANCELLED: {
    label: 'Cancelada',
    style: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
  },
};

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

export function SaleDetailsModal({
  isOpen,
  sale,
  onClose,
}: SaleDetailsModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [enrichedDetails, setEnrichedDetails] = useState<any[]>([]);
  const [fullSale, setFullSale] = useState<any>(null);

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
    const fetchDetails = async () => {
      if (!isOpen || !sale) return;
      setIsLoading(true);
      try {
        const productsData: Product[] = await productApi.getAllProducts();
        const saleData = await saleApi.getById(sale.id.toString());

        setFullSale(saleData);

        const details = saleData?.details || sale.details || [];

        const mappedDetails = details.map((d: any) => {
          const product = productsData.find((p: any) => p.id === d.productId);
          const price = d.unitaryPrice
            ? Number(d.unitaryPrice)
            : Number(product?.price || 0);
          return {
            productId: d.productId,
            name: product?.name || 'Producto desconocido',
            price: price,
            quantity: d.quantity,
          };
        });

        setEnrichedDetails(mappedDetails);
      } catch (error) {
        console.error('Error al cargar los detalles de la venta', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetails();
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

  const client = fullSale?.client || sale?.client;
  const address = client?.addresses?.[0];
  const notes = fullSale?.notes || (sale as any)?.notes;
  const currentStatus = fullSale?.status || sale.status;

  const statusInfo = SALE_STATUS_MAP[currentStatus] || {
    label: currentStatus,
    style: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end md:items-center justify-center bg-black/60 backdrop-blur-md p-0 md:p-4"
      onClick={onClose}
    >
      <div
        className="bg-[#0C0A15]/95 backdrop-blur-3xl border-t md:border border-white/10 text-left transform transition-all duration-300 animate-slide-up md:animate-fade-in flex flex-col h-[90vh] md:h-auto md:min-h-[600px] md:max-h-[90vh] rounded-t-[32px] md:rounded-3xl p-4 md:p-6 w-full max-w-4xl shadow-[0_0_50px_rgba(0,0,0,0.5)] ring-1 ring-white/5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera */}
        <div className="flex justify-between items-center mb-4 md:mb-6 border-b border-white/5 pb-3 md:pb-4 shrink-0">
          <h2 className="text-lg md:text-xl font-bold text-slate-100 flex items-center gap-2">
            <ShoppingCart className="text-brand-400" size={20} />
            Detalles de la venta
            <span className="tracking-wider">#{sale.id}</span>
          </h2>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-rose-400 hover:bg-white/5 w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer text-2xl md:text-3xl leading-none"
          >
            &times;
          </button>
        </div>

        {isLoading ? (
          <div className="flex-1 flex justify-center items-center py-12">
            <span className="text-gray-400 text-sm md:text-base animate-pulse">
              Cargando detalles...
            </span>
          </div>
        ) : (
          <div className="space-y-4 md:space-y-6 flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {notes && (
              <div
                className={`border p-3 md:p-4 rounded-lg flex items-start gap-3 mb-2 shadow-sm ${
                  isCriticalNote(notes)
                    ? 'bg-amber-500/10 border-amber-500/50 animate-pulse shadow-amber-500/5'
                    : 'bg-brand-500/10 border-brand-500/50 shadow-brand-500/5'
                }`}
              >
                <div
                  className={`p-1.5 rounded-full mt-0.5 shrink-0 ${
                    isCriticalNote(notes)
                      ? 'bg-amber-500/20'
                      : 'bg-brand-500/20'
                  }`}
                >
                  {isCriticalNote(notes) ? (
                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                  ) : (
                    <MessageSquareText className="w-5 h-5 text-brand-400" />
                  )}
                </div>
                <div>
                  <h4
                    className={`font-bold text-xs md:text-sm uppercase tracking-wide mb-1 ${
                      isCriticalNote(notes)
                        ? 'text-amber-500'
                        : 'text-brand-400'
                    }`}
                  >
                    {isCriticalNote(notes)
                      ? 'Atención Requerida'
                      : 'Notas Administrativas'}
                  </h4>
                  <p
                    className={`text-xs md:text-sm leading-relaxed ${
                      isCriticalNote(notes)
                        ? 'text-amber-100/80'
                        : 'text-gray-300'
                    }`}
                  >
                    {notes}
                  </p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              {/* Info Venta COMPLETA */}
              <div className="bg-white/[0.02] p-3 md:p-4 rounded-2xl border border-white/5 shadow-inner">
                <h3 className="text-[10px] md:text-xs font-semibold text-indigo-400 mb-2 md:mb-3 uppercase tracking-widest border-b border-white/5 pb-2">
                  Detalle del Comprobante
                </h3>
                <div className="space-y-2 md:space-y-3 text-xs md:text-sm text-slate-300">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Estado:</span>
                    {/* BADGE SINCRONIZADO CON LA TABLA */}
                    <span
                      className={`px-2.5 py-1 rounded-md text-[10px] md:text-xs font-bold border inline-block uppercase tracking-wider ${statusInfo.style}`}
                    >
                      {statusInfo.label}
                    </span>
                  </div>
                  <p>
                    <strong className="text-gray-400 font-medium">
                      Fecha y hora:
                    </strong>{' '}
                    {sale.createdAt
                      ? new Date(sale.createdAt).toLocaleString('es-AR', {
                          timeZone: 'America/Argentina/Buenos_Aires',
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: false,
                        }) + ' hs'
                      : 'Sin fecha'}
                  </p>

                  {fullSale?.transaction && (
                    <p className="flex items-center flex-wrap gap-1">
                      <strong className="text-gray-400 font-medium">
                        Pago:
                      </strong>{' '}
                      <span className="text-brand-300 font-semibold capitalize">
                        {fullSale.transaction.paymentMethod || 'N/A'}
                      </span>
                      {fullSale.transaction.cardLastFour && (
                        <span className="text-[10px] md:text-xs text-gray-400 bg-slate-800 px-1.5 ml-0.5 rounded border border-slate-600">
                          (*** {fullSale.transaction.cardLastFour})
                        </span>
                      )}
                    </p>
                  )}
                  <div className="pt-2 border-t border-white/5 mt-2">
                    <p className="flex justify-between items-center text-sm md:text-base">
                      <strong className="text-slate-500 font-medium">
                        Monto total:
                      </strong>{' '}
                      <span className="text-emerald-400 font-bold px-2 py-1">
                        {formatARS.format(Number(sale.total))}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Datos del Cliente COMPLETOS */}
              <div className="bg-white/[0.02] p-3 md:p-4 rounded-2xl border border-white/5 shadow-inner">
                <h3 className="text-[10px] md:text-xs font-semibold text-indigo-400 mb-2 md:mb-3 uppercase tracking-widest border-b border-white/5 pb-2">
                  Datos del Cliente
                </h3>
                {client ? (
                  <div className="space-y-1.5 md:space-y-2 text-xs md:text-sm text-slate-300">
                    <p>
                      <strong className="text-slate-500 font-medium">
                        Nombre:
                      </strong>{' '}
                      {client.name} {client.surname}
                    </p>
                    <p>
                      <strong className="text-gray-400 font-medium">
                        DNI:
                      </strong>{' '}
                      {client.dni || 'N/A'}
                    </p>
                    <p
                      className="truncate"
                      title={`${client.email} | ${client.phoneNumber}`}
                    >
                      <strong className="text-gray-400 font-medium">
                        Contacto:
                      </strong>{' '}
                      {client.email || 'N/A'} | {client.phoneNumber || 'N/A'}
                    </p>
                    {address && (
                      <div className="pt-1 md:pt-2 border-t border-slate-600/50 mt-1 md:mt-2">
                        <p
                          className="truncate"
                          title={`${address.street} ${address.streetNum}`}
                        >
                          <strong className="text-gray-400 font-medium">
                            Dirección:
                          </strong>{' '}
                          {address.street} {address.streetNum}
                          {address.floor ? `, Piso ${address.floor}` : ''}
                          {address.apartment
                            ? ` Dpto ${address.apartment}`
                            : ''}
                        </p>
                        <p>
                          <strong className="text-gray-400 font-medium">
                            Ubicación:
                          </strong>{' '}
                          {address.locality}, {address.province}
                        </p>
                        <p>
                          <strong className="text-gray-400 font-medium">
                            CP:
                          </strong>{' '}
                          {address.postalCode ||
                            address.zipCode ||
                            address.zip_code ||
                            'N/A'}{' '}
                          <span className="text-gray-500 mx-1">|</span>{' '}
                          <strong className="text-gray-400 font-medium">
                            País:
                          </strong>{' '}
                          {address.country || 'Argentina'}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-xs md:text-sm text-gray-400 italic">
                    Cliente no registrado
                  </p>
                )}
              </div>
            </div>

            {/* Tabla Estilo Desktop Centrada */}
            <div>
              <h3 className="text-[10px] md:text-xs font-semibold text-indigo-400 mb-2 md:mb-3 uppercase tracking-widest border-b border-white/5 pb-2">
                Productos
              </h3>
              <div className="overflow-x-auto bg-white/[0.01] rounded-2xl border border-white/5">
                <table className="w-full text-center text-slate-300 text-xs md:text-sm whitespace-nowrap md:whitespace-normal">
                  <thead className="text-[10px] uppercase bg-black/20 text-slate-400 font-semibold tracking-wider border-b border-white/5">
                    <tr>
                      <th className="px-3 md:px-4 py-2 md:py-3 text-left w-8 md:w-12">
                        #
                      </th>
                      <th className="px-3 md:px-4 py-2 md:py-3 text-left">
                        Producto
                      </th>
                      <th className="px-3 md:px-4 py-2 md:py-3">Cant.</th>
                      <th className="px-3 md:px-4 py-2 md:py-3">Precio</th>
                      <th className="px-3 md:px-4 py-2 md:py-3">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {enrichedDetails.map((item, index) => (
                      <tr
                        key={index}
                        className="hover:bg-white/5 transition-colors group"
                      >
                        <td className="px-3 md:px-4 py-2 md:py-3 text-left text-slate-500 font-medium group-hover:text-indigo-400 transition-colors">
                          {index + 1}
                        </td>
                        <td
                          className="px-3 md:px-4 py-2 md:py-3 text-left font-semibold text-slate-200 max-w-[150px] md:max-w-none truncate"
                          title={item.name}
                        >
                          {item.name}
                        </td>
                        <td className="px-3 md:px-4 py-2 md:py-3">
                          {item.quantity}
                        </td>
                        <td className="px-3 md:px-4 py-2 md:py-3">
                          {formatARS.format(item.price)}
                        </td>
                        <td className="px-3 md:px-4 py-2 md:py-3 font-bold text-brand-300">
                          {formatARS.format(item.price * item.quantity)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-4 md:mt-6 flex justify-end border-t border-white/5 pt-4 gap-2 md:gap-3 shrink-0">
          <button
            className="px-4 md:px-6 py-3 md:py-2.5 font-bold rounded-2xl text-xs flex-1 md:flex-none border border-white/10 text-slate-300 bg-transparent transition-all duration-300 cursor-pointer hover:bg-white/5 hover:text-white"
            onClick={onClose}
          >
            Cerrar
          </button>
          <Link
            title={
              currentStatus === 'CANCELLED' || currentStatus === 'COMPLETED'
                ? 'No se puede editar una venta finalizada'
                : 'Editar venta'
            }
            to={ROUTES.sales.edit(Number(sale?.id))}
            className={`px-4 md:px-6 py-3 md:py-2.5 font-bold rounded-2xl transition text-xs flex items-center justify-center gap-2 flex-1 md:flex-none ${
              currentStatus === 'CANCELLED' || currentStatus === 'COMPLETED'
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed pointer-events-none border border-white/5'
                : 'bg-indigo-600 text-white hover:bg-indigo-500 hover:-translate-y-0.5 cursor-pointer shadow-[0_0_20px_rgba(79,70,229,0.4)] border border-indigo-500/30'
            }`}
          >
            <PencilIcon className="w-3.5 h-3.5 md:w-4 md:h-4" />
            Editar venta
          </Link>
        </div>
      </div>
    </div>
  );
}

