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
  ExclamationTriangleIcon,
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

  useEffect(() => {
    if (!status && !paymentId) {
      navigate('/', { replace: true });
    }
  }, [status, paymentId, navigate]);

  useEffect(() => {
    if (status === 'approved' && clearCart) {
      clearCart();
      sessionStorage.removeItem('currentSaleId');
      sessionStorage.removeItem('saleExpiresAt');
    }
  }, [status, clearCart]);

  let StatusIcon = CheckCircleIcon;
  let iconColor = 'text-[#2b99a6]';
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
      iconColor = 'text-[#2b99a6]';
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
      StatusIcon = ExclamationTriangleIcon;
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
    iconColor = 'text-amber-500';
    title = 'Pago pendiente';
    message =
      'Estamos esperando la confirmación de Mercado Pago. Te avisaremos cuando se acredite.';
    nextStepsTitle = 'Confirmación en camino';
    nextStepsMessage =
      'En cuanto Mercado Pago nos notifique la acreditación, te enviaremos el comprobante por correo.';
  }

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen w-full bg-[linear-gradient(180deg,#d8f3f5_0%,#ffffff_420px,#ffffff_100%)] items-center justify-center font-nunito">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-t-transparent border-[#33aab8]"></div>
        <p className="mt-4 text-[#2b99a6] font-bold">
          Verificando estado de la orden...
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen w-full bg-[linear-gradient(180deg,#d8f3f5_0%,#ffffff_420px,#ffffff_100%)] font-nunito text-[#1A2D2A]">
      <Navbar search={search} setSearch={setSearch} />

      <div className="flex-grow flex items-center justify-center p-4 py-10">
        <div className="relative overflow-hidden bg-white p-8 md:p-10 rounded-3xl shadow-md border border-[#D5F3F4] max-w-lg w-full text-center font-nunito">
          <div className="pointer-events-none absolute -right-12 -top-12 w-40 h-40 rounded-full bg-[#FFF6B8]/40" />
          <div className="relative flex justify-center mb-5">
            <div className="bg-[#F4FBFB] p-4 rounded-3xl border border-[#D5F3F4] shadow-xs">
              <StatusIcon
                className={`w-16 h-16 ${iconColor}`}
                strokeWidth={1.8}
              />
            </div>
          </div>

          <h1 className="relative text-2xl md:text-3xl font-bold font-fredoka text-[#2b99a6] mb-3">{title}</h1>
          <p className="relative text-[#3d635f] text-base mb-8 leading-relaxed font-nunito">
            {message}
          </p>

          {(paymentId || externalReference) && (
            <div className="relative bg-[#F4FBFB] border border-[#D5F3F4] rounded-2xl p-5 mb-8 text-left text-sm space-y-4">
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-[#2b99a6] uppercase tracking-wider">
                  Detalles de la Operación
                </h3>
                {externalReference && (
                  <div className="flex justify-between">
                    <span className="text-[#3d635f]">Orden:</span>
                    <span className="font-mono font-bold text-[#1A2D2A]">
                      #{externalReference}
                    </span>
                  </div>
                )}
                {paymentId && paymentId !== 'null' && (
                  <div className="flex justify-between">
                    <span className="text-[#3d635f]">Comprobante MP:</span>
                    <span className="font-mono text-[#1A2D2A]">{paymentId}</span>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-[#D5F3F4]">
                <h3 className="text-xs font-bold text-[#2b99a6] uppercase tracking-wider mb-2">
                  {nextStepsTitle}
                </h3>
                <div className="flex items-start gap-3">
                  <UserIcon className="w-5 h-5 text-[#2b99a6] mt-0.5 shrink-0" />
                  <div className="text-[#3d635f]">{nextStepsMessage}</div>
                </div>
              </div>
            </div>
          )}

          <div className="relative flex flex-col sm:flex-row gap-3">
            {(status === 'rejected' || status === 'null') && (
              <button
                onClick={() => navigate('/checkout')}
                className="flex-1 py-3 px-5 bg-[#FFF6B8] hover:bg-[#FFF29C] text-[#1A2D2A] font-bold rounded-full transition cursor-pointer shadow-xs"
              >
                Volver al checkout
              </button>
            )}
            <button
              onClick={() => (window.location.href = '/catalogo')}
              className="flex-1 py-3 px-5 font-bold rounded-full transition shadow-[0_5px_0_rgba(26,45,42,0.12)] cursor-pointer bg-[#33aab8] text-white hover:bg-[#2b99a6]"
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
