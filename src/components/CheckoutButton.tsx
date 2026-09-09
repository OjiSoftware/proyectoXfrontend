import { useState, memo, useEffect } from 'react';
import { initMercadoPago, Wallet } from '@mercadopago/sdk-react';
import { Loader2, CreditCard, LockKeyhole } from 'lucide-react';
import { toast } from 'react-hot-toast';

initMercadoPago(import.meta.env.VITE_MP_PUBLIC_KEY, { locale: 'es-AR' });

function CheckoutButton({
  saleId: initialSaleId,
  clientData,
  items,
  total,
  onOrderCreated,
  disabled = false,
}: {
  saleId: number | null;
  clientData?: any;
  items?: any[];
  total?: number;
  onOrderCreated?: (id: number) => void;
  disabled?: boolean;
}) {
  const [preferenceId, setPreferenceId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentSaleId, setCurrentSaleId] = useState<number | null>(
    initialSaleId,
  );
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

  const handleGeneratePayment = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (disabled) return; // Validación extra de seguridad

    setLoading(true);
    try {
      const payload = currentSaleId
        ? { saleId: currentSaleId }
        : { clientData, items, total };

      const res = await fetch(`${API_URL}/payments/create-preference`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(
          () => (
            <span>
              {data.error === 'Stock insuficiente' ? (
                <>
                  Lo sentimos,{' '}
                  <b className="font-black underline">
                    {data.details?.replace('Stock insuficiente para ', '') ||
                      'un producto'}
                  </b>{' '}
                  no tiene stock suficiente.
                </>
              ) : (
                data.details || data.error || 'Error al procesar'
              )}
            </span>
          ),
          {
            style: {
              backgroundColor: '#f44336',
              color: 'white',
              fontSize: '14px',
              maxWidth: '400px',
            },
            duration: 5000,
          },
        );

        setLoading(false);
        return;
      }

      if (data.preferenceId) {
        setPreferenceId(data.preferenceId);

        if (data.saleId && !currentSaleId) {
          setCurrentSaleId(data.saleId);
          onOrderCreated?.(data.saleId);
        }

        toast.success('¡Stock reservado! Procediendo al pago...', {
          style: { backgroundColor: '#4caf50', color: 'white' },
          duration: 2000,
        });
      }
    } catch (error) {
      console.error('❌ ERROR AL GENERAR PAGO:', error);
      toast.error('Error de conexión con el servidor.', {
        style: { backgroundColor: '#f44336', color: 'white' },
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialSaleId && !preferenceId && !disabled) {
      const fetchExistingPreference = async () => {
        setLoading(true);
        try {
          // Llamamos al MISMO endpoint, pero pasando solo el saleId
          const res = await fetch(`${API_URL}/payments/create-preference`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ saleId: initialSaleId }),
          });

          if (res.ok) {
            const data = await res.json();
            if (data.preferenceId) {
              setPreferenceId(data.preferenceId);
            }
          }
        } catch (error) {
          console.error('Error recuperando preferencia:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchExistingPreference();
    }
  }, [initialSaleId, preferenceId, disabled, API_URL]);

  const isRecovering = initialSaleId && !preferenceId && !disabled;

  return (
    <div className="w-full mt-6 border-t border-gray-100 pt-6">
      {loading || isRecovering ? (
        <div className="w-full flex items-center justify-center gap-2 font-semibold py-3.5 px-6 rounded-xl bg-gray-100 text-gray-500 animate-pulse">
          <Loader2 className="animate-spin h-5 w-5" />
          {/* Texto dinámico según el estado */}
          <span>
            {isRecovering
              ? 'Recuperando sesión de pago...'
              : 'Verificando disponibilidad...'}
          </span>
        </div>
      ) : !preferenceId ? (
        <button
          onClick={handleGeneratePayment}
          // --- USAMOS EL DISABLED DE LAS PROPS ---
          disabled={loading || disabled}
          type="button"
          className={`w-full flex items-center justify-center gap-2 font-semibold py-3.5 px-6 rounded-xl shadow-sm transition-all
                        ${
                          loading || disabled
                            ? 'bg-gray-400 text-white opacity-70 cursor-not-allowed'
                            : 'bg-[#16a34a] hover:bg-[#15803d] text-white cursor-pointer shadow-[0_0_20px_rgba(22,163,74,0.3)] hover:shadow-[0_0_25px_rgba(22,163,74,0.4)] active:scale-[0.98]'
                        }
                    `}
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin h-5 w-5" />
              <span>Verificando disponibilidad...</span>
            </>
          ) : disabled ? (
            <>
              <LockKeyhole className="w-5 h-5" />
              <span>Tiempo de reserva expirado</span>
            </>
          ) : (
            <>
              <CreditCard className="w-5 h-5" />
              <span>Pagar de forma segura</span>
            </>
          )}
        </button>
      ) : (
        <div className="w-full animate-in fade-in slide-in-from-bottom-2 duration-500 bg-gray-50/50 p-4 rounded-xl border border-gray-200">
          {disabled ? (
            <div className="text-center py-4 text-gray-500 font-lato">
              <LockKeyhole className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p>El tiempo para pagar ha expirado.</p>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-500 text-center mb-3 font-lato">
                Elegí tu método de pago preferido en:
              </p>
              <Wallet initialization={{ preferenceId }} />
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default memo(CheckoutButton);
