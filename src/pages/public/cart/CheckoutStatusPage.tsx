import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useCart } from '@/context/CartContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  UserIcon,
  ExclamationTriangleIcon, // Agregamos este icono para el pago abandonado
} from '@heroicons/react/24/outline';

export default function CheckoutStatus() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const [search, setSearch] = useState('');

  // Parámetros de Mercado Pago
  const status = searchParams.get('status');
  const paymentId = searchParams.get('payment_id');
  const externalReference = searchParams.get('external_reference');
  const reason = searchParams.get('reason');
  const [isLatePayment, setIsLatePayment] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const verifySaleStatus = async () => {
      if (status === 'approved' && externalReference) {
        try {
          const API_URL =
            import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
          const res = await fetch(`${API_URL}/sales/${externalReference}`);
          if (res.ok) {
            const saleData = await res.json();
            // SI MP APROBÓ PERO EN NUESTRA DB ESTÁ CANCELADA
            if (saleData.status === 'CANCELLED') {
              setIsLatePayment(true);
            }
          }
        } catch (err) {
          console.error('Error verificando venta:', err);
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };

    verifySaleStatus();
  }, [status, externalReference]);

  // 1. PROTECCIÓN DE RUTA
  useEffect(() => {
    if (!status && !paymentId) {
      navigate('/', { replace: true });
    }
  }, [status, paymentId, navigate]);

  useEffect(() => {
    if (status === 'approved' && clearCart) {
      clearCart();
      // Limpiamos también el timer si el pago fue un éxito
      sessionStorage.removeItem('currentSaleId');
      sessionStorage.removeItem('saleExpiresAt');
      console.log('Pago aprobado: Carrito vaciado y sesión limpia.');
    }
  }, [status, clearCart]);

  // 2. LÓGICA DE UI BASADA EN EL ESTADO DE MERCADO PAGO
  let StatusIcon = CheckCircleIcon;
  let iconColor = 'text-green-500';
  let title = '¡Pago exitoso!';
  let message =
    'Tu orden ha sido registrada y el pago se procesó correctamente.';
  let nextStepsTitle = 'Siguientes pasos';
  let nextStepsMessage =
    'Te enviaremos la confirmación de tu compra y las actualizaciones de envío al correo electrónico que ingresaste.';

  const issue = searchParams.get('issue');

  if (status === 'approved') {
    if (issue === 'stock' || isLatePayment) {
      StatusIcon = ExclamationTriangleIcon;
      iconColor = 'text-amber-500';
      title = 'Pedido en revisión';
      message =
        'Recibimos tu pago, pero hubo una modificación en el estado de tu reserva (posible expiración o cancelación manual).';
      nextStepsTitle = '¿Qué significa esto?';
      nextStepsMessage =
        'Tu dinero está seguro. El administrador verificará el stock manualmente para confirmar tu pedido o realizar el reembolso al instante.';
    } else {
      StatusIcon = CheckCircleIcon;
      iconColor = 'text-green-500';
      title = '¡Pago exitoso!';
    }
  } else if (status === 'rejected') {
    StatusIcon = XCircleIcon;
    iconColor = 'text-red-500';

    if (reason === 'expired') {
      title = 'Reserva expirada';
      message =
        'El tiempo de 10 minutos para completar el pago ha terminado y el stock ha sido liberado.';
      nextStepsTitle = 'Atención';
      nextStepsMessage =
        'Los productos han vuelto al inventario general. Por favor, iniciá el proceso nuevamente desde el carrito.';
    } else if (reason === 'admin_cancel') {
      // Este es el caso cuando cancelás desde el gestor
      StatusIcon = ExclamationTriangleIcon; // Cambiamos a advertencia
      iconColor = 'text-orange-500';
      title = 'Orden cancelada';
      message =
        'Esta orden de compra ha sido cancelada por el sistema o el administrador.';
      nextStepsTitle = '¿Qué pasó?';
      nextStepsMessage =
        'Es posible que el producto ya no esté disponible o hubo un error en los datos. Por favor, contactanos si creés que es un error.';
    } else {
      title = 'El pago fue rechazado';
      message =
        'Hubo un problema al procesar el cobro con tu tarjeta. Por favor, intentá con otro medio de pago.';
      nextStepsTitle = 'Estado de tu reserva';
      nextStepsMessage =
        'Tu reserva sigue activa por unos minutos. Podés intentar completar el pago con otro medio antes de que expire el tiempo.';
    }
  } else if (status === 'null') {
    StatusIcon = ExclamationTriangleIcon;
    iconColor = 'text-orange-500';
    title = 'Pago incompleto';
    message =
      'Cancelaste el proceso de pago. Podés volver al checkout e intentarlo de nuevo (tu reserva sigue activa hasta que expire el tiempo).';
    nextStepsTitle = '¿Tuviste algún problema?';
    nextStepsMessage =
      'Tu reserva sigue activa por unos minutos. Podés intentar completar el pago con otro medio o revisar tus datos de facturación.';
  } else if (status === 'pending' || status === 'in_process') {
    StatusIcon = ClockIcon;
    iconColor = 'text-yellow-500';
    title = 'Pago pendiente';
    message =
      'Estamos esperando la confirmación de Mercado Pago. Te avisaremos cuando se acredite.';
    nextStepsTitle = 'Confirmación en camino';
    nextStepsMessage =
      'En cuanto Mercado Pago nos notifique la acreditación, te enviaremos el comprobante por correo.';
  }

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen w-full bg-[#f1f3f5] items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#16a34a]"></div>
        <p className="mt-4 text-gray-600 font-lato">
          Verificando estado de la orden...
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen w-full bg-[#f1f3f5] font-domine">
      <Navbar search={search} setSearch={setSearch} />

      <div className="flex-grow flex items-center justify-center p-4">
        <div className="bg-white p-8 md:p-10 rounded-2xl shadow-sm border border-gray-200 max-w-lg w-full text-center font-lato animate-in fade-in zoom-in duration-500">
          <div className="flex justify-center mb-6">
            <StatusIcon
              className={`w-24 h-24 ${iconColor}`}
              strokeWidth={1.5}
            />
          </div>

          <h1 className="text-3xl font-bold text-gray-800 mb-4">{title}</h1>
          <p className="text-gray-600 text-[1.05rem] mb-8 leading-relaxed">
            {message}
          </p>

          {/* SECCIÓN DE DATOS DEL PAGO Y CLIENTE */}
          {(paymentId || externalReference) && (
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-5 mb-8 text-left text-sm space-y-4">
              {/* Datos de la Orden */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Detalles de la Operación
                </h3>
                {externalReference && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Orden:</span>
                    <span className="font-mono font-bold text-gray-700">
                      #{externalReference}
                    </span>
                  </div>
                )}
                {paymentId && paymentId !== 'null' && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Comprobante MP:</span>
                    <span className="font-mono text-gray-700">{paymentId}</span>
                  </div>
                )}
              </div>

              {/* Info de Entrega - TEXTO CORREGIDO */}
              <div className="pt-3 border-t border-gray-200">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                  {nextStepsTitle}
                </h3>
                <div className="flex items-start gap-3">
                  <UserIcon className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
                  <div className="text-gray-600 italic">{nextStepsMessage}</div>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            {(status === 'rejected' || status === 'null') && (
              <button
                onClick={() => navigate('/checkout')}
                className="flex-1 py-3 px-4 bg-[#2f3027] text-white font-bold rounded-xl hover:bg-black transition cursor-pointer"
              >
                Volver al checkout
              </button>
            )}
            <button
              onClick={() => (window.location.href = '/catalogo')}
              className={`flex-1 py-3 px-4 font-bold rounded-xl transition shadow-sm cursor-pointer ${
                status === 'rejected' || status === 'null'
                  ? 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  : 'bg-[#16a34a] text-white hover:bg-[#15803d] shadow-[0_0_20px_rgba(22,163,74,0.3)] hover:shadow-[0_0_25px_rgba(22,163,74,0.4)] active:scale-[0.98]'
              }`}
            >
              Volver a la tienda
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
